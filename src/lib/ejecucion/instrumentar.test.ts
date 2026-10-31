import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { instrumentar, prefijoInstrumento } from "./instrumentar.ts";

type Paso = { tipo: "paso"; linea: number; variables: Record<string, string> };
type Retorno = { tipo: "retorno"; linea: number; valor: string };
type Evento = Paso | Retorno;

/**
 * El código instrumentado se corre de verdad con un instrumento de juguete: el escáner no
 * promete marcas de la nada, las que crea tienen que ejecutarse y producir eventos.
 */
function correr(codigo: string, trazar = true): { eventos: Evento[]; instrumentable: boolean } {
  const eventos: Evento[] = [];
  const { codigo: instrumentado, instrumentable } = instrumentar(codigo, { trazar });
  const instrumento = {
    paso(linea: number, vars: Array<{ nom: string; val: () => unknown }>) {
      const variables: Record<string, string> = {};
      for (const { nom, val } of vars) {
        try {
          variables[nom] = String(val());
        } catch {
          // fuera de alcance o temporalmente muerto: se descarta, nunca se inventa
        }
      }
      eventos.push({ tipo: "paso", linea, variables });
    },
    retorno(linea: number, valor: unknown) {
      eventos.push({ tipo: "retorno", linea, valor: String(valor) });
      return valor;
    },
  };
  new Function(prefijoInstrumento, instrumentado)(instrumento);
  return { eventos, instrumentable };
}

const pasos = (eventos: Evento[]) => eventos.filter((e): e is Paso => e.tipo === "paso");
const retornos = (eventos: Evento[]) => eventos.filter((e): e is Retorno => e.tipo === "retorno");

describe("instrumentar", () => {
  it("no cambia el número de líneas del programa", () => {
    const codigo = "let a = 1;\nlet b = 2;\nlet c = a + b;\n";
    const { codigo: instrumentado } = instrumentar(codigo, { trazar: true });
    assert.equal(instrumentado.split("\n").length, codigo.split("\n").length);
  });

  it("anota cada sentencia con su línea y sus variables ya calculadas", () => {
    const { eventos } = correr("let a = 1;\nlet b = 2;\nlet c = a + b;\n");
    const pasos_ = pasos(eventos);
    assert.deepEqual(
      pasos_.map((p) => p.linea),
      [1, 2, 3],
    );
    // En la línea 2 `a` ya calculada; en la 3, las dos. `c` aún no: se descarta, no se inventa.
    assert.equal(pasos_[1].variables["a"], "1");
    assert.equal(pasos_[2].variables["a"], "1");
    assert.equal(pasos_[2].variables["b"], "2");
    assert.ok(!("c" in pasos_[2].variables));
  });

  it("anota también sentencias separadas solo por salto de línea, sin punto y coma", () => {
    const { eventos } = correr("let a = 1\nlet b = a + 1\nlet c = b * 2\n");
    const pasos_ = pasos(eventos);
    assert.deepEqual(
      pasos_.map((p) => p.linea),
      [1, 2, 3],
    );
    assert.equal(pasos_[2].variables["b"], "2");
  });

  it("no corta una sentencia de varias líneas por los saltos de en medio", () => {
    const codigo = [
      "let a = 0;",
      "let b = 1 +",
      "      2;",
      "let c = a",
      "      + b;",
    ].join("\n");
    const { eventos } = correr(codigo);
    const pasos_ = pasos(eventos);
    assert.deepEqual(
      pasos_.map((p) => p.linea),
      [1, 2, 4],
    );
    assert.equal(pasos_[2].variables["b"], "3");
  });

  it("envuelve el cuerpo sin llaves de un if y de un else", () => {
    const codigo = "let a = 1;\nlet marcas = [];\nif (a > 0)\n  marcas.push(\"positivo\");\nelse\n  marcas.push(\"negativo\");\n";
    const { eventos, instrumentable } = correr(codigo);
    assert.equal(instrumentable, true);
    const lineasConPaso = pasos(eventos).map((p) => p.linea);
    // Solo corre el camino del if: la marca del else está en el código, no en el rastro.
    assert.ok(lineasConPaso.includes(4), `no hay paso en la línea del cuerpo del if: ${lineasConPaso}`);
    const { codigo: instrumentado } = instrumentar(codigo, { trazar: true });
    assert.ok(instrumentado.includes(`${prefijoInstrumento}.paso(6`), "el cuerpo del else no quedó anotado");
  });

  it("no rompe un do-while y traza su cuerpo a cada vuelta", () => {
    const { eventos } = correr("let n = 0;\ndo {\n  n = n + 1;\n} while (n < 3);\nlet fin = n;\n");
    const pasos_ = pasos(eventos);
    const linea3 = pasos_.filter((p) => p.linea === 3);
    assert.equal(linea3.length, 3, "el cuerpo del do corre tres veces");
    const ultimo = pasos_.at(-1)!;
    assert.equal(ultimo.variables["n"], "3");
  });

  it("registra el evento de retorno con su valor y su línea", () => {
    const codigo = "function clasificar(n) {\n  if (n > 10) {\n    return \"grande\";\n  }\n  return \"pequeño\";\n}\nlet r = clasificar(50);\n";
    const { eventos } = correr(codigo);
    const retornos_ = retornos(eventos);
    assert.equal(retornos_.length, 1);
    assert.equal(retornos_[0].linea, 3);
    assert.equal(retornos_[0].valor, "grande");
    const pasos_ = pasos(eventos);
    assert.ok(pasos_.some((p) => p.linea === 7), "la llamada también se anota");
  });

  it("no anota dentro de la expresión de una plantilla", () => {
    const { eventos, instrumentable } = correr("let n = 2;\nlet texto = `n es ${n + 1}`;\n");
    assert.equal(instrumentable, true);
    const pasos_ = pasos(eventos);
    assert.deepEqual(
      pasos_.map((p) => p.linea),
      [1, 2],
    );
  });

  it("distingue una división de un literal de expresión regular", () => {
    const codigo = "let a = 8;\nlet media = a / 2;\nlet rx = /a\\/b/.test(\"a/b\");\nlet sale = String(media) + \"-\" + String(rx);\n";
    const { eventos } = correr(codigo);
    const ultimo = pasos(eventos).at(-1)!;
    assert.equal(ultimo.variables["media"], "4");
    assert.equal(ultimo.variables["rx"], "true");
  });

  it("no ve sentencias dentro de cadenas ni de comentarios", () => {
    const codigo = [
      "let a = 1; // comentario { x = 2; }",
      "/* bloque",
      "   con { y = 3; } dentro */",
      "let b = a + 4;",
    ].join("\n");
    const { eventos } = correr(codigo);
    assert.deepEqual(
      pasos(eventos).map((p) => p.linea),
      [1, 4],
    );
  });

  it("si el código ya usa el prefijo del instrumento, no lo toca", () => {
    const codigo = "let _cifra = 1;\nlet b = _cifra + 1;";
    const { codigo: instrumentado, instrumentable } = instrumentar(codigo, { trazar: true });
    assert.equal(instrumentable, false);
    assert.equal(instrumentado, codigo);
  });

  it("sin traza anota los pasos pero no entrega valores ni retornos", () => {
    const { eventos } = correr(
      "function f(x) {\n  return x * 2;\n}\nlet r = f(21);\n",
      false,
    );
    const pasos_ = pasos(eventos);
    assert.ok(pasos_.length > 0);
    for (const p of pasos_) assert.deepEqual(p.variables, {});
    assert.equal(retornos(eventos).length, 0);
  });

  it("un documento vacío queda igual y se considera instrumentable", () => {
    const { codigo, instrumentable } = instrumentar("   \n", { trazar: true });
    assert.equal(codigo, "   \n");
    assert.equal(instrumentable, true);
  });

  it("traza un bucle for sin confundir sus puntos y coma con sentencias", () => {
    const codigo = "let suma = 0;\nfor (let i = 0; i < 3; i++) {\n  suma = suma + i;\n}\nlet resumen = suma;\n";
    const { eventos } = correr(codigo);
    const pasostercer = pasos(eventos).filter((p) => p.linea === 3);
    assert.equal(pasostercer.length, 3, "el cuerpo del for corre tres veces");
    const ultimo = pasos(eventos).at(-1)!;
    // El paso se anota antes de la sentencia: `suma` final se lee en la línea siguiente.
    assert.equal(ultimo.variables["resumen"], undefined);
    assert.equal(ultimo.variables["suma"], "3");
  });

  it("traza el cuerpo de una función flecha con bloque", () => {
    const codigo = "let nombres = [3, 1];\nlet dobles = nombres.map((n) => {\n  return n * 10;\n});\nlet fin = dobles.length;\n";
    const { eventos } = correr(codigo);
    const ret = retornos(eventos);
    assert.ok(ret.some((r) => r.valor === "30"), `no se registró el retorno interno: ${JSON.stringify(ret)}`);
    const ultimo = pasos(eventos).at(-1)!;
    // El paso va antes de la sentencia: `dobles` ya existe, `fin` aún no se declara.
    assert.equal(ultimo.variables["dobles"], "30,10");
    assert.ok(!("fin" in ultimo.variables));
  });
});
