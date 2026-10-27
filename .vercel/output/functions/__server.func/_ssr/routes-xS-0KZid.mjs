import { i as threads, t as concepts } from "./concepts-cn_FJEPI.mjs";
import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as skills, i as skillIds } from "./registry-BSIUxcFc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-xS-0KZid.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		id: "contenido",
		className: "mx-auto max-w-6xl px-5 py-12 sm:py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm text-copper",
				children: "Una plataforma para leer software"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl",
				children: "Entender el código es tan importante como escribirlo."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 max-w-2xl border-l border-copper pl-5 text-lg leading-relaxed text-pretty",
				children: "Generar un programa ya es rápido. Cifra existe para la otra mitad: leerlo, saber qué se está suponiendo y poder ir de una ecuación a los pasos que la calculan."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12 grid gap-10 border-t border-line pt-8 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/estudio",
					className: "group block min-h-11",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm text-muted",
							children: "01"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-serif text-3xl group-hover:text-copper",
							children: "Un programa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-md text-pretty",
							children: "Pega un fragmento. Cifra separa lo que está escrito de lo que solo se puede deducir, y lo explica al nivel que elijas."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/matematicas",
					className: "group block min-h-11",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm text-muted",
							children: "02"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-serif text-3xl group-hover:text-copper",
							children: "Una ecuación"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-md text-pretty",
							children: "De la fórmula al razonamiento, al pseudocódigo y a una implementación cuyos valores puedes mover."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-3xl",
						children: "Hilos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-pretty text-muted",
						children: "La biblioteca no es una lista suelta. Cada concepto empuja hacia el siguiente."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-6 border-t border-line",
						children: threads.map((thread) => {
							const first = concepts.find((concept) => concept.slug === thread.slugs[0]);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "border-b border-line",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/biblioteca/$slug",
									params: { slug: thread.slugs[0] },
									className: "flex min-h-16 flex-col justify-center gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-serif text-2xl",
										children: thread.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-sm text-muted",
										children: first?.title
									})]
								})
							}, thread.id);
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16 max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-3xl",
						children: "Cómo explica"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-pretty",
						children: "La explicación no sale de una orden genérica de «programa bien». Sale de skills que se combinan: pedagogía siempre, y además análisis, matemáticas, algoritmos, depuración, optimización, lenguajes o seguridad, según lo que haya delante."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-5 border-t border-line",
						children: skillIds.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid gap-1 border-b border-line py-3 sm:grid-cols-[10rem_1fr] sm:gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-sm",
								children: skills[id].name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-pretty text-muted",
								children: skills[id].purpose
							})]
						}, id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16 max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-3xl",
						children: "Qué hace esta versión"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-pretty",
						children: "Puedes leer un fragmento, pedir una explicación al nivel que marques y recorrer ocho puentes entre una idea matemática y su código. Hay dieciocho conceptos enlazados y el mismo conteo de palabras escrito en cinco lenguajes, con lo que de verdad cambia."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-pretty",
						children: "Todavía no ejecuta tu código: haría falta un entorno aislado, y fingirlo sería mentir. Tampoco abre un proyecto entero, ni sigue imports entre archivos, ni tiene cuentas. El progreso de lectura se queda en este navegador. Los frameworks no tienen todavía un ensayo propio; si aparecen, será con contenido, no con un botón vacío."
					})
				]
			})
		]
	});
}
//#endregion
export { Home as component };
