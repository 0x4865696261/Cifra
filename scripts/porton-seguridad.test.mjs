import assert from "node:assert/strict";
import { test } from "node:test";
import { escanearCredenciales, hayCredencial } from "./porton-seguridad.mjs";
import { providers } from "../src/lib/ai/providers.ts";

const plan = {
  superficie: "explicar",
  proposito: ["Prueba del portón."],
  skills: [],
  formato: [],
  reglas: [],
  material: ["Material sintético."],
};

test("reconoce formatos habituales de credenciales reales", () => {
  const candidatas = [
    `sk-live-${"a".repeat(32)}`,
    `AKIA${"A".repeat(16)}`,
    `ghp_${"A".repeat(36)}`,
    `AIza${"A".repeat(35)}`,
    `eyJ${"A".repeat(24)}.${"B".repeat(12)}.${"C".repeat(12)}`,
    "postgresql://" + "usuario" + ":" + "clave" + "@servidor/base",
  ];

  for (const [indice, candidata] of candidatas.entries()) {
    assert.equal(hayCredencial(candidata), true, `formato ${indice + 1} no reconocido`);
  }
});

test("no marca credenciales de ejemplo que llevan una marca sintética explícita", () => {
  assert.equal(hayCredencial("sk-sintetica-0001-mudo-teclado"), false);
  assert.equal(hayCredencial("sk-test-9f8e7d6c5b4a3210-CLAVE-DE-PRUEBA"), false);
});

test("src, server, public y scripts no contienen credenciales reales", () => {
  assert.deepEqual(escanearCredenciales(), []);
});

for (const provider of providers) {
  test(`${provider.label}: la clave no aparece en la URL ni en el cuerpo`, () => {
    const clave = "CLAVE-PORTON-UNICA-1234567890";
    const peticion = provider.construirPeticion(plan, {
      modelo: provider.defaultModel,
      clave,
    });

    assert.equal(peticion.url.includes(clave), false);
    assert.equal(JSON.stringify(peticion.cuerpo).includes(clave), false);
  });
}
