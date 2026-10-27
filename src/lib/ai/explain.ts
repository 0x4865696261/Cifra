import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getMathTopic, mathBrief } from "@/lib/content/math";
import { parseExplanation, type Explanation } from "@/lib/ai/parse";
import {
  composeSkills,
  isSkillId,
  lockedSkills,
  skillIds,
  type SkillId,
} from "@/lib/skills/registry";

export type { Explanation };

export type ExplainResult =
  | { ok: true; explanation: Explanation; cached: boolean }
  | { ok: false; error: string; raw?: string };

const payloadSchema = z.object({
  kind: z.enum(["codigo", "matematicas"]),
  level: z.enum(["empezando", "practica", "profundidad"]),
  language: z.string().max(32).optional(),
  code: z.string().max(8000).optional(),
  question: z.string().max(600).optional(),
  selection: z.string().max(24).optional(),
  facts: z.array(z.string().max(400)).max(16),
  skills: z.array(z.string().max(32)).max(8),
  topic: z.string().max(64).optional(),
});

const cache = new Map<string, Explanation>();
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const IP_LIMIT = 8;
const GLOBAL_LIMIT = 30;

export const askCifra = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<ExplainResult> => {
    const parsed = payloadSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: "La petición no tiene la forma esperada." };
    }
    const input = parsed.data;
    if (input.kind === "codigo" && !input.code?.trim()) {
      return { ok: false, error: "No hay código que leer." };
    }
    if (input.kind === "matematicas" && !getMathTopic(input.topic ?? "")) {
      return { ok: false, error: "Ese puente matemático no está en la plataforma." };
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        ok: false,
        error:
          "La explicación con modelo no está disponible en este entorno. El análisis del texto, si estás en el estudio, no depende de ella.",
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
        error: "Has pedido varias explicaciones seguidas. Espera un momento: cada una gasta cuota real del modelo.",
      };
    }

    const chosen = normalizeSkills(input.kind, input.skills);
    const topic = input.kind === "matematicas" ? getMathTopic(input.topic ?? "") : undefined;
    const cacheKey = await digest(
      JSON.stringify({
        kind: input.kind,
        level: input.level,
        language: input.language ?? "",
        code: input.code ?? "",
        question: input.question ?? "",
        selection: input.selection ?? "",
        facts: input.facts,
        skills: chosen,
        topic: topic?.slug ?? "",
      }),
    );
    const cached = cache.get(cacheKey);
    if (cached) return { ok: true, explanation: cached, cached: true };

    const system = [
      "Eres Cifra. Ayudas a entender programas. No eres un generador que suelta código y se calla.",
      "Responde solo con un objeto JSON, sin markdown, con estas claves:",
      '{"summary": string, "walkthrough": [{"lines": string, "text": string}], "decisions": [{"choice": string, "why": string, "simpler": string | null}], "skipped": string, "checked": string[], "inferred": string[], "askNext": string}',
      "summary: 2 a 5 frases. walkthrough: como mucho 6 entradas, solo si ordenan la lectura. decisions: como mucho 3. checked e inferred: como mucho 5 cada una. askNext: una sola pregunta que la persona podría hacer después.",
      "lines usa números del fragmento (\"4\" o \"4-8\") o, si hablas de matemáticas, una etiqueta corta (\"fórmula\", \"pseudocódigo\").",
      "simpler es null si no hace falta una versión más corta.",
      composeSkills(chosen),
    ].join("\n\n");

    const user = [
      `Nivel: ${input.level}`,
      `Superficie: ${input.kind}`,
      input.language ? `Lenguaje etiquetado por la persona: ${input.language}` : "",
      input.selection ? `Líneas que ha marcado: ${input.selection}` : "No ha marcado líneas.",
      input.question?.trim()
        ? `Pregunta: ${input.question.trim()}`
        : "No hay pregunta. Explica qué hace y cómo se recorre, al nivel indicado.",
      input.facts.length
        ? `Observaciones de un analizador de texto (no es una ejecución):\n${input.facts.map((fact) => `- ${fact}`).join("\n")}`
        : "El analizador no aportó observaciones.",
      input.kind === "codigo" ? `Código:\n${input.code}` : "",
      topic ? `Material de la plataforma sobre este puente:\n${mathBrief(topic)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const content = await complete(apiKey, system, user);
      const explanation = parseExplanation(content);
      if (!explanation) {
        return {
          ok: false,
          error: "El modelo contestó, pero no en la forma esperada. No he inventado una explicación.",
          raw: content.slice(0, 1500),
        };
      }
      remember(cacheKey, explanation);
      return { ok: true, explanation, cached: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : "fallo desconocido";
      return { ok: false, error: `No he podido preguntar al modelo. ${message}` };
    }
  });

function normalizeSkills(kind: "codigo" | "matematicas", requested: string[]): SkillId[] {
  const ids = new Set<SkillId>(lockedSkills(kind));
  for (const id of requested) {
    if (isSkillId(id)) ids.add(id);
  }
  return skillIds.filter((id) => ids.has(id));
}

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

function remember(key: string, explanation: Explanation) {
  cache.set(key, explanation);
  if (cache.size > 32) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}

async function digest(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function complete(apiKey: string, system: string, user: string): Promise<string> {
  const run = () =>
    fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.3,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(28000),
    });

  let response = await run();
  if (response.status === 429 || response.status >= 500) {
    response = await run();
  }
  if (!response.ok) {
    throw new Error(`Respondió con ${response.status}. No he inventado una explicación.`);
  }
  const body = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return body.choices?.[0]?.message?.content ?? "";
}
