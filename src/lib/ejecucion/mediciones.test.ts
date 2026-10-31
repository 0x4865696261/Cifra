import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calentamientos,
  compararMediciones,
  medianaYMad,
  medir,
  repeticiones,
  veredictoDe,
  type Medida,
} from "./mediciones.ts";
import type { RunResult } from "./tipos.ts";

/** Cifras de corridas falsas pero honestas: el comparador solo ve duracionMs. */
function resultadoDe(duracionMs: number): RunResult {
  return {
    estado: "ok",
    stdout: "",
    stderr: "",
    duracionMs,
    motor: { nombre: "javascript", version: "n/d" },
    origen: "ejecucion-real",
  };
}

function medida(mediana: number, mad: number): Medida {
  return { mediana, mad, corridas: [mediana] };
}

describe("medianaYMad", () => {
  it("mediana impar: la del medio; MAD: la mediana de las desviaciones", () => {
    const { mediana, mad } = medianaYMad([30, 10, 20]);
    assert.equal(mediana, 20);
    assert.equal(mad, 10);
  });

  it("mediana par: el promedio de los dos del medio", () => {
    const { mediana } = medianaYMad([10, 20, 30, 40]);
    assert.equal(mediana, 25);
  });

  it("una sola corrida: mediana ella misma y dispersión cero", () => {
    const { mediana, mad } = medianaYMad([42]);
    assert.equal(mediana, 42);
    assert.equal(mad, 0);
  });
});

describe("veredictoDe", () => {
  it("no declara ganadora cuando la diferencia cae dentro de la dispersión (0.3.F)", () => {
    assert.equal(veredictoDe(medida(100, 10), medida(105, 8)), "dentro-de-la-dispersion");
    // justo en el umbral (2 * 10 = 20): tampoco se declara nada
    assert.equal(veredictoDe(medida(100, 10), medida(120, 10)), "dentro-de-la-dispersion");
  });

  it("declara la optimizada más rápida solo si supera el doble del mayor MAD", () => {
    assert.equal(veredictoDe(medida(100, 1), medida(80, 1)), "mas-rapida-la-optimizada");
    assert.equal(veredictoDe(medida(80, 1), medida(100, 1)), "mas-rapida-la-original");
  });

  it("la dispersión manda con el mayor MAD de las dos medidas", () => {
    // la dispersión de la OPTIMIZADA agranda el umbral: la original no gana por poco
    assert.equal(
      veredictoDe(medida(100, 1), medida(110, 20)),
      "dentro-de-la-dispersion",
    );
  });
});

describe("medir y compararMediciones", () => {
  it("descarta los calentamientos y guarda las corridas válidas", async () => {
    let llamadas = 0;
    const resultado = await medir(async () => resultadoDe(++llamadas * 10));
    assert.equal(llamadas, calentamientos + repeticiones);
    assert.equal(resultado.corridas.length, repeticiones);
    assert.equal(resultado.mediana, 75);
  });

  it("la comparación completa dice dentro de la dispersión con una versión parecida y método declarado", async () => {
    let vuelta = 0;
    const comparacion = await compararMediciones(
      async () => resultadoDe(100 + (vuelta++ % 2)),
      async () => resultadoDe(101 + (vuelta++ % 2)),
    );
    assert.equal(comparacion.veredicto, "dentro-de-la-dispersion");
    assert.ok(comparacion.notas.includes("equipo"), comparacion.notas);
    assert.ok(comparacion.notas.includes("calentamiento"), comparacion.notas);
    assert.equal(comparacion.original.corridas.length, repeticiones);
    assert.equal(comparacion.optimizada.corridas.length, repeticiones);
  });
});
