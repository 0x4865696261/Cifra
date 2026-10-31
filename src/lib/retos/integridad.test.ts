import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  agregarEscritura,
  agregarFocoPerdido,
  agregarPegado,
  observacionDe,
  observacionVacia,
  topePegadoGrande,
  topeRitmoCaracteres,
  topeSenales,
  ventanaRitmoMs,
} from "./integridad.ts";
import type { SenalIntegridad } from "./tipos.ts";

describe("señales que nunca bloquean (0.4.D)", () => {
  it("un pegado pequeño no deja señal", () => {
    const señales = agregarPegado([], Math.min(topePegadoGrande, 30), 12);
    assert.equal(señales.length, 0);
    assert.deepEqual(observacionDe(señales).pideDefensa, false);
  });

  it("un pegado grande deja señal y con ella la observación pide defensa", () => {
    const señales = agregarPegado([], topePegadoGrande + 1, 12);
    assert.equal(señales.length, 1);
    assert.equal(señales[0].tipo, "pegado-grande");
    assert.equal(observacionDe(señales).pideDefensa, true);
  });

  it("perder el foco deja señal; ninguna función puede negar un envío", () => {
    const señales = agregarFocoPerdido([], 5);
    assert.equal(señales[0].tipo, "foco-perdido");
    // La forma de la observación no tiene ningún campo de bloqueo: solo describe.
    const forma = Object.keys(observacionDe(señales));
    assert.deepEqual(forma, ["señales", "pideDefensa"]);
  });

  it("un ritmo imposible es una regla fija, no un cálculo del editor", () => {
    const pocas = agregarEscritura([], Math.min(topeRitmoCaracteres, 20), 50, 60);
    assert.equal(pocas.length, 0);
    const demasiadas = agregarEscritura([], topeRitmoCaracteres + 1, 50, 60);
    assert.equal(demasiadas.length, 1);
    assert.equal(demasiadas[0].tipo, "ritmo-imposible");
    // El mismo ritmo, dentro de la ventana larga, no es imposible.
    assert.equal(agregarEscritura([], 200, ventanaRitmoMs + 1, 1_500).length, 0);
  });

  it("el registro de señales no crece sin límite", () => {
    let señales: SenalIntegridad[] = [];
    for (let i = 0; i < topeSenales + 30; i++) {
      señales = agregarPegado(señales, topePegadoGrande + 1 + i, i);
    }
    assert.equal(señales.length, topeSenales);
  });

  it("sin señales no hay defensa pedida; el estado vacío no se dispara solo", () => {
    const vacia = observacionVacia();
    assert.deepEqual(vacia, { señales: [], pideDefensa: false });
    assert.equal(observacionDe([]).pideDefensa, false);
  });
});
