import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as useLevel, i as levelOptions, o as cn } from "./router-1de0mx_v.mjs";
import { a as skills, i as skillIds } from "./registry-BSIUxcFc.mjs";
import { a as selectSkills, i as askCifra, n as ExplanationView, o as useServerFn, r as applySkillChoices, t as Button } from "./select-Duh75O_q.mjs";
import { i as languageLabels, n as isLanguageId, r as languageIds, t as analyze } from "./structure-CpTrzxSL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/estudio-DSnLpKlg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var samples = [
	{
		id: "palabras",
		title: "Contar palabras",
		language: "python",
		hint: "Un diccionario y un bucle. Sirve para ver cómo se lee un programa pequeño de principio a fin.",
		suggestedQuestion: "¿Por qué un diccionario y no una lista de pares?",
		code: `def frecuencias(texto):
    conteo = {}
    for palabra in texto.lower().split():
        conteo[palabra] = conteo.get(palabra, 0) + 1
    return conteo
`
	},
	{
		id: "media",
		title: "Una media frágil",
		language: "javascript",
		hint: "La operación es simple. La pregunta interesante es qué pasa con una lista vacía.",
		suggestedQuestion: "¿Qué pasa si numeros está vacío, y cómo lo descubriría sin que nadie me lo diga?",
		code: `function media(numeros) {
  let suma = 0;
  for (const n of numeros) {
    suma += n;
  }
  return suma / numeros.length;
}
`
	},
	{
		id: "parejas",
		title: "Todas las parejas",
		language: "python",
		hint: "Dos bucles, uno dentro del otro. La forma del código ya dice algo del coste.",
		suggestedQuestion: "¿Hace falta recorrer la lista dos veces así? ¿Cuándo sí y cuándo no?",
		code: `def parejas(nombres):
    resultado = []
    for i in range(len(nombres)):
        for j in range(len(nombres)):
            if i != j:
                resultado.append((nombres[i], nombres[j]))
    return resultado
`
	}
];
function clampLine(value, total) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return 1;
	return Math.min(Math.max(1, Math.floor(parsed)), Math.max(total, 1));
}
function Studio() {
	const explain = useServerFn(askCifra);
	const { level, setLevel } = useLevel();
	const [sampleId, setSampleId] = (0, import_react.useState)(samples[0].id);
	const [language, setLanguage] = (0, import_react.useState)(samples[0].language);
	const [code, setCode] = (0, import_react.useState)(samples[0].code);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [question, setQuestion] = (0, import_react.useState)("");
	const [fromLine, setFromLine] = (0, import_react.useState)(1);
	const [toLine, setToLine] = (0, import_react.useState)(1);
	const [forcedOn, setForcedOn] = (0, import_react.useState)([]);
	const [forcedOff, setForcedOff] = (0, import_react.useState)([]);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const analysis = (0, import_react.useMemo)(() => analyze(code, language), [code, language]);
	const lines = code.split(/\r?\n/);
	const picks = (0, import_react.useMemo)(() => selectSkills({
		kind: "codigo",
		level,
		language,
		question,
		nestedLoops: analysis.nestedLoops,
		recursion: analysis.recursion
	}), [
		analysis.nestedLoops,
		analysis.recursion,
		language,
		level,
		question
	]);
	const active = applySkillChoices(picks, forcedOff, forcedOn);
	const inactive = skillIds.filter((id) => !active.includes(id));
	const selection = fromLine === toLine ? `${fromLine}` : `${Math.min(fromLine, toLine)}-${Math.max(fromLine, toLine)}`;
	const load = (sample) => {
		setSampleId(sample.id);
		setLanguage(sample.language);
		setCode(sample.code);
		setQuestion("");
		setFromLine(1);
		setToLine(1);
		setForcedOn([]);
		setForcedOff([]);
		setResult(null);
		setEditing(false);
	};
	const pickLine = (line, shift) => {
		if (!shift) {
			setFromLine(line);
			setToLine(line);
			return;
		}
		setToLine(line);
	};
	const toggle = (id) => {
		if (picks.find((item) => item.id === id)?.locked) return;
		if (active.includes(id)) {
			setForcedOff((prev) => [.../* @__PURE__ */ new Set([...prev, id])]);
			setForcedOn((prev) => prev.filter((item) => item !== id));
		} else {
			setForcedOn((prev) => [.../* @__PURE__ */ new Set([...prev, id])]);
			setForcedOff((prev) => prev.filter((item) => item !== id));
		}
	};
	const submit = async () => {
		setPending(true);
		setResult(null);
		try {
			const response = await explain({ data: {
				kind: "codigo",
				level,
				language,
				code,
				question,
				selection,
				facts: analysis.facts.map((fact) => `L${fact.lines}: ${fact.text}`),
				skills: active
			} });
			setResult(response);
		} catch (error) {
			setResult({
				ok: false,
				error: error instanceof Error ? error.message : "No se ha podido pedir la explicación."
			});
		} finally {
			setPending(false);
		}
	};
	const low = Math.min(fromLine, toLine);
	const high = Math.max(fromLine, toLine);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-2 font-mono text-sm",
					children: ["Lenguaje", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "min-h-11 border border-line bg-paper px-3 text-ink",
						value: language,
						onChange: (event) => {
							if (isLanguageId(event.target.value)) setLanguage(event.target.value);
						},
						children: languageIds.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: id,
							children: languageLabels[id]
						}, id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-sm text-muted",
					children: [analysis.lineCount, " líneas"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [samples.map((sample) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					tone: sample.id === sampleId ? "quiet" : "ghost",
					onClick: () => load(sample),
					children: sample.title
				}, sample.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					tone: "ghost",
					onClick: () => setEditing((value) => !value),
					children: editing ? "Cerrar editor" : "Editar el texto"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-pretty text-muted",
				children: samples.find((sample) => sample.id === sampleId)?.hint
			}),
			editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value: code,
				onChange: (event) => {
					setCode(event.target.value);
					setSampleId("");
					setResult(null);
				},
				spellCheck: false,
				"aria-label": "Código",
				className: "mt-4 min-h-48 w-full border border-line bg-paper p-3 font-mono text-sm leading-6 text-ink"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 max-h-[32rem] overflow-auto border border-line",
				children: lines.map((line, index) => {
					const number = index + 1;
					const selected = number >= low && number <= high;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": selected,
						onClick: (event) => pickLine(number, event.shiftKey),
						className: cn("grid min-h-11 w-max min-w-full grid-cols-[3rem_1fr] items-start gap-3 border-l-2 px-3 py-2 text-left font-mono text-sm leading-6", selected ? "border-copper bg-line text-ink" : "border-transparent text-ink"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted tabular-nums",
							children: number
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "whitespace-pre",
							children: line || " "
						})]
					}, number);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-sm text-muted",
				children: [
					"Pulsa una línea. Con la tecla de mayúsculas, alargas el tramo. Ahora: ",
					selection,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 font-mono text-sm",
					children: ["Desde", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: 1,
						max: Math.max(lines.length, 1),
						value: fromLine,
						onChange: (event) => setFromLine(clampLine(event.target.value, lines.length)),
						className: "min-h-11 border border-line bg-paper px-3 tabular-nums text-ink"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 font-mono text-sm",
					children: ["Hasta", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: 1,
						max: Math.max(lines.length, 1),
						value: toLine,
						onChange: (event) => setToLine(clampLine(event.target.value, lines.length)),
						className: "min-h-11 border border-line bg-paper px-3 tabular-nums text-ink"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-serif text-2xl",
				children: "Lo que se ve en el texto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-3",
				children: analysis.facts.map((fact) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border-l border-line pl-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-sm text-copper",
						children: ["Líneas ", fact.lines]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-pretty",
						children: fact.text
					})]
				}, `${fact.lines}-${fact.text}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-pretty text-muted",
				children: "Esto no ejecuta el programa. Se equivoca con cadenas de varias líneas y con sintaxis rara. Si una explicación necesita un valor concreto, tiene que decir que lo supone."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "font-mono text-sm",
					children: "Nivel"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid grid-cols-3 border border-line",
					children: levelOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": level === option.id,
						onClick: () => setLevel(option.id),
						className: cn("tap min-h-11 px-2 font-mono text-sm", level === option.id ? "bg-ink text-paper" : "text-muted"),
						children: option.label
					}, option.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-pretty text-muted",
					children: levelOptions.find((option) => option.id === level)?.hint
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 flex flex-col gap-2 font-mono text-sm",
				children: ["Pregunta, si tienes una", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: question,
					onChange: (event) => setQuestion(event.target.value),
					rows: 3,
					maxLength: 600,
					className: "w-full border border-line bg-paper p-3 font-serif text-base text-ink",
					placeholder: "Si la dejas vacía, Cifra explica el recorrido."
				})]
			}),
			samples.find((sample) => sample.id === sampleId) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-2 min-h-11 text-left font-mono text-sm text-copper",
				onClick: () => setQuestion(samples.find((sample) => sample.id === sampleId)?.suggestedQuestion ?? ""),
				children: "Usar la pregunta del ejemplo"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-serif text-2xl",
				children: "Skills"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-pretty text-muted",
				children: "No es un adorno. Cada una añade instrucciones distintas a la explicación. Pedagogía y análisis van siempre."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: picks.filter((pick) => active.includes(pick.id)).map((pick) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col gap-1 border border-line px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-sm",
							children: skills[pick.id].name
						}), pick.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-sm text-muted",
							children: "fija"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 font-mono text-sm text-copper",
							onClick: () => toggle(pick.id),
							children: "Quitar"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-pretty text-muted",
						children: pick.reason
					})]
				}, pick.id))
			}),
			inactive.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: inactive.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					tone: "ghost",
					onClick: () => toggle(id),
					children: ["Añadir ", skills[id].name]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				tone: "primary",
				className: "mt-6 w-full",
				disabled: pending || !code.trim(),
				onClick: () => void submit(),
				children: pending ? "Leyendo el programa…" : "Explicar este programa"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-sm text-muted",
				children: "Una llamada al modelo, solo cuando pulsas. No parte sola."
			}),
			result && !result.ok && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 border-l border-copper pl-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-pretty",
					children: result.error
				}), result.raw && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-3 overflow-x-auto font-mono text-sm whitespace-pre-wrap text-muted",
					children: result.raw
				})]
			}),
			result?.ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExplanationView, {
				explanation: result.explanation,
				cached: result.cached,
				onAsk: (next) => {
					setQuestion(next);
					setResult(null);
				},
				onLines: (start, end) => {
					setFromLine(start);
					setToLine(end);
				}
			})
		] })]
	});
}
function EstudioPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		id: "contenido",
		className: "mx-auto max-w-6xl px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm text-copper",
				children: "Estudio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 max-w-2xl font-serif text-4xl",
				children: "Lee un programa antes de reescribirlo."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-pretty",
				children: "El análisis de la izquierda mira el texto. La explicación de la derecha, si la pides, usa el modelo y las skills que dejes activas. No son la misma cosa."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {})
			})
		]
	});
}
//#endregion
export { EstudioPage as component };
