import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { correrPruebasPorTransporte, todasPasadas } from "../ejecucion/pruebas.ts";
import { liberarHilos, transporteHilo } from "../ejecucion/hiloPrueba.ts";
import { limitesDefecto } from "../ejecucion/limites.ts";
import type { RunRequest } from "../ejecucion/tipos.ts";
import {
  nivelEstimadoDePrueba,
  siguienteTramo,
  solucionTramo,
  tramoPorId,
  tramosDePrueba,
} from "./prueba-nivel.ts";

/**
 * La prueba del colocador (0.4.A): los ocho tramos se corren de verdad en un hilo de Node con
 * la misma fuente que la web: cada tramo superado con su solución de referencia cae a la
 * primera sin que nada se genere; y la colocación (nivel = consecutivos desde el principio)
 * se comprueba con las mismas listas que la web guarda en el progreso.
 */

after(() => liberarHilos());

describe("la prueba de nivel: ocho tramos, de fácil a difícil", () => {
  it("hay 8 tramos numerados 1 a 8 en orden, con datos fijos y sin variantes", () => {
    assert.equal(tramosDePrueba.length, 8);
    tramosDePrueba.forEach((tramo, i) => {
      assert.equal(tramo.numero, i + 1, `${tramo.id}: fuera de orden`);
      assert.ok(tramo.id === `prueba-tramo-${i + 1}`, `${tramo.id}: id sin numerar`);
      assert.ok(tramo.enunciado.length > 20, `${tramo.id}: enunciado demasiado corto`);
    });
    // Sin variantes: el código de partida no depende de ninguna persona, así que aquí no hay
    // génerador de datos y los mismos números salen para todo el mundo.
    const primera = tramosDePrueba[0];
    assert.ok(primera.codigoDePartida.includes("function dobla("));
    assert.ok(primera.codigoDePartida.includes("// Escribe tu solución"));
  });

  it("cada tramo lleva salida visible y una prueba de lo que devuelve, escondida", () => {
    assert.deepEqual(
      new Set(tramosDePrueba.map((tramo) => tramo.pruebas.length)),
      new Set([2]),
    );
    for (const tramo of tramosDePrueba) {
      const [salida, retorno] = tramo.pruebas;
      assert.equal(salida.tipo, "salida");
      assert.equal(salida.visible, true);
      assert.equal(retorno.tipo, "retorno");
      assert.equal(retorno.visible, false);
    }
  });
});

for (const tramo of tramosDePrueba) {
  describe(`tramo ${tramo.numero}: ${tramo.titulo}`, () => {
    it("la solución de referencia lo supera entero", { timeout: 120_000 }, async () => {
      const codigo = solucionTramo(tramo.id);
      assert.ok(codigo, `${tramo.id}: la solución de referencia no está construida`);
      const pedido: RunRequest = {
        lenguaje: "javascript",
        codigo,
        limites: limitesDefecto(),
        pruebas: tramo.pruebas,
      };
      const resultado = await correrPruebasPorTransporte(transporteHilo(), pedido);
      assert.equal(resultado.estado, "ok", `${tramo.id}: ${resultado.stderr.slice(0, 300)}`);
      assert.equal(
        todasPasadas(resultado),
        true,
        `${tramo.id}: la referencia no supera sus pruebas: ${JSON.stringify(resultado.pruebas)}`,
      );
    });

    it("el esqueleto vacío no se cuela como superado", { timeout: 120_000 }, async () => {
      const pedido: RunRequest = {
        lenguaje: "javascript",
        codigo: tramo.codigoDePartida,
        limites: limitesDefecto(),
        pruebas: tramo.pruebas,
      };
      const resultado = await correrPruebasPorTransporte(transporteHilo(), pedido);
      assert.notEqual(
        todasPasadas(resultado),
        true,
        `${tramo.id}: el esqueleto sin cuerpo pasa; la prueba de nivel no colocaría a nadie`,
      );
    });
  });
}

describe("la colocación: nivel = tramos consecutivos desde el primero", () => {
  const ids = tramosDePrueba.map((tramo) => tramo.id);

  it("sin tramos superados el nivel es 0", () => {
    assert.equal(nivelEstimadoDePrueba([]), 0);
  });

  it("cuenta solo los consecutivos desde el principio, aunque haya más superados detrás", () => {
    assert.equal(nivelEstimadoDePrueba([ids[0]]), 1);
    assert.equal(nivelEstimadoDePrueba([ids[0], ids[1], ids[2]]), 3);
    // Un hueco corta la cuenta: superó 1, 2 y saltó al 4 → se coloca como nivel 2.
    assert.equal(nivelEstimadoDePrueba([ids[0], ids[1], ids[3]]), 2);
    // Y si el primero no está, no cuenta nada: la prueba empieza por el primero.
    assert.equal(nivelEstimadoDePrueba([ids[2]]), 0);
  });

  it("con los ocho superados el nivel llega al tope", () => {
    assert.equal(nivelEstimadoDePrueba(ids), 8);
  });

  it("tramoPorId encuentra por id y siguienteTramo apunta al primero sin resolver", () => {
    assert.equal(tramoPorId(ids[0]), tramosDePrueba[0]);
    assert.equal(tramoPorId("prueba-tramo-99"), undefined);
    assert.equal(siguienteTramo([]), tramosDePrueba[0]);
    const reanudar = siguienteTramo([ids[0], ids[1]]);
    assert.ok(reanudar, "con dos superados queda tramo por hacer");
    assert.equal(reanudar.numero, 3);
    assert.equal(siguienteTramo(ids), undefined, "con todo resuelto no queda tramo que hacer");
  });
});
