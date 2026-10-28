/**
 * Proveedores de modelo. La clave nunca se guarda en el servidor: llega en la
 * petición, se usa para esa llamada y se olvida. Sin clave del usuario, el
 * servidor puede aportar la suya de plataforma.
 */

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

  if (provider === "xai" || provider === "openai") {
    const endpoint =
      provider === "xai" ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    return postJson(endpoint, {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }, {
      model: modelId,
      temperature: 0.3,
      max_tokens: 1400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }, (body) => body.choices?.[0]?.message?.content);
  }

  if (provider === "anthropic") {
    return postJson("https://api.anthropic.com/v1/messages", {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    }, {
      model: modelId,
      max_tokens: 1400,
      temperature: 0.3,
      system,
      messages: [{ role: "user", content: user }],
    }, (body) => body.content?.map((part: { text?: string }) => part?.text ?? "").join(""));
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  return postJson(url, { "Content-Type": "application/json" }, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1400,
      responseMimeType: "application/json",
    },
  }, (body) =>
    body.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part?.text ?? "").join(""));
}

type Body = {
  [key: string]: unknown;
  choices?: { message?: { content?: string } }[];
  content?: { text?: string }[];
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

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

  let response = await send();
  if (response.status === 429 || response.status >= 500) {
    response = await send();
  }
  if (!response.ok) {
    throw new Error(`Respondió con ${response.status}. No he inventado una explicación.`);
  }
  const parsed = (await response.json()) as Body;
  return pick(parsed) ?? "";
}
