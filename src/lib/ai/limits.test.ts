import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { excedeLimite, limitesEntrada } from "./limits.ts";

describe("limitesEntrada", () => {
  it("fija 20.000 caracteres de código y 8.000 de mensaje", () => {
    assert.equal(limitesEntrada.codigo, 20000);
    assert.equal(limitesEntrada.mensaje, 8000);
  });

  it("acepta texto justo en el límite y rechaza el que lo pasa", () => {
    assert.equal(excedeLimite("a".repeat(20000), limitesEntrada.codigo), false);
    assert.equal(excedeLimite("a".repeat(20001), limitesEntrada.codigo), true);
    assert.equal(excedeLimite("a".repeat(8000), limitesEntrada.mensaje), false);
    assert.equal(excedeLimite("a".repeat(8001), limitesEntrada.mensaje), true);
  });
});
