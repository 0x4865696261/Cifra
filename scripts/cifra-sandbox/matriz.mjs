import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { setTimeout as pausa } from "node:timers/promises";
import { lenguajesAlgoritmo } from "../../src/lib/ejecucion/catalogo.ts";
import { planProceso, librosEjemplo } from "../../src/lib/ejecucion/plan-juez.server.ts";
import { interpretarCorridas } from "../../src/lib/ejecucion/veredicto-juez.ts";
import { casosDeReto } from "../../src/lib/retos/casos-juez.server.ts";
import { firmas } from "../../src/lib/retos/firmas.ts";
import { plantillaAlgoritmo } from "../../src/lib/retos/plantillas.ts";
import { enSandbox } from "../../src/lib/ejecucion/sandbox.server.ts";

const semilla = "0123456789abcdef0123456789abcdef";
const local = process.argv.includes("--local");
const filtro = process.argv
  .find((arg) => arg.startsWith("--lenguajes="))
  ?.slice(12)
  .split(",");
if (filtro?.some((id) => ![...lenguajesAlgoritmo, "sql", "web"].includes(id))) {
  throw new Error("El filtro contiene un lenguaje desconocido.");
}
const snapshot = process.env.CIFRA_SANDBOX_SNAPSHOT;
if (!local && !snapshot) throw new Error("Configura CIFRA_SANDBOX_SNAPSHOT.");

const solo = process.argv.includes("--smoke") ? ["bucles-dos"] : Object.keys(firmas);

function codigoDeControl(lenguaje, firma, esperado) {
  const lista = firma.devuelve === "textos" ? esperado.split("\x1f") : null;
  const js =
    firma.devuelve === "texto"
      ? JSON.stringify(esperado)
      : lista
        ? JSON.stringify(lista)
        : esperado;
  const elementos = lista?.map((s) => JSON.stringify(s)).join(", ");
  const plantilla = plantillaAlgoritmo(lenguaje, firma);
  switch (lenguaje) {
    case "javascript":
      return plantilla.replace("// Escribe tu solución aquí.", "return " + js + ";");
    case "typescript":
      return plantilla.replace('throw new Error("Completa la función");', "return " + js + ";");
    case "python":
      return plantilla.replace(
        'raise NotImplementedError("Completa la función")',
        "return " + (firma.devuelve === "booleano" ? (esperado === "true" ? "True" : "False") : js),
      );
    case "ruby":
      return plantilla.replace('raise "Completa la función"', "return " + js);
    case "php":
      return plantilla.replace(
        'throw new RuntimeException("Completa la función");',
        "return " + js + ";",
      );
    case "rust":
      return plantilla.replace(
        'todo!("Completa la función")',
        lista
          ? "vec![" + lista.map((s) => JSON.stringify(s) + ".to_owned()").join(", ") + "]"
          : firma.devuelve === "texto"
            ? js + ".to_owned()"
            : js,
      );
    case "go":
      return plantilla.replace(
        'panic("Completa la función")',
        "return " + (lista ? "[]string{" + elementos + "}" : js),
      );
    case "c":
      return plantilla.replace(
        "// Escribe tu solución aquí.\n    abort();",
        lista
          ? "static const char *datos[] = {" +
              elementos +
              "};\n    return (CifraTextos){ datos, " +
              lista.length +
              " };"
          : "return " + js + ";",
      );
    case "cpp":
      return plantilla.replace(
        'throw std::logic_error("Completa la función");',
        "return " + (lista ? "{" + elementos + "}" : js) + ";",
      );
    case "java":
      return plantilla.replace(
        'throw new UnsupportedOperationException("Completa la función");',
        "return " + (lista ? "new String[]{" + elementos + "}" : js) + ";",
      );
    case "csharp":
      return plantilla.replace(
        'throw new NotImplementedException("Completa la función");',
        "return " + (lista ? "new string[]{" + elementos + "}" : js) + ";",
      );
  }
}

function localProceso(plan) {
  const raiz = realpathSync(tmpdir());
  const cwd = mkdtempSync(join(raiz, "cifra-matriz-"));
  try {
    for (const [nombre, contenido] of Object.entries(plan.archivos))
      writeFileSync(join(cwd, nombre), contenido);
    const llamar = ([cmd, ...args], entrada = "") => {
      if (cmd === "node") cmd = process.execPath;
      if (process.platform === "win32") {
        if (cmd === "python3") cmd = "python";
        if (cmd === "./main") cmd = join(cwd, "main.exe");
        const destino = args.indexOf("-o");
        if (destino >= 0 && args[destino + 1] === "main") args[destino + 1] = "main.exe";
      }
      args = args.map((a) => {
        if (a.startsWith("/opt/cifra/node_modules/")) return resolve(a.replace("/opt/cifra/", ""));
        if (a === "/opt/cifra/sql.py") return resolve("scripts/cifra-sandbox/sql.py");
        return a;
      });
      const respuesta = spawnSync(cmd, args, {
        cwd,
        input: entrada,
        encoding: "utf8",
        timeout: 120_000,
        windowsHide: true,
      });
      if (respuesta.error) throw respuesta.error;
      return {
        estado: respuesta.status === 0 ? "ok" : "error",
        stdout: respuesta.stdout,
        stderr: respuesta.stderr,
      };
    };
    const compilacion = plan.compilar && llamar(plan.compilar);
    if (compilacion && compilacion.estado !== "ok") return { compilacion, corridas: [] };
    return {
      compilacion: null,
      corridas: plan.casos.map((c) => llamar([...plan.ejecutar, ...c.args], c.entrada)),
    };
  } finally {
    const destino = realpathSync(cwd);
    if (dirname(destino) !== raiz || !basename(destino).startsWith("cifra-matriz-")) {
      throw new Error("Directorio de pruebas inesperado.");
    }
    try {
      rmSync(destino, { recursive: true, force: true, maxRetries: 4, retryDelay: 100 });
    } catch (error) {
      if (process.platform !== "win32" || error.code !== "EPERM") throw error;
      console.warn("Windows mantiene abierto el directorio temporal: " + destino);
    }
  }
}

let total = 0;
for (const lenguaje of lenguajesAlgoritmo) {
  if (filtro && !filtro.includes(lenguaje)) continue;
  for (const id of solo) {
    const firma = firmas[id];
    const casos = casosDeReto(id, semilla, firma, true);
    const primero = casos[0];
    const distinto = casos.find((caso) => caso.esperado !== primero.esperado);
    // Si todas las variantes dan la misma salida, una comparación negativa sigue
    // comprobando que ese runtime jamás dé por válida una respuesta diferente.
    const incorrecto = distinto ?? { ...primero, esperado: "__cifra_salida_incorrecta__" };
    const seleccion = [primero, { ...incorrecto, id: "oculto-control", visible: false }];
    const codigo = codigoDeControl(lenguaje, firma, primero.esperado);
    const pedido = { modo: "enviar", lenguaje, codigo };
    const plan = planProceso({ ...pedido, firma, casos: seleccion });
    const salida = local ? localProceso(plan) : await enSandbox(snapshot, plan);
    const veredicto = interpretarCorridas(pedido, salida, seleccion, true, 0);
    assert.equal(veredicto.ok, true);
    assert.equal(
      veredicto.resultado.pruebas[0].pasada,
      true,
      lenguaje + " / " + id + " / " + JSON.stringify(salida),
    );
    assert.equal(veredicto.resultado.pruebas[1].pasada, false);
    assert.equal(veredicto.superado, false);
    assert.equal(veredicto.resultado.pruebas[1].esperado, undefined);
    total++;
    if (!local) await pausa(3200);
  }
  console.log(lenguaje + ": " + solo.length + " pares de control correctos");
}
if (!filtro || filtro.includes("sql")) {
  const codigo = "SELECT titulo FROM libros WHERE paginas > 100 ORDER BY titulo;";
  const pedido = { modo: "enviar", lenguaje: "sql", codigo };
  const casos = [
    {
      id: "A",
      visible: true,
      args: [JSON.stringify(librosEjemplo)],
      esperado: '[["Luz"],["Mar"]]',
    },
    {
      id: "oculto-1",
      visible: false,
      args: ['[["Z",101],["B",100],["A",107]]'],
      esperado: '[["A"],["Z"]]',
    },
  ];
  const plan = planProceso({ ...pedido, casos });
  const salida = local ? localProceso(plan) : await enSandbox(snapshot, plan);
  assert.equal(interpretarCorridas(pedido, salida, casos, true, 0).superado, true);
  console.log("SQLite: datos visibles y privados verificados");
}
if (!local && (!filtro || filtro.includes("web"))) {
  const codigo = '<article class="tarjeta"><h2>Cifra</h2><p>Contenido</p></article>';
  const pedido = {
    modo: "enviar",
    lenguaje: "web",
    codigo,
    css: ".tarjeta { background: #f0f4ff; padding: 16px; }",
  };
  const casos = [{ id: "A", visible: true, args: [], esperado: "" }];
  const salida = await enSandbox(snapshot, planProceso({ ...pedido, casos }));
  assert.equal(interpretarCorridas(pedido, salida, casos, true, 0).superado, true);
  console.log("HTML/CSS: estructura y estilos verificados");
}
console.log(total + " combinaciones de algoritmos verificadas");
