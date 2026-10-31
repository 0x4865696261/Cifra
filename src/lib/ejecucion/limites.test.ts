import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { limitesDefecto, limitesEjecucion, topeValorTraza } from "./limites.ts";

describe("limitesEjecucion", () => {
  it("fija la tabla de límites de 0.3.B: 5 s, 128 MB, 64 KB y 2.000 pasos", () => {
    assert.deepEqual({ ...limitesEjecucion }, {
      tiempoMs: 5000,
      memoriaMB: 128,
      salidaKB: 64,
      pasosTraza: 2000,
    });
  });

  it("recorta el valor de cada variable de la traza a 200 caracteres", () => {
    assert.equal(topeValorTraza, 200);
  });

  it("da una copia nueva en cada llamada, para que un motor no comparta el objeto", () => {
    const una = limitesDefecto();
    una.tiempoMs = 1;
    assert.equal(limitesDefecto().tiempoMs, 5000);
  });
});
