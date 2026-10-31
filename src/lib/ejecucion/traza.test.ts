import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recortarTraza, recortarValor } from "./traza.ts";
import type { TraceStep } from "./tipos.ts";

describe("recortarValor", () => {
  it("deja pasar con tal de 200 caracteres y corta con elipsis lo que lo pasa", () => {
    const corto = "poco";
    assert.equal(recortarValor(corto), corto);
    const largo = "a".repeat(300);
    const salida = recortarValor(largo);
    assert.equal(salida.length, 201); // 200 + el carácter de elipsis
    assert.ok(salida.endsWith("…"));
  });

  it("nombra null, undefined y las funciones en lugar de mentir", () => {
    assert.equal(recortarValor(null), "null");
    assert.equal(recortarValor(undefined), "undefined");
    assert.equal(recortarValor(function saludar() {}), "ƒ saludar");
    assert.equal(recortarValor(() => 3), "ƒ anónima");
  });

  it("serializa objetos y dice lo que no puede serializar", () => {
    assert.equal(recortarValor({ x: 1 }), `{"x":1}`);
    const circular: Record<string, unknown> = {};
    circular["yo"] = circular;
    assert.equal(recortarValor(circular), "[no serializable]");
  });

  it("respeta un tope menor que el por defecto", () => {
    assert.equal(recortarValor("abcdef", 3), "abc…");
  });
});

describe("recortarTraza", () => {
  const paso = (n: number): TraceStep => ({ paso: n, linea: n, evento: "linea", variables: {} });

  it("deja pasar una traza corta y dice que no está truncada", () => {
    const traza = [paso(1), paso(2)];
    const { pasos: salida, truncada } = recortarTraza(traza, 2000);
    assert.equal(truncada, false);
    assert.equal(salida.length, 2);
  });

  it("recorta al tope y marca la traza como truncada", () => {
    const traza = Array.from({ length: 250 }, (_, i) => paso(i + 1));
    const { pasos: salida, truncada } = recortarTraza(traza, 200);
    assert.equal(truncada, true);
    assert.equal(salida.length, 200);
  });

  it("no marca truncada en el límite justo", () => {
    const traza = Array.from({ length: 200 }, (_, i) => paso(i + 1));
    const { truncada } = recortarTraza(traza, 200);
    assert.equal(truncada, false);
  });
});
