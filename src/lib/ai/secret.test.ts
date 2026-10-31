import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { callModel, providers } from "./providers.ts";

const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

const CLAVE = "sk-test-9f8e7d6c5b4a3210-CLAVE-DE-PRUEBA";
const RESPUESTA_JSON = '{"choices": [{"message": {"content": "{}"}}]}';

type RegistroConsola = string[] & { restaurar(): void };

function registrarConsola(): RegistroConsola {
  const registros: string[] = [];
  const metodos = ["log", "warn", "error", "info"] as const;
  const originales = new Map(metodos.map((metodo) => [metodo, console[metodo]]));
  for (const metodo of metodos) {
    console[metodo] = (...partes: unknown[]) => registros.push(partes.map(String).join(" "));
  }
  return Object.assign(registros, {
    restaurar() {
      for (const [metodo, original] of originales) console[metodo] = original;
    },
  }) as RegistroConsola;
}

describe("la clave de API no sale de la llamada", () => {
  for (const { id, label } of providers) {
    it(`${label}: la respuesta no contiene la clave`, async () => {
      globalThis.fetch = (async () => new Response(RESPUESTA_JSON, { status: 200 })) as typeof fetch;
      const texto = await callModel(id, CLAVE, "", "Sistema", "Usuario");
      assert.doesNotMatch(texto, /CLAVE-DE-PRUEBA|9f8e7d6c/);
    });

    it(`${label}: los registros de una llamada fallida no contienen la clave`, async () => {
      const registros = registrarConsola();
      try {
        globalThis.fetch = (async () => new Response('{"error": "invalid key"}', { status: 401 })) as typeof fetch;
        await callModel(id, CLAVE, "", "Sistema", "Usuario");
        assert.fail("debía rechazar");
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.doesNotMatch(error.message, /CLAVE-DE-PRUEBA|9f8e7d6c/);
      } finally {
        registros.restaurar();
      }
      const todo = registros.join("\n");
      assert.doesNotMatch(todo, /CLAVE-DE-PRUEBA|9f8e7d6c/);
    });

    it(`${label}: el mensaje traducido no arrastra la clave aunque el cuerpo del proveedor la cite`, async () => {
      globalThis.fetch = (async () =>
        new Response(`{"error": {"detail": "la clave ${CLAVE} fue rechazada"}}`, { status: 401 })) as typeof fetch;
      try {
        await callModel(id, CLAVE, "", "Sistema", "Usuario");
        assert.fail("debía rechazar");
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.doesNotMatch(error.message, /CLAVE-DE-PRUEBA|9f8e7d6c/);
      }
    });
  }
});
