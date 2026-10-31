import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDebugGuide } from "./debug-parse.ts";

const guiaValida = `{
  "reading": "El mensaje dice que 'minimo' no existe en el objeto.",
  "locate": "Apunta a la línea del promedio: el objeto elegidos empieza vacío.",
  "hypotheses": [
    { "hypothesis": "La letra descarta todos los artículos", "coste": 1, "howToCheck": "Imprime elegidos antes del promedio." },
    { "hypothesis": "El catálogo no tiene mínimo ni máximo por artículo", "coste": 3, "howToCheck": "Revisa el catálogo y las claves que usa el cálculo." }
  ],
  "repro": {
    "failing": "precios('z', catalogo)",
    "passing": "precios('a', catalogo)"
  },
  "caughtEarlier": "Una prueba con un filtro que vacía la colección."
}`;

describe("parseDebugGuide", () => {
  it("convierte una respuesta válida en la guia del contrato 4.2", () => {
    const guia = parseDebugGuide(guiaValida);
    assert.ok(guia);
    assert.equal(guia.leerElMensaje[0].procedencia, "deducido");
    assert.equal(
      guia.localizarElSitio[0].texto,
      "Apunta a la línea del promedio: el objeto elegidos empieza vacío.",
    );
    assert.deepEqual(
      guia.hipotesis.map((item) => item.coste),
      [1, 3],
    );
    assert.equal(guia.entradaQueFallaHoy, "precios('z', catalogo)");
    assert.equal(guia.entradaQueDebeSeguirFuncionando, "precios('a', catalogo)");
  });

  it("acepta la respuesta dentro de un bloque de código acotado", () => {
    const guia = parseDebugGuide("```json\n" + guiaValida + "\n```");
    assert.ok(guia);
  });

  it("rechaza una hipótesis con un coste fuera de 1 a 3", () => {
    const rota = guiaValida.replace('"coste": 3', '"coste": 7');
    assert.equal(parseDebugGuide(rota), null);
  });

  it("rechaza una guia sin entrada que falla hoy", () => {
    const rota = guiaValida.replace(/"repro": \{[\s\S]*?\},/, '"repro": {},');
    assert.equal(parseDebugGuide(rota), null);
  });

  it("rechaza una guia sin cómo habría saltado antes", () => {
    const rota = guiaValida.replace('"caughtEarlier": "Una prueba con un filtro que vacía la colección."', "");
    assert.equal(parseDebugGuide(rota), null);
  });

  it("rechaza una guia sin localizar el sitio", () => {
    const rota = guiaValida.replace('"locate": "Apunta a la línea del promedio: el objeto elegidos empieza vacío.",', "");
    assert.equal(parseDebugGuide(rota), null);
  });

  it("rechaza una guia sin hipótesis", () => {
    const rota = guiaValida.replace(/"hypotheses": \[[\s\S]*?\],/, '"hypotheses": [],');
    assert.equal(parseDebugGuide(rota), null);
  });

  it("rechaza texto que no es JSON de guía", () => {
    assert.equal(parseDebugGuide("prefiero no contestar con JSON"), null);
  });

  it("se queda con como mucho cuatro hipótesis", () => {
    const entrada = guiaValida.replace(
      /"hypotheses": \[[\s\S]*?\],/,
      '"hypotheses": [' +
        Array.from({ length: 5 }, (_, i) => `{ "hypothesis": "H${i}", "coste": 1, "howToCheck": "C${i}" }`).join(",") +
        "],",
    );
    const guia = parseDebugGuide(entrada);
    assert.ok(guia);
    assert.equal(guia.hipotesis.length, 4);
  });
});
