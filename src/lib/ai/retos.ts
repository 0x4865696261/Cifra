import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callModel, cleanApiKey, isProviderId, keyLooksValid, type ProviderId } from "@/lib/ai/providers";
import { limitesEntrada } from "@/lib/ai/limits";
import {
  explicarVeredictoLocal,
  parseDefensa,
  lineasDePruebas,
  type GuiaVeredicto,
  type JuicioDefensa,
  type ResultadoDefensa,
} from "@/lib/ai/retos-parse";

/**
 * La voz del modelo en los retos (0.4.C/D). Dos pasos, siempre recibiendo el resultado REAL de
 * la ejecución (el `RunResult` de 0.3): el modelo explica el veredicto y juzga la defensa,
 * pero no decide nada del resultado. `explicarVeredictoLocal` — que valida la respuesta del
 * modelo — recibe el booleano de `todasPasadas` y solo lo deja pasar.
 */

export type { GuiaVeredicto, JuicioDefensa };
export type { ResultadoDefensa };

export type ResultadoDeVeredicto =
  | { ok: true; guia: GuiaVeredicto; superado: boolean; cached: boolean }
  | { ok: false; error: string; raw?: string };

const senalSchema = z.object({
  tipo: z.enum(["foco-perdido", "pegado-grande", "ritmo-imposible"]),
  detalle: z.string().max(300),
});

const payloadVeredicto = z.object({
  enunciado: z.string().max(limitesEntrada.mensaje),
  codigo: z.string().max(limitesEntrada.codigo),
  paso: z.boolean(),
  pruebas: z
    .array(
      z.object({
        id: z.string().max(80).optional(),
        nombre: z.string().max(200),
        pasada: z.boolean(),
        obtenido: z.string().max(400).optional(),
        error: z.string().max(600).optional(),
      }),
    )
    .max(20),
  señales: z.array(senalSchema).max(20),
  provider: z.string().max(16).optional(),
  apiKey: z.string().max(400).optional(),
  model: z.string().max(64).optional(),
});

const payloadDefensa = z.object({
  enunciado: z.string().max(limitesEntrada.mensaje),
  codigo: z.string().max(limitesEntrada.codigo),
  preguntas: z.array(z.string().min(1).max(600)).min(1).max(2),
  respuestas: z.array(z.string().max(4000)).min(1).max(2),
  señales: z.array(senalSchema).max(20).optional(),
  provider: z.string().max(16).optional(),
  apiKey: z.string().max(400).optional(),
  model: z.string().max(64).optional(),
});

const cache = new Map<string, unknown>();
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const IP_LIMIT = 8;
const GLOBAL_LIMIT = 30;

/**
 * El paso 4 de 0.4.C: la IA lee el código, el `RunResult` y el enunciado, y explica qué
 * cumple, qué no y por qué. ElLLamante marca `paso` con `todasPasadas(resultado)` y aquí
 * llega como dato, no como decisión: la guía que vuelve no lleva veredicto.
 */export const explicarVeredicto = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<ResultadoDeVeredicto> => {
    const parsed = payloadVeredicto.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: "La petición no tiene la forma esperada." };
    }
    const input = parsed.data;

    // Una clave propia llega con la petición, se usa en esta llamada y no se guarda.
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
        error: "Has pedido varias explicaciones seguidas. Espera un momento: cada una gasta cuota real del modelo.",
      };
    }

    const cacheKey = await digest(
      JSON.stringify({
        v: 1,
        enunciado: input.enunciado,
        codigo: input.codigo,
        paso: input.paso,
        pruebas: input.pruebas,
        señales: input.señales,
        provider: userKey?.provider ?? "plataforma",
        model: userKey?.model ?? "",
      }),
    );
    const cached = cache.get(cacheKey);
    if (cached) return { ok: true, guia: cached as GuiaVeredicto, superado: input.paso, cached: true };

    const system = [
      "Eres Cifra. Acabas de correr el código de una persona contra las pruebas fijas del reto.",
      "Tu trabajo es EXPLICAR. El veredicto —superado o no— ya lo dijo la ejecución y no te corresponde: no declares resultado.",
      "Responde solo con un objeto JSON, sin markdown, con EXACTAMENTE estas claves:",
      '{"resumen": string, "constata": [{"texto": string, "procedencia": "prueba" | "opinion"}], "siNoPasa": string}',
      "resumen: 1 a 4 frases, contando lo que la ejecución ya dijo.",
      "constata: de 1 a 6 comentarios. `procedencia: \"prueba\"` cuando salga de la lista de pruebas que te paso (cítala por su nombre); `\"opinion\"` para lo demás (claridad del código, detalles del enunciado).",
      "siNoPasa: qué mirar primero si no pasó; cadena vacía si pasó. NO propongas código resuelto.",
    ].join("\n\n");

    const user = [
      `Enunciado del reto:\n${input.enunciado}`,
      `La ejecución real contra las pruebas fijas dijo: ${input.paso ? "todas las pruebas pasaron" : "al menos una prueba falló"}.`,
      `Resultado de las pruebas:\n${lineasDePruebas(
        input.pruebas.map((prueba) => ({
          id: prueba.id ?? "",
          nombre: prueba.nombre,
          pasada: prueba.pasada,
          obtenido: prueba.obtenido,
          error: prueba.error,
        })),
      )}`,
      input.señales.length
        ? `Notas de cómo trabajó (solo contexto, no acusa a nadie): ${input.señales.map((senal) => `${senal.tipo}: ${senal.detalle}`).join("; ")}.`
        : "",
      `Código entregado:\n${input.codigo}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const content = await callModel(userKey?.provider ?? "xai", apiKey, userKey?.model ?? "", system, user);
      const explicado = explicarVeredictoLocal(input.paso, content);
      if (!explicado.ok) {
        return { ok: false, error: explicado.error, raw: explicado.raw };
      }
      remember(cacheKey, explicado.guia);
      return { ok: true, guia: explicado.guia, superado: explicado.superado, cached: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : "fallo desconocido";
      return { ok: false, error: `No he podido preguntar al modelo. ${message}` };
    }
  });

/** El paso 5 de 0.4.D: tras superar, una o dos preguntas del reto; el modelo juzga si explica. */
export const defenderSolucion = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<ResultadoDefensa> => {
    const parsed = payloadDefensa.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: "La petición no tiene la forma esperada." };
    }
    const input = parsed.data;
    // Las respuestas van pinchadas a las preguntas: una defensa sin respuesta no se juzga.
    if (input.respuestas.length !== input.preguntas.length) {
      return { ok: false, error: "Falta una respuesta, o sobra una." };
    }

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
    if (!allow(`defensa-ip:${ip}`, IP_LIMIT) || !allow("defensa-global", GLOBAL_LIMIT)) {
      return {
        ok: false,
        error: "Has pedido varias defensas seguidas. Espera un momento: cada una gasta cuota real del modelo.",
      };
    }

    const system = [
      "Eres Cifra. Una persona acaba de superar un reto y responde a las preguntas de defensa sobre SU propio código.",
      "Tu trabajo es juzgar si cada respuesta demuestra que entiende lo que escribió: si el código hace, cómo lo hace y por qué así.",
      "Responde solo con un objeto JSON, sin markdown, con EXACTAMENTE esta forma:",
      '{"juicios": [{"entendido": boolean, "comentario": string}]}',
      "un juicio por pregunta, EN ORDEN. `entendido` es true solo si la respuesta toca la pieza correcta del código y la explica con sus palabras; false si la repite sin entenderla, la desvía, o no sabe para qué sirve.",
      "comentario: 1 a 3 frases que digan qué convenció o qué faltó.",
      "Las notas de cómo trabajó esta persona son contexto, no acusación: cuídalas al preguntar, sin cargar el tono.",
    ].join("\n\n");

    const user = [
      `Enunciado del reto:\n${input.enunciado}`,
      `Código entregado (el de la persona, tal cual):\n${input.codigo}`,
      input.señales?.length
        ? `Notas de cómo trabajó esta persona en el editor (contexto, no acusación): ${input.señales.map((senal) => `${senal.tipo}: ${senal.detalle}`).join("; ")}.`
        : "",
      ...input.preguntas.map((pregunta, i) => {
        const respuesta = input.respuestas[i];
        return `Pregunta ${i + 1} (del reto, no tuya): ${pregunta}\nRespuesta de la persona: ${respuesta.trim() === "" ? "(vacía — ¿respondió de verdad?)" : respuesta}`;
      }),
    ].join("\n\n");

    try {
      const content = await callModel(userKey?.provider ?? "xai", apiKey, userKey?.model ?? "", system, user);
      const juicios = parseDefensa(content, input.preguntas.length);
      if (!juicios) {
        return {
          ok: false,
          error:
            "El modelo contestó, pero no en la forma esperada, o intentó declarar el resultado, que no le corresponde.",
          raw: content.slice(0, 1500),
        };
      }
      // La defensa se defiende entera: una sola respuesta sin entender deja la marca de repaso.
      return { ok: true, juicios, defendido: juicios.every((juicio) => juicio.entendido) };
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

function remember(key: string, guia: GuiaVeredicto) {
  cache.set(key, guia);
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
