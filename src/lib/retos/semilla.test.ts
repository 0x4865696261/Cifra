import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  crearAleatorio,
  datosDe,
  enteroEntre,
  hashSemilla,
  listaDeNumeros,
} from "./semilla.ts";
import type { Rand } from "./tipos.ts";

describe("hashSemilla", () => {
  it("da lo mismo siempre para la misma persona y reto", () => {
    assert.equal(hashSemilla("a1b2c3d4e5f601020304050607080910", "bucles-dos"), hashSemilla("a1b2c3d4e5f601020304050607080910", "bucles-dos"));
  });

  it("cambia con la persona y con el reto", () => {
    const base = "a1b2c3d4e5f601020304050607080910";
    assert.notEqual(hashSemilla(base, "bucles-dos"), hashSemilla("f0e1d2c3b4a5968778695041324f516a", "bucles-dos"));
    assert.notEqual(hashSemilla(base, "bucles-dos"), hashSemilla(base, "bucles-cinco"));
  });

  it("cabe en 32 bits sin signo", () => {
    for (let i = 0; i < 50; i++) {
      const hash = hashSemilla(`semilla-${i}`, `reto-${i}`);
      assert.ok(hash >= 0 && hash < 2 ** 32, `hash fuera de rango: ${hash}`);
    }
  });
});

describe("crearAleatorio", () => {
  it("con la misma semilla da la misma serie", () => {
    const una = crearAleatorio(123456789);
    const otra = crearAleatorio(123456789);
    const serieUna = [una(), una(), una(), una()];
    const serieOtra = [otra(), otra(), otra(), otra()];
    assert.deepEqual(serieUna, serieOtra);
  });

  it("con otra semilla cambia la serie", () => {
    const una = crearAleatorio(1);
    const otra = crearAleatorio(2);
    assert.notDeepEqual([una(), una(), una()], [otra(), otra(), otra()]);
  });

  it("los valores están entre 0 y 1", () => {
    const aleatorio = crearAleatorio(987654321);
    for (let i = 0; i < 200; i++) {
      const valor = aleatorio();
      assert.ok(valor >= 0 && valor < 1);
    }
  });
});

describe("enteroEntre", () => {
  it("incluye los dos extremos al hacerlo muchas veces", () => {
    const aleatorio = crearAleatorio(42);
    const vistos = new Set<number>();
    for (let i = 0; i < 500; i++) vistos.add(enteroEntre(aleatorio, 2, 5));
    for (const valor of [2, 3, 4, 5]) assert.ok(vistos.has(valor), `falta el extremo ${valor}`);
    for (const valor of vistos) assert.ok(valor >= 2 && valor <= 5);
  });
});

describe("listaDeNumeros", () => {
  it("respeta el rango de largo y de valores", () => {
    const aleatorio = crearAleatorio(777);
    for (let i = 0; i < 100; i++) {
      const lista = listaDeNumeros(aleatorio, { minimoLargo: 4, maximoLargo: 8, valorMinimo: 10, valorMaximo: 60 });
      assert.ok(lista.length >= 4 && lista.length <= 8);
      for (const valor of lista) assert.ok(valor >= 10 && valor <= 60);
    }
  });

  it("no repite valores dentro de la misma lista", () => {
    const aleatorio = crearAleatorio(777);
    const lista = listaDeNumeros(aleatorio, { minimoLargo: 8, maximoLargo: 8, valorMinimo: 1, valorMaximo: 20 });
    assert.equal(new Set(lista).size, lista.length);
  });
});

describe("datosDe", () => {
  it("misma persona, mismos datos; otra persona, otros", () => {
    const crear = (aleatorio: Rand) => ({ lista: listaDeNumeros(aleatorio, { minimoLargo: 10, maximoLargo: 10, valorMinimo: 1, valorMaximo: 1000000 }).join(" ") });
    const deAna = datosDe({ id: "bucles-dos", crearDatos: crear }, "persona-una");
    const deAnaOtraVez = datosDe({ id: "bucles-dos", crearDatos: crear }, "persona-una");
    const deLuis = datosDe({ id: "bucles-dos", crearDatos: crear }, "persona-dos");
    assert.deepEqual(deAna, deAnaOtraVez);
    assert.notDeepEqual(deAna, deLuis);
  });
});
