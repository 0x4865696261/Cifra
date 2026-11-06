import assert from "node:assert/strict";
import { test } from "node:test";
import { limitesEntrada, topeSalidaTokens } from "./limits.ts";
import { providers } from "./providers.ts";
import type { PlanDeRespuesta } from "./plan.ts";

const plan: PlanDeRespuesta = {
  superficie: "explicar",
  proposito: ["Prueba del portón."],
  skills: [],
  formato: [],
  reglas: [],
  material: ["Material sintético."],
};

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

test("los límites de entrada y salida coinciden con el contrato", () => {
  assert.deepEqual({ ...limitesEntrada }, { codigo: 20000, mensaje: 8000, pregunta: 600 });
  assert.equal(topeSalidaTokens, 1400);
});

test("cada adaptador pide como máximo el tope de salida", () => {
  assert.ok(providers.length > 0, "no hay adaptadores registrados para comprobar");

  for (const provider of providers) {
    const peticion = provider.construirPeticion(plan, {
      modelo: provider.defaultModel,
      clave: "clave-sintetica-de-prueba",
    });
    assert.ok(esObjeto(peticion.cuerpo), `${provider.id}: el cuerpo no es un objeto`);
    const generacion = peticion.cuerpo.generationConfig;
    const maxTokens =
      typeof peticion.cuerpo.max_tokens === "number"
        ? peticion.cuerpo.max_tokens
        : esObjeto(generacion)
          ? generacion.maxOutputTokens
          : undefined;

    assert.ok(
      typeof maxTokens === "number" && maxTokens >= 0 && maxTokens <= topeSalidaTokens,
      `${provider.id}: max tokens ausente o supera ${topeSalidaTokens}`,
    );
  }
});
