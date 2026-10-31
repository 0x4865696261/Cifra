/**
 * Proveedores de modelo. La clave nunca se guarda en el servidor: llega en la
 * petición, se usa para esa llamada y se olvida. Sin clave del usuario, el
 * servidor puede aportar la suya de plataforma.
 */

import { topeSalidaTokens } from "./limits.ts";

export type ProviderId = "xai" | "openai" | "anthropic" | "google";

export type ProviderInfo = {
  id: ProviderId;
  label: string;
  defaultModel: string;
  note: string;
};

export const providers: ProviderInfo[] = [
  {
    id: "xai",
    label: "xAI (Grok)",
    defaultModel: "grok-4.5",
    note: "La misma API que usa la clave de plataforma.",
  },
  {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-4.1-mini",
    note: "Endpoint de chat completions. Un modelo mini vale para leer código.",
  },
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    defaultModel: "claude-sonnet-4-5",
    note: "API de mensajes. La clave empieza por sk-ant-.",
  },
  {
    id: "google",
    label: "Google (Gemini)",
    defaultModel: "gemini-2.5-flash",
    note: "API de generateContent. Se pide respuesta en JSON.",
  },
];

export function providerInfo(id: ProviderId): ProviderInfo {
  return providers.find((provider) => provider.id === id) ?? providers[0];
}

export function isProviderId(value: string): value is ProviderId {
  return providers.some((provider) => provider.id === value);
}

/** Las claves van en una cabecera; espacios, saltos o comillas son involuntarios. */
export function cleanApiKey(key: string): string {
  return key.replace(/[\s"'`]/g, "");
}

export function keyLooksValid(provider: ProviderId, key: string): boolean {
  if (key.length < 16 || key.length > 400) return false;
  if (/[\s"'`]/.test(key)) return false;
  if (provider === "anthropic" && !key.startsWith("sk-ant-")) return false;
  return true;
}

/** Una llamada al modelo con la clave dada. Devuelve el texto bruto de la respuesta. */
export async function callModel(
  provider: ProviderId,
  apiKey: string,
  model: string,
  system: string,
  user: string,
): Promise<string> {
  const modelId = model.trim() || providerInfo(provider).defaultModel;

  try {
    if (provider === "xai" || provider === "openai") {
      const endpoint =
        provider === "xai" ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
      return await postJson(endpoint, {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      }, {
        model: modelId,
        temperature: 0.3,
        max_tokens: topeSalidaTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }, (body) => body.choices?.[0]?.message?.content);
    }

    if (provider === "anthropic") {
      return await postJson("https://api.anthropic.com/v1/messages", {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      }, {
        model: modelId,
        max_tokens: topeSalidaTokens,
        temperature: 0.3,
        system,
        messages: [{ role: "user", content: user }],
      }, (body) => body.content?.map((part: { text?: string }) => part?.text ?? "").join(""));
    }

    // La clave va en cabecera: en la URL quedaría registrada en cualquier log del origen.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent`;
    return await postJson(url, {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    }, {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: topeSalidaTokens,
        responseMimeType: "application/json",
      },
    }, (body) =>
      body.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part?.text ?? "").join(""));
  } catch (error) {
    throw traducirError(provider, error);
  }
}

export type TipoFallo =
  | "clave-invalida"
  | "limite-uso"
  | "servicio-caido"
  | "contenido-bloqueado"
  | "tiempo-agotado"
  | "respuesta-invalida";

export type ErrorDeProveedor = { tipo: TipoFallo; mensaje: string };

export class FalloProveedor extends Error implements ErrorDeProveedor {
  readonly tipo: TipoFallo;

  constructor(tipo: TipoFallo, mensaje: string) {
    super(mensaje);
    this.name = "FalloProveedor";
    this.tipo = tipo;
  }

  get mensaje(): string {
    return this.message;
  }
}

/**
 * Traduce el fallo bruto de la llamada al mensaje que ve la persona, por
 * proveedor: qué pasó y qué puede hacer la persona al respecto.
 */
export function traducirError(proveedor: ProviderId, crudo: unknown): FalloProveedor {
  if (crudo instanceof FalloProveedor) return crudo;
  const etiqueta = providerInfo(proveedor).label;

  if (crudo instanceof NetworkFailure) {
    if (crudo.causa instanceof Error && (crudo.causa.name === "TimeoutError" || crudo.causa.name === "AbortError")) {
      return new FalloProveedor("tiempo-agotado", `${etiqueta} no contestó en 30 segundos. Vuelve a intentarlo o prueba otro modelo en Ajustes.`);
    }
    return new FalloProveedor("servicio-caido", `No se ha podido contactar con ${etiqueta}. Comprueba tu conexión y reintenta en unos minutos.`);
  }

  if (crudo instanceof HttpFailure) {
    const { estado, cuerpo } = crudo;
    if (estado === 401 || estado === 403) {
      return new FalloProveedor("clave-invalida", `${etiqueta} rechaza la clave. Revisa en Ajustes que esté completa y activa para ese proveedor.`);
    }
    if (estado === 429) {
      return new FalloProveedor("limite-uso", `${etiqueta} corta la llamada: la clave ha llegado a su límite de uso. Espera un poco o revisa la cuota de esa clave.`);
    }
    if (estado >= 500) {
      return new FalloProveedor("servicio-caido", `${etiqueta} no está respondiendo (código ${estado}). No es tu clave ni tu código: reintenta en unos minutos.`);
    }
    if (/\bcontent[ _-]?policy\b|\bcontent[ _-]?filter\b|\brefusal\b|\bblocked\b|\bbloquead\w*\b|\bsafety\b/i.test(cuerpo)) {
      return new FalloProveedor("contenido-bloqueado", `${etiqueta} ha bloqueado el contenido de esta llamada. Cambia el texto que envías o prueba otro modelo.`);
    }
    return new FalloProveedor("respuesta-invalida", `${etiqueta} rechazó la petición (código ${estado}). No he inventado una explicación.`);
  }

  return new FalloProveedor("respuesta-invalida", `${etiqueta} respondió de una forma que no se esperaba. No he inventado una explicación.`);
}

class HttpFailure extends Error {
  readonly estado: number;
  readonly cuerpo: string;

  constructor(estado: number, cuerpo: string) {
    super(`HTTP ${estado}`);
    this.estado = estado;
    this.cuerpo = cuerpo;
  }
}

class NetworkFailure extends Error {
  readonly causa: unknown;

  constructor(causa: unknown) {
    super("fallo de red");
    this.causa = causa;
  }
}

async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  pick: (parsed: Body) => string | undefined,
): Promise<string> {
  const send = () =>
    fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(28000),
    });

  let response: Response;
  try {
    response = await send();
    if (response.status === 429 || response.status >= 500) {
      response = await send();
    }
  } catch (error) {
    throw new NetworkFailure(error);
  }
  if (!response.ok) {
    throw new HttpFailure(response.status, await response.text());
  }
  let parsed: Body;
  try {
    parsed = (await response.json()) as Body;
  } catch {
    throw new HttpFailure(response.status, "el cuerpo no era JSON válido");
  }
  return pick(parsed) ?? "";
}

type Body = {
  [key: string]: unknown;
  choices?: { message?: { content?: string } }[];
  content?: { text?: string }[];
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};
