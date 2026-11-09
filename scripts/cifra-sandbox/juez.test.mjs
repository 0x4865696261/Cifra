import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { PGlite } from "@electric-sql/pglite";
import { casosDeReto } from "../../src/lib/retos/casos-juez.server.ts";
import { firmas } from "../../src/lib/retos/firmas.ts";
import { definiciones } from "../../src/lib/retos/retos.ts";
import { interpretarCorridas } from "../../src/lib/ejecucion/veredicto-juez.ts";
import { planProceso } from "../../src/lib/ejecucion/plan-juez.server.ts";
import { textoDe } from "../../src/lib/ejecucion/pruebas.ts";
import { solucionTramo, tramosDePrueba } from "../../src/lib/retos/prueba-nivel.ts";

const semilla = "abcdef0123456789abcdef0123456789";
const pedido = { modo: "enviar", lenguaje: "javascript", codigo: "x" };
const corrida = (stdout, stderr = "", estado = "ok") => ({
  estado,
  stdout,
  stderr,
  codigoSalida: 0,
});

test("cada reto usa los ejemplos históricos y reserva casos nuevos al enviar", () => {
  assert.deepEqual(Object.keys(firmas).sort(), definiciones.map((reto) => reto.id).sort());
  for (const [id, firma] of Object.entries(firmas)) {
    const visibles = casosDeReto(id, semilla, firma, false);
    const todos = casosDeReto(id, semilla, firma, true);
    assert.deepEqual(
      todos.filter((c) => c.visible),
      visibles,
    );
    assert.ok(
      todos.some((c) => !c.visible),
      id,
    );
    assert.equal(new Set(todos.map((c) => JSON.stringify(c.args))).size, todos.length, id);
  }
});

test("ejecutar todos los ejemplos correctos no equivale a superar el reto", () => {
  const casos = casosDeReto("bucles-dos", semilla, firmas["bucles-dos"], false);
  const salida = { compilacion: null, corridas: casos.map((c) => corrida(c.esperado + "\n")) };
  const respuesta = interpretarCorridas({ ...pedido, modo: "ejecutar" }, salida, casos, false, 1);
  assert.ok(respuesta.ok);
  assert.equal(respuesta.superado, false);
  assert.ok(respuesta.resultado.pruebas.every((c) => c.pasada));
  assert.equal(respuesta.resultado.pruebas[0].obtenido, casos[0].esperado);
});

test("enviar aprueba solo tras pasar los casos privados y oculta sus valores", () => {
  const casos = casosDeReto("bucles-dos", semilla, firmas["bucles-dos"], true);
  const resultado = interpretarCorridas(
    pedido,
    {
      compilacion: null,
      corridas: casos.map((c) => corrida(c.esperado + "\n", "privado")),
    },
    casos,
    true,
    1,
  );
  assert.ok(resultado.ok);
  assert.equal(resultado.superado, true);
  assert.equal(resultado.resultado.stderr, "");
  assert.equal(resultado.resultado.stdout, "");
  for (const [indice, caso] of casos.entries()) {
    if (!caso.visible)
      assert.deepEqual(resultado.resultado.pruebas[indice], { id: caso.id, pasada: true });
  }
});

test("los errores de compilación, tiempo y salida nunca aprueban", () => {
  const casos = casosDeReto("bucles-dos", semilla, firmas["bucles-dos"], true);
  for (const estado of ["error", "tiempo", "salida-excedida"]) {
    const resultado = interpretarCorridas(
      pedido,
      {
        compilacion: null,
        corridas: casos.map((c) => corrida(c.esperado + "\n", "", estado)),
      },
      casos,
      true,
      1,
    );
    assert.ok(resultado.ok);
    assert.equal(resultado.resultado.estado, estado);
    assert.equal(resultado.superado, false);
  }
  const resultado = interpretarCorridas(
    pedido,
    { compilacion: corrida("", "Error en main.rs:1", "error"), corridas: [] },
    casos,
    true,
    1,
  );
  assert.ok(resultado.ok);
  assert.equal(resultado.resultado.stderr, "Error en main.rs:1");
  assert.equal(resultado.superado, false);
});

test("el arnés de servidor conserva los ocho tramos de la prueba de nivel", () => {
  for (const tramo of tramosDePrueba) {
    const casos = tramo.pruebas.map((prueba) => ({
      id: prueba.id, visible: prueba.visible, args: [prueba.tipo], esperado: textoDe(prueba.esperado),
    }));
    for (const [codigo, esperado] of [[solucionTramo(tramo.id), true], [tramo.codigoDePartida, false]]) {
      const solicitud = { modo: "nivel", lenguaje: "javascript", codigo };
      const plan = planProceso({ ...solicitud, casos, nivel: true });
      const corridas = casos.map(({ args }) => {
        let salida = "";
        runInNewContext(plan.archivos["juez.cjs"], {
          require: () => ({ readFileSync: () => plan.archivos["main.js"] }),
          console: {},
          process: { argv: ["node", "juez.cjs", ...args], stdout: { write: (texto) => { salida += texto; } } },
        }, { timeout: 1000 });
        return corrida(salida);
      });
      assert.equal(interpretarCorridas(solicitud, { compilacion: null, corridas }, casos, true, 0).superado,
        esperado, tramo.id);
    }
  }
});

test("la reserva aplica simultaneidad, cuotas y expiración", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      await readFile(
        new URL("../../migrations/0002_cifra_ejecuciones.sql", import.meta.url),
        "utf8",
      ),
    );
    const reservar = async (cuenta) =>
      (await db.query("select cifra_reservar_ejecucion(gen_random_uuid(), $1) as estado", [cuenta]))
        .rows[0].estado;
    assert.deepEqual(await Promise.all(Array.from({ length: 5 }, () => reservar("uno"))), [
      "ok",
      "ok",
      "ok",
      "ocupado",
      "ocupado",
    ]);
    for (let i = 3; i < 10; i++) {
      await db.exec("update cifra_ejecuciones set finalizada = now()");
      assert.equal(await reservar("uno"), "ok");
    }
    assert.equal(await reservar("uno"), "cuenta");
    await db.exec(
      "update cifra_ejecuciones set creada = now() - interval '25 hours', finalizada = null",
    );
    assert.equal(await reservar("uno"), "ok");
    await db.exec(
      "insert into cifra_ejecuciones select gen_random_uuid(), 'global', now(), now() from generate_series(1, 239)",
    );
    assert.equal(await reservar("dos"), "global");
    await db.exec("update cifra_ejecuciones set creada = now() - interval '31 days'");
    assert.equal(await reservar("dos"), "ok");
  } finally {
    await db.close();
  }
});
