import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { callModel, FalloProveedor, providers, traducirError, type ProviderId } from "./providers.ts";
import { topeSalidaTokens } from "./limits.ts";

const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

function responderCon(estado: number, cuerpo: string) {
  globalThis.fetch = (async () => new Response(cuerpo, { status: estado })) as typeof fetch;
}

const llamadas = {
  xai: llamadaDe("xai"),
  openai: llamadaDe("openai"),
  anthropic: llamadaDe("anthropic"),
  google: llamadaDe("google"),
};

function llamadaDe(proveedor: ProviderId) {
  return () => callModel(proveedor, "clave-de-prueba-suficientemente-larga", "", "Sistema", "Usuario");
}

describe("callModel y traducirError, por proveedor y por caso", () => {
  for (const { id, label } of providers) {
    it(`${label}: 401 se traduce a clave-invalida con mensaje accionable`, async () => {
      responderCon(401, '{"error": "invalid api key"}');
      await assert.rejects(llamadas[id](), (error: unknown) => {
        assert.ok(error instanceof FalloProveedor && error.tipo === "clave-invalida");
        assert.match(error.message, /clave|Ajustes/i);
        return true;
      });
    });

    it(`${label}: 429 se traduce a limite-uso tras el reintento`, async () => {
      let llamadasFetch = 0;
      globalThis.fetch = (async () => {
        llamadasFetch += 1;
        return new Response('{"error": "rate limit"}', { status: 429 });
      }) as typeof fetch;
      await assert.rejects(llamadas[id](), (error: unknown) => {
        assert.ok(error instanceof FalloProveedor && error.tipo === "limite-uso");
        return true;
      });
      assert.equal(llamadasFetch, 2);
    });

    it(`${label}: 503 se traduce a servicio-caido`, async () => {
      responderCon(503, "upstream unavailable");
      await assert.rejects(llamadas[id](), (error: unknown) => {
        assert.ok(error instanceof FalloProveedor && error.tipo === "servicio-caido");
        assert.match(error.message, /reintenta|Reintenta/);
        return true;
      });
    });

    it(`${label}: el tiempo agotado se traduce sin culpar a la clave`, async () => {
      globalThis.fetch = (async () => {
        throw Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" });
      }) as unknown as typeof fetch;
      await assert.rejects(llamadas[id](), (error: unknown) => {
        assert.ok(error instanceof FalloProveedor && error.tipo === "tiempo-agotado");
        assert.doesNotMatch(error.message, /clave/i);
        return true;
      });
    });

    it(`${label}: la respuesta bloqueada por política se traduce a contenido-bloqueado`, async () => {
      responderCon(400, '{"error": {"message": "The request was rejected because the content_filter flagged it."}}');
      await assert.rejects(llamadas[id](), (error: unknown) => {
        assert.ok(error instanceof FalloProveedor && error.tipo === "contenido-bloqueado");
        return true;
      });
    });
  }

  it("un fallo sin forma conocida queda como respuesta-invalida", () => {
    const traducido = traducirError("xai", new Error("algo chungo"));
    assert.equal(traducido.tipo, "respuesta-invalida");
    assert.ok(traducido.mensaje.length > 0);
  });

  it("un error ya traducido no se envuelve otra vez", () => {
    const original = traducirError("xai", new Error("x"));
    assert.equal(traducirError("openai", original), original);
  });

  it("la clave no viaja en la URL de Google", async () => {
    let urlPedida = "";
    globalThis.fetch = (async (url: string | URL) => {
      urlPedida = String(url);
      return new Response('{"candidates": [{"content": {"parts": [{"text": "{}"}]}}]}', { status: 200 });
    }) as unknown as typeof fetch;
    await llamadas.google();
    assert.doesNotMatch(urlPedida, /clave-de-prueba/);
    assert.match(urlPedida, /:generateContent$/);
  });
});

describe("tope de salida por petición", () => {
  for (const { id, label } of providers) {
    it(`${label} pide como mucho topeSalidaTokens`, async () => {
      let cuerpo = "";
      globalThis.fetch = respuestaConCuerpoCapturado((capturado) => {
        cuerpo = capturado;
      }, id);
      await llamadas[id]();
      const peticion = JSON.parse(cuerpo) as Record<string, unknown>;
      const tope = peticion.max_tokens ?? (peticion.generationConfig as Record<string, unknown>).maxOutputTokens;
      assert.equal(tope, topeSalidaTokens);
    });
  }
});

function respuestaConCuerpoCapturado(
  capturar: (cuerpo: string) => void,
  proveedor: ProviderId,
): typeof fetch {
  const responseBodies: Record<ProviderId, string> = {
    xai: '{"choices": [{"message": {"content": "{}"}}]}',
    openai: '{"choices": [{"message": {"content": "{}"}}]}',
    anthropic: '{"content": [{"text": "{}"}]}',
    google: '{"candidates": [{"content": {"parts": [{"text": "{}"}]}}]}',
  };
  return (async (url: string | URL, init: RequestInit) => {
    capturar(String(init.body));
    return new Response(responseBodies[proveedor], { status: 200 });
  }) as unknown as typeof fetch;
}
