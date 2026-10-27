import { i as __toESM } from "../_runtime.mjs";
import { G as isRedirect, S as require_jsx_runtime, X as require_react, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as cn } from "./router-1de0mx_v.mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { r as lockedSkills } from "./registry-BSIUxcFc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/select-Duh75O_q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var askCifra = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("e3caf1638854effedda0aafc8dc8d3c4b1620a15d37bdef22695abaab08c67c8"));
function Button({ tone = "ghost", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("tap inline-flex min-h-11 items-center justify-center gap-2 px-4 font-mono text-sm disabled:cursor-not-allowed disabled:opacity-50", tone === "primary" && "bg-copper text-paper", tone === "quiet" && "bg-ink text-paper", tone === "ghost" && "border border-line bg-paper text-ink", className),
		...props
	});
}
function ExplanationView({ explanation, cached, onAsk, onLines }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "border-t border-line pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm text-copper",
				children: cached ? "Misma explicación, sin otra llamada" : "Explicación"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-serif text-xl leading-relaxed text-pretty",
				children: explanation.summary
			}),
			explanation.walkthrough.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-6 flex flex-col gap-3",
				children: explanation.walkthrough.map((step, index) => {
					const range = parseRange(step.lines);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-l border-line pl-4",
						children: [range && onLines ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "tap min-h-11 text-left font-mono text-sm text-copper",
							onClick: () => onLines(range.start, range.end),
							children: ["Líneas ", step.lines]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm text-copper",
							children: step.lines
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-pretty",
							children: step.text
						})]
					}, `${step.lines}-${index}`);
				})
			}),
			explanation.decisions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-serif text-2xl",
					children: "Decisiones"
				}), explanation.decisions.map((decision) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "font-serif text-lg",
						children: decision.choice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-pretty",
						children: decision.why
					}),
					decision.simpler && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-3 overflow-x-auto bg-ink p-4 font-mono text-sm leading-relaxed whitespace-pre text-paper",
						children: decision.simpler
					})
				] }, decision.choice))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-mono text-sm text-ink",
					children: "En el texto"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactList, {
					items: explanation.checked,
					empty: "Nada que separar como comprobado."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-mono text-sm text-muted",
					children: "Sin ejecutar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactList, {
					items: explanation.inferred,
					empty: "No hace falta suponer un resultado."
				})] })]
			}),
			explanation.skipped && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-pretty text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-sm text-ink",
					children: "Qué no hace falta ahora. "
				}), explanation.skipped]
			}),
			explanation.askNext && onAsk && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					tone: "ghost",
					className: "h-auto max-w-full py-3 text-left whitespace-normal",
					onClick: () => onAsk(explanation.askNext),
					children: ["Preguntar: ", explanation.askNext]
				})
			})
		]
	});
}
function FactList({ items, empty }) {
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-pretty text-muted",
		children: empty
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 flex flex-col gap-2",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "text-pretty",
			children: item
		}, item))
	});
}
function parseRange(lines) {
	const match = lines.trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
	if (!match) return null;
	const start = Number(match[1]);
	const end = Number(match[2] ?? match[1]);
	if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start) return null;
	return {
		start,
		end
	};
}
var ERROR_RE = /error|fall[oa]|excepci|bug|undefined|\bnan\b|panic|segfault|\bnull\b|traza|depura|excepci[oó]n|por qu[eé] (no |falla)/i;
var OPT_RE = /lent[oa]|optimiz|memoria|complej|eficient|coste|cuadr[aá]tic|big-?o|\bo\(/i;
var LANG_RE = /rust|puntero|ownership|pr[eé]stam|goroutine|concurren|tipado|compar(a|ar)|lenguaje|c\+\+|memoria/i;
var SEC_RE = /seguridad|inyecc|\bxss\b|secreto|contrase|password|token|sanitiz|sql/i;
var ALG_RE = /algoritm|recurs|invariant|b[uú]squed|orden(ar|aci)|complej|coste/i;
var DEEP_LANG = /* @__PURE__ */ new Set([
	"rust",
	"c",
	"cpp",
	"go"
]);
function selectSkills(input) {
	const locked = new Set(lockedSkills(input.kind));
	const picks = [];
	const add = (id, reason) => {
		if (picks.some((pick) => pick.id === id)) return;
		picks.push({
			id,
			reason,
			locked: locked.has(id)
		});
	};
	add("pedagogia", "Siempre: ajusta la profundidad y evita explicar de más.");
	if (input.kind === "codigo") add("analisis", "Hay un fragmento que leer. Lo observado no es una ejecución.");
	else {
		add("matematicas", "El camino parte de una idea matemática.");
		add("algoritmos", "La fórmula tiene que convertirse en pasos.");
	}
	if (input.kind === "codigo" && (input.recursion || ALG_RE.test(input.question))) add("algoritmos", input.recursion ? "El texto sugiere una función que se llama a sí misma." : "La pregunta habla de la idea del algoritmo, no solo de la sintaxis.");
	if (ERROR_RE.test(input.question)) add("depuracion", "La pregunta busca un fallo, no un resumen.");
	if (input.nestedLoops || OPT_RE.test(input.question)) add("optimizacion", input.nestedLoops ? "Hay un bucle dentro de otro. Conviene decir si eso importa." : "La pregunta habla de coste, memoria o de una versión más rápida.");
	if (LANG_RE.test(input.question) || input.level === "profundidad" && DEEP_LANG.has(input.language)) add("lenguajes", input.level === "profundidad" && DEEP_LANG.has(input.language) ? "A este nivel, el modelo del lenguaje forma parte de la respuesta." : "La pregunta compara formas de expresar la misma idea.");
	if (SEC_RE.test(input.question)) add("seguridad", "La pregunta mira datos, secretos o fronteras de confianza.");
	return picks;
}
function applySkillChoices(picks, forcedOff, forcedOn) {
	const off = new Set(forcedOff);
	const ids = /* @__PURE__ */ new Set();
	for (const pick of picks) if (pick.locked || !off.has(pick.id)) ids.add(pick.id);
	for (const id of forcedOn) ids.add(id);
	for (const id of off) if (!picks.find((item) => item.id === id)?.locked) ids.delete(id);
	return [...ids];
}
//#endregion
export { selectSkills as a, askCifra as i, ExplanationView as n, useServerFn as o, applySkillChoices as r, Button as t };
