import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  explicarVeredictoLocal,
  lineasDePruebas,
  parseDefensa,
  parseGuiaVeredicto,
} from "./retos-parse.ts";
import type { RunResult, TestResult } from "../ejecucion/tipos.ts";
import { todasPasadas } from "../ejecucion/pruebas.ts";

/**
 * La prueba del modelo en los retos (0.4.C/D): la respuesta del modelo nunca cambia el
 * veredicto. Aquí no se llama a ningún proveedor: lo que se comprueba es el contrato, porque
 * el veredicto sale —y solo puede salir— de `todasPasadas` sobre el `RunResult` real.
 */

const guiaSana = `{
  "resumen": "La función dobla n con el operador * y aquí va lo que la ejecución dijo, prueba por prueba.",
  "constata": [
    { "texto": "La prueba de salida cayó: dominó 7 e imprimió A: 7, no A: 14.", "procedencia": "prueba" },
    { "texto": "El nombre de la función es corto y directo.", "procedencia": "opinion" }
  ],
  "siNoPasa": "Mira la operación que usas para doblar: la prueba pide 14 y salió 7."
}`;

/** La respuesta traidora que el documento pide probar: el modelo «aprueba» código que falla. */
const respuestaQueAprueba = `{
  "veredicto": "superado",
  "resumen": "El código es correcto: dobla el número como pide el enunciado.",
  "constata": [{ "texto": "La prueba del doble salió bien.", "procedencia": "prueba" }],
  "siNoPasa": ""
}`;

/** Un `RunResult` real con las pruebas caídas: la entrega sobre la que el modelo no manda. */
function runFallido(): RunResult {
  const pruebas: TestResult[] = [
    { id: "r1-salida", pasada: false, obtenido: "A: 7", esperado: "A: 14" },
    { id: "r1-resultado", pasada: false, obtenido: "7", esperado: "14" },
  ];
  return {
    estado: "ok",
    stdout: "A: 7\n",
    stderr: "",
    duracionMs: 42,
    pruebas,
    motor: { nombre: "javascript", version: "n/d" },
    origen: "ejecucion-real",
  };
}

describe("el veredicto no lo da el modelo (0.4.C)", () => {
  it("todasPasadas de la corrida cae: este es el veredicto que manda", () => {
    assert.equal(todasPasadas(runFallido()), false);
  });

  it("una respuesta que intenta declarar el veredicto se rechaza entera", () => {
    const explicado = explicarVeredictoLocal(false, respuestaQueAprueba);
    assert.equal(explicado.ok, false);
    if (!explicado.ok) assert.ok(explicado.error.includes("no en la forma esperada"));
  });

  it("la guía aceptada no toca el booleano aunque su texto se lía", () => {
    const explicado = explicarVeredictoLocal(false, guiaSana);
    assert.equal(explicado.ok, true);
    if (explicado.ok) {
      assert.equal(explicado.superado, false, "la ejecución no pasó; la guía no puede convertirla en pasada");
      assert.equal(explicado.resultadoDe, "pruebas");
    }
  });

  it("la guía sana entra completa, con cada constata etiquetada", () => {
    const guia = parseGuiaVeredicto(guiaSana);
    assert.ok(guia);
    assert.equal(guia.constata.length, 2);
    assert.equal(guia.constata[0].procedencia, "prueba");
    assert.equal(guia.constata[1].procedencia, "opinion");
    assert.ok(guia.siNoPasa.length > 0);
  });

  it("sin constata no hay guía: no se acepta un eco vacío", () => {
    const rota = guiaSana.replace(/"constata": \[[\s\S]*?\],/, '"constata": [],');
    assert.equal(parseGuiaVeredicto(rota), null);
  });

  it("acepta la respuesta dentro de un bloque de código acotado", () => {
    assert.ok(parseGuiaVeredicto("```json\n" + guiaSana + "\n```"));
  });

  it("las pruebas llegan al prompt con su nombre y lo que salió, prueba por prueba", () => {
    const lineas = lineasDePruebas([
      { id: "r1-salida", nombre: "imprime lo que calcula", pasada: false, obtenido: "A: 7" },
      { id: "r1-resultado", nombre: "devuelve el resultado del caso A", pasada: true },
    ]);
    assert.equal(lineas.length, 2);
    assert.ok(lineas[0].includes("imprime lo que calcula"));
    assert.ok(lineas[0].includes("no pasó") && lineas[0].includes("A: 7"));
    assert.ok(lineas[1].includes("devuelve el resultado del caso A") && lineas[1].includes("pasó"));
  });
});

describe("la defensa (0.4.D): el modelo juzga si se entiende, nada más", () => {
  const entrada = `{"juicios": [
    { "entendido": true, "comentario": "Nombra el for y el acumulador con sus palabras." },
    { "entendido": false, "comentario": "Repite el enunciado, sin tocar el código." }
  ]}`;

  it("un juicio por pregunta, en orden, con su comentario", () => {
    const juicios = parseDefensa(entrada, 2);
    assert.ok(juicios);
    assert.equal(juicios.length, 2);
    assert.deepEqual(
      juicios.map((juicio) => juicio.entendido),
      [true, false],
    );
  });

  it("una respuesta sin entender basta para la marca de repaso", () => {
    const juicios = parseDefensa(entrada, 2);
    assert.ok(juicios);
    assert.equal(
      juicios.every((juicio) => juicio.entendido),
      false,
    );
  });

  it("el número tiene que cuadrar: ni más ni menos juicios que preguntas", () => {
    const corta = `{"juicios": [{ "entendido": true, "comentario": "bien." }]}`;
    assert.equal(parseDefensa(corta, 2), null);
    assert.ok(parseDefensa(corta, 1));
  });

  it("sin comentario no hay juicio: un sí seco no demuestra comprensión", () => {
    const entrada = `{"juicios": [{ "entendido": true, "comentario": "" }]}`;
    assert.equal(parseDefensa(entrada, 1), null);
  });
});
