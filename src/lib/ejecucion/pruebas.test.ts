import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import {
  correrPruebasPorTransporte,
  sonIguales,
  textoDe,
  todasPasadas,
} from "./pruebas.ts";
import { liberarHilos, transporteHilo } from "./hiloPrueba.ts";
import { limitesDefecto } from "./limites.ts";
import type { RunRequest, TestSpec } from "./tipos.ts";

/**
 * El ejecutor de pruebas corre cada prueba en su propio hilo: nada aquí inventa un veredicto,
 * todo sale de la misma fuente que la web corre en el Worker del navegador.
 */

after(() => liberarHilos());

function pedido(
  codigo: string,
  pruebas: TestSpec[],
  extra: Partial<RunRequest> = {},
): RunRequest {
  return {
    lenguaje: "javascript",
    codigo,
    limites: limitesDefecto(),
    pruebas,
    ...extra,
  };
}

const resultado = await correrPruebasPorTransporte(transporteHilo(), pedido(
  "console.log(1 + 2);\n",
  [
    { id: "s1", nombre: "imprime la suma", entrada: null, esperado: "3\n", tipo: "salida", visible: true },
    { id: "s2", nombre: "espera otra cosa", entrada: null, esperado: "4\n", tipo: "salida", visible: false },
  ],
));

describe("el ejecutor de pruebas", () => {
  it("da un TestResult por cada prueba, pasada o no, y un veredicto", async () => {
    assert.equal(resultado.estado, "ok");
    assert.equal(resultado.pruebas?.length, 2);
    assert.equal(resultado.pruebas?.[0].id, "s1");
    assert.equal(resultado.pruebas?.[0].pasada, true);
    assert.equal(resultado.pruebas?.[1].pasada, false);
    assert.equal(resultado.pruebas?.[1].obtenido, "3\n");
    assert.equal(resultado.pruebas?.[1].esperado, "4\n");
    assert.equal(todasPasadas(resultado), false);
    assert.equal(resultado.origen, "ejecucion-real");
    assert.equal(resultado.motor.nombre, "javascript");
    assert.ok(resultado.motor.version.length > 0);
  });

  it("evalúa el valor de la expresión final para los tipos retorno", async () => {
    const salida = await correrPruebasPorTransporte(transporteHilo(), pedido(
      "function doble(x) {\n  return x * 2;\n}\ndoble(21);\n",
      [
        { id: "r1", nombre: "devuelve 42", entrada: null, esperado: 42, tipo: "retorno", visible: true },
        { id: "r2", nombre: "no es 43", entrada: null, esperado: 43, tipo: "retorno", visible: true },
      ],
    ));
    assert.equal(salida.estado, "ok");
    assert.equal(salida.pruebas?.[0].pasada, true);
    assert.equal(salida.pruebas?.[0].obtenido, "42");
    assert.equal(salida.pruebas?.[1].pasada, false);
  });

  it("propiedad exige un booleano y confirma lo que se cumple", async () => {
    const salida = await correrPruebasPorTransporte(transporteHilo(), pedido(
      "let lista = [1, 2, 3];\nlista.every(function (x) { return x > 0; });\n",
      [
        { id: "p1", nombre: "todos positivos", entrada: null, esperado: true, tipo: "propiedad", visible: true },
      ],
    ));
    assert.equal(salida.estado, "ok");
    assert.equal(salida.pruebas?.[0].pasada, true);
    assert.equal(salida.pruebas?.[0].obtenido, "true");

    // Un programa que acaba en texto no puede pretender una propiedad booleana: cae con motivo.
    const noBooleano = await correrPruebasPorTransporte(transporteHilo(), pedido(
      'let saludo = "hola";\nsaludo.toUpperCase();\n',
      [
        { id: "p2", nombre: "no es booleano", entrada: null, esperado: true, tipo: "propiedad", visible: false },
      ],
    ));
    assert.equal(noBooleano.pruebas?.[0].pasada, false);
    assert.ok(
      String(noBooleano.pruebas?.[0].error).includes("booleano"),
      String(noBooleano.pruebas?.[0].error),
    );
  });

  it("compara con tolerancia los números con decimales cuando la prueba la pide", async () => {
    const salida = await correrPruebasPorTransporte(transporteHilo(), pedido(
      "let r = 1;\nr = r / 3;\nr;\n",
      [
        {
          id: "d1", nombre: "con tolerancia", entrada: null, esperado: 0.3333,
          tipo: "retorno", visible: true, tolerancia: 0.001,
        },
        {
          id: "d2", nombre: "sin tolerancia", entrada: null, esperado: 0.3333,
          tipo: "retorno", visible: true,
        },
      ],
    ));
    assert.equal(salida.pruebas?.[0].pasada, true);
    assert.equal(salida.pruebas?.[1].pasada, false);
    assert.equal(sonIguales("0.5", "0.4999", 0.001), true);
    assert.equal(sonIguales("0.5", "0.4900", 0.001), false);
    assert.equal(sonIguales("3\n", "3\n"), true);
  });

  it("el fallo de una prueba no impide ejecutar las demás: cada una corre aislada", async () => {
    const salida = await correrPruebasPorTransporte(transporteHilo(), pedido(
      'console.log("listo");\n',
      [
        { id: "a", nombre: "sale mal", entrada: null, esperado: "otra cosa", tipo: "salida", visible: true },
        { id: "b", nombre: "sale bien", entrada: null, esperado: "listo\n", tipo: "salida", visible: true },
        { id: "c", nombre: "otra mal", entrada: null, esperado: "no\n", tipo: "salida", visible: true },
      ],
    ));
    assert.equal(salida.estado, "ok");
    assert.equal(salida.pruebas?.length, 3);
    assert.equal(salida.pruebas?.[0].pasada, false);
    assert.equal(salida.pruebas?.[1].pasada, true);
    assert.equal(salida.pruebas?.[2].pasada, false);
    assert.equal(todasPasadas(salida), false);
  });

  it("un programa que falla deja todas las pruebas caídas con el motivo y sin colgar la corrida", async () => {
    const salida = await correrPruebasPorTransporte(transporteHilo(), pedido(
      "noExiste();\n",
      [
        { id: "x1", nombre: "salida", entrada: null, esperado: "nada", tipo: "salida", visible: true },
        { id: "x2", nombre: "retorno", entrada: null, esperado: 1, tipo: "retorno", visible: false },
      ],
    ));
    assert.equal(salida.estado, "error");
    assert.equal(salida.pruebas?.length, 2);
    assert.ok(salida.pruebas?.every((p) => !p.pasada));
    assert.ok(String(salida.pruebas?.[0].error).includes("ReferenceError"));
    assert.ok(salida.duracionMs >= 0);
  });

  it("sin pruebas pide corrida cero y da un resultado vacío pero sellado", async () => {
    const salida = await correrPruebasPorTransporte(transporteHilo(), pedido("console.log(\"ok\");\n", []));
    assert.equal(salida.estado, "ok");
    assert.equal(salida.pruebas?.length, 0);
    assert.equal(todasPasadas(salida), false);
    assert.equal(salida.origen, "ejecucion-real");
  });

  it("textoDe convierte los tipos que llegan en el esperado", () => {
    assert.equal(textoDe("txt"), "txt");
    assert.equal(textoDe(42), "42");
    assert.equal(textoDe(true), "true");
    assert.equal(textoDe(null), "null");
    assert.equal(textoDe(undefined), "undefined");
    assert.equal(textoDe([1, 2]), "[1,2]");
  });
});
