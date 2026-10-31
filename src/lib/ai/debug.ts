import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseDebugGuide, type GuiaDeDepuracion } from "@/lib/ai/debug-parse";
import { callModel, cleanApiKey, isProviderId, keyLooksValid, type ProviderId } from "@/lib/ai/providers";
import { composeSkills, lockedSkills } from "@/lib/skills/registry";
import { limitesEntrada } from "@/lib/ai/limits";
import { guardarGuiaEnCache, guiaEnCache, huellaDeGuia, type EntradaDeGuia } from "@/lib/ai/guia-cache";

export type { GuiaDeDepuracion };

export type DebugResult =
  | { ok: true; guide: GuiaDeDepuracion; cached: boolean }
  | { ok: false; error: string; raw?: string };

const payloadSchema = z.object({
  level: z.enum(["empezando", "practica", "profundidad"]),
  language: z.string().max(32).optional(),
  code: z.string().min(1).max(limitesEntrada.codigo),
  errorMessage: z.string().min(1).max(limitesEntrada.mensaje),
  question: z.string().max(limitesEntrada.pregunta).optional(),
  codeFacts: z.array(z.string().max(400)).max(24),
  messageFacts: z.array(z.string().max(400)).max(24),
  provider: z.string().max(16).optional(),
  apiKey: z.string().max(400).optional(),
  model: z.string().max(64).optional(),
});

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const IP_LIMIT = 8;
const GLOBAL_LIMIT = 30;

export const askDebug = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<DebugResult> => {
    const parsed = payloadSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: "La petición no tiene la forma esperada." };
    }
    const input = parsed.data;

    // Clave propia: llega, se usa, no se guarda.
    let userKey: { provider: ProviderId; apiKey: string; model: string } | null = null;
    if (input.apiKey) {
      const cleaned = cleanApiKey(input.apiKey);
      if (!input.provider || !isProviderId(input.provider)) {
        return { ok: false, error: "El proveedor indicado no está en la lista. Revisa los ajustes." };
      }
      if (!keyLooksValid(input.provider, cleaned)) {
        return { ok: false, error: "La clave no tiene la forma esperada para ese proveedor. Revísala en Ajustes." };
      }
      userKey = { provider: input.provider, apiKey: cleaned, model: input.model ? cleanApiKey(input.model) : "" };
    }

    const apiKey = userKey?.apiKey ?? process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        ok: false,
        error:
          "Todavía no hay modelo disponible. En Ajustes puedes añadir tu propia clave de xAI, OpenAI, Claude o Gemini.",
      };
    }

    let ip = "desconocida";
    try {
      const server = await import("@tanstack/react-start/server");
      ip = server.getRequestIP() || "desconocida";
    } catch {
      ip = "desconocida";
    }
    if (!allow(`ip:${ip}`, IP_LIMIT) || !allow("global", GLOBAL_LIMIT)) {
      return {
        ok: false,
        error: "Has pedido varias guías seguidas. Espera un momento: cada una gasta cuota real del modelo.",
      };
    }

    const cacheKey = await huellaDeGuia({
      level: input.level,
      language: input.language ?? "",
      code: input.code,
      errorMessage: input.errorMessage,
      question: input.question ?? "",
      codeFacts: input.codeFacts,
      messageFacts: input.messageFacts,
      provider: userKey?.provider ?? "plataforma",
      model: userKey?.model ?? "",
    } satisfies EntradaDeGuia);
    const cached = guiaEnCache(cacheKey);
    if (cached) return { ok: true, guide: cached, cached: true };

    const system = [
      "Eres Cifra, en el estudio del fallo. Conduces el análisis de un error. No entregas una corrección a secas y no reescribes el programa.",
      "Responde solo con un objeto JSON, sin markdown, con estas claves:",
      '{"reading": string, "locate": string, "hypotheses": [{"hypothesis": string, "coste": 1, "howToCheck": string}], "repro": {"failing": string, "passing": string}, "caughtEarlier": string}',
      "reading: qué dice el mensaje con sus palabras y qué deja de garantizarse. 2 a 4 frases.",
      "locate: a qué parte del código apunta el mensaje y qué mirar en las líneas vecinas antes de juzgar. Frases cortas.",
      "hypotheses: de 2 a 4, ordenadas de la más barata de comprobar a la más cara. Cada una lleva su propio coste de comprobarla como número: 1 barata, 2 normal, 3 cara, y concuerda con el orden. Cada howToCheck es una acción concreta: una entrada, un imprimir, una línea que leer.",
      "repro.failing: una entrada pequeña y concreta que, si la hipótesis más probable es cierta, reproduce el fallo. repro.passing: otra entrada que debería seguir funcionando cuando el arreglo sea bueno. Describelas; no afirmes que las has probado.",
      "caughtEarlier: qué aviso, prueba o hábito habría destapado este fallo antes de que lo encontrara esta persona.",
      "Nada inventado presentado como ocurrido: solo deduces a partir del código y del mensaje que te llegan.",
      composeSkills(lockedSkills("codigo")),
    ].join("\n\n");

    const user = [
      `Nivel: ${input.level}`,
      input.language ? `Lenguaje etiquetado por la persona: ${input.language}` : "",
      input.question?.trim() ? `Sospecha de la persona: ${input.question.trim()}` : "No hay sospecha declarada.",
      `Mensaje del error, tal como llegó:\n${input.errorMessage}`,
      input.messageFacts.length
        ? `Observaciones sobre el mensaje, hechas sin ejecutar nada:\n${input.messageFacts.map((fact) => `- ${fact}`).join("\n")}`
        : "",
      input.codeFacts.length
        ? `Observaciones sobre el código, hechas sin ejecutar nada:\n${input.codeFacts.map((fact) => `- ${fact}`).join("\n")}`
        : "",
      `Código:\n${input.code}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const content = await callModel(userKey?.provider ?? "xai", apiKey, userKey?.model ?? "", system, user);
      const guide = parseDebugGuide(content);
      if (!guide) {
        return {
          ok: false,
          error: "El modelo contestó, pero no en la forma esperada. No he inventado una guía.",
          raw: content.slice(0, 1500),
        };
      }
      guardarGuiaEnCache(cacheKey, guide);
      return { ok: true, guide, cached: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : "fallo desconocido";
      return { ok: false, error: `No he podido preguntar al modelo. ${message}` };
    }
  });

function allow(key: string, limit: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
