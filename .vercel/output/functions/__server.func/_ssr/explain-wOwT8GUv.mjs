import { n as mathBrief, t as getMathTopic } from "./math-CnHQOZYR.mjs";
import { a as object, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
import { n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { i as skillIds, n as isSkillId, r as lockedSkills, t as composeSkills } from "./registry-BSIUxcFc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explain-wOwT8GUv.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function parseExplanation(raw) {
	const trimmed = raw.trim();
	const candidate = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() ?? trimmed;
	const start = candidate.indexOf("{");
	const end = candidate.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	let value;
	try {
		value = JSON.parse(candidate.slice(start, end + 1));
	} catch {
		return null;
	}
	if (!value || typeof value !== "object") return null;
	const record = value;
	const summary = asString(record.summary);
	if (!summary) return null;
	return {
		summary,
		walkthrough: asList(record.walkthrough).map((item) => ({
			lines: asString(item.lines) || "—",
			text: asString(item.text)
		})).filter((item) => item.text).slice(0, 6),
		decisions: asList(record.decisions).map((item) => ({
			choice: asString(item.choice),
			why: asString(item.why),
			simpler: asString(item.simpler) || null
		})).filter((item) => item.choice && item.why).slice(0, 3),
		skipped: asString(record.skipped),
		checked: asStrings(record.checked).slice(0, 5),
		inferred: asStrings(record.inferred).slice(0, 5),
		askNext: asString(record.askNext)
	};
}
function asString(value) {
	return typeof value === "string" ? value.trim() : "";
}
function asStrings(value) {
	if (!Array.isArray(value)) return [];
	return value.map(asString).filter(Boolean);
}
function asList(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((item) => Boolean(item) && typeof item === "object");
}
var payloadSchema = object({
	kind: _enum(["codigo", "matematicas"]),
	level: _enum([
		"empezando",
		"practica",
		"profundidad"
	]),
	language: string().max(32).optional(),
	code: string().max(8e3).optional(),
	question: string().max(600).optional(),
	selection: string().max(24).optional(),
	facts: array(string().max(400)).max(16),
	skills: array(string().max(32)).max(8),
	topic: string().max(64).optional()
});
var cache = /* @__PURE__ */ new Map();
var hits = /* @__PURE__ */ new Map();
var WINDOW_MS = 6e5;
var IP_LIMIT = 8;
var GLOBAL_LIMIT = 30;
var askCifra_createServerFn_handler = createServerRpc({
	id: "e3caf1638854effedda0aafc8dc8d3c4b1620a15d37bdef22695abaab08c67c8",
	name: "askCifra",
	filename: "src/lib/ai/explain.ts"
}, (opts) => askCifra.__executeServer(opts));
var askCifra = createServerFn({ method: "POST" }).validator((input) => input).handler(askCifra_createServerFn_handler, async ({ data }) => {
	const parsed = payloadSchema.safeParse(data);
	if (!parsed.success) return {
		ok: false,
		error: "La petición no tiene la forma esperada."
	};
	const input = parsed.data;
	if (input.kind === "codigo" && !input.code?.trim()) return {
		ok: false,
		error: "No hay código que leer."
	};
	if (input.kind === "matematicas" && !getMathTopic(input.topic ?? "")) return {
		ok: false,
		error: "Ese puente matemático no está en la plataforma."
	};
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "La explicación con modelo no está disponible en este entorno. El análisis del texto, si estás en el estudio, no depende de ella."
	};
	let ip = "desconocida";
	try {
		ip = (await import("./ssr.mjs").then((n) => n.a).then((n) => n.t)).getRequestIP() || "desconocida";
	} catch {
		ip = "desconocida";
	}
	if (!allow(`ip:${ip}`, IP_LIMIT) || !allow("global", GLOBAL_LIMIT)) return {
		ok: false,
		error: "Has pedido varias explicaciones seguidas. Espera un momento: cada una gasta cuota real del modelo."
	};
	const chosen = normalizeSkills(input.kind, input.skills);
	const topic = input.kind === "matematicas" ? getMathTopic(input.topic ?? "") : void 0;
	const cacheKey = await digest(JSON.stringify({
		kind: input.kind,
		level: input.level,
		language: input.language ?? "",
		code: input.code ?? "",
		question: input.question ?? "",
		selection: input.selection ?? "",
		facts: input.facts,
		skills: chosen,
		topic: topic?.slug ?? ""
	}));
	const cached = cache.get(cacheKey);
	if (cached) return {
		ok: true,
		explanation: cached,
		cached: true
	};
	const system = [
		"Eres Cifra. Ayudas a entender programas. No eres un generador que suelta código y se calla.",
		"Responde solo con un objeto JSON, sin markdown, con estas claves:",
		"{\"summary\": string, \"walkthrough\": [{\"lines\": string, \"text\": string}], \"decisions\": [{\"choice\": string, \"why\": string, \"simpler\": string | null}], \"skipped\": string, \"checked\": string[], \"inferred\": string[], \"askNext\": string}",
		"summary: 2 a 5 frases. walkthrough: como mucho 6 entradas, solo si ordenan la lectura. decisions: como mucho 3. checked e inferred: como mucho 5 cada una. askNext: una sola pregunta que la persona podría hacer después.",
		"lines usa números del fragmento (\"4\" o \"4-8\") o, si hablas de matemáticas, una etiqueta corta (\"fórmula\", \"pseudocódigo\").",
		"simpler es null si no hace falta una versión más corta.",
		composeSkills(chosen)
	].join("\n\n");
	const user = [
		`Nivel: ${input.level}`,
		`Superficie: ${input.kind}`,
		input.language ? `Lenguaje etiquetado por la persona: ${input.language}` : "",
		input.selection ? `Líneas que ha marcado: ${input.selection}` : "No ha marcado líneas.",
		input.question?.trim() ? `Pregunta: ${input.question.trim()}` : "No hay pregunta. Explica qué hace y cómo se recorre, al nivel indicado.",
		input.facts.length ? `Observaciones de un analizador de texto (no es una ejecución):\n${input.facts.map((fact) => `- ${fact}`).join("\n")}` : "El analizador no aportó observaciones.",
		input.kind === "codigo" ? `Código:\n${input.code}` : "",
		topic ? `Material de la plataforma sobre este puente:\n${mathBrief(topic)}` : ""
	].filter(Boolean).join("\n\n");
	try {
		const content = await complete(apiKey, system, user);
		const explanation = parseExplanation(content);
		if (!explanation) return {
			ok: false,
			error: "El modelo contestó, pero no en la forma esperada. No he inventado una explicación.",
			raw: content.slice(0, 1500)
		};
		remember(cacheKey, explanation);
		return {
			ok: true,
			explanation,
			cached: false
		};
	} catch (error) {
		return {
			ok: false,
			error: `No he podido preguntar al modelo. ${error instanceof Error ? error.message : "fallo desconocido"}`
		};
	}
});
function normalizeSkills(kind, requested) {
	const ids = new Set(lockedSkills(kind));
	for (const id of requested) if (isSkillId(id)) ids.add(id);
	return skillIds.filter((id) => ids.has(id));
}
function allow(key, limit) {
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
function remember(key, explanation) {
	cache.set(key, explanation);
	if (cache.size > 32) {
		const oldest = cache.keys().next().value;
		if (oldest) cache.delete(oldest);
	}
}
async function digest(value) {
	const data = new TextEncoder().encode(value);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function complete(apiKey, system, user) {
	const run = () => fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: .3,
			max_tokens: 1400,
			response_format: { type: "json_object" },
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user
			}]
		}),
		signal: AbortSignal.timeout(28e3)
	});
	let response = await run();
	if (response.status === 429 || response.status >= 500) response = await run();
	if (!response.ok) throw new Error(`Respondió con ${response.status}. No he inventado una explicación.`);
	return (await response.json()).choices?.[0]?.message?.content ?? "";
}
//#endregion
export { askCifra_createServerFn_handler };
