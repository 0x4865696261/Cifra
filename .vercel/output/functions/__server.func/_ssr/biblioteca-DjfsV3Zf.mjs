import { i as threads, t as concepts } from "./concepts-cn_FJEPI.mjs";
import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useReading } from "./reading-EH7lCbSZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/biblioteca-DjfsV3Zf.js
var import_jsx_runtime = require_jsx_runtime();
function LibraryPage() {
	const { read } = useReading();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		id: "contenido",
		className: "mx-auto max-w-3xl px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm text-copper",
				children: "Biblioteca"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "Una red pequeña, y de verdad."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-pretty",
				children: ["Dieciocho textos. No está «todo sobre compiladores». Está lo necesario para no leer cada idea como si empezara de cero. ", read.length > 0 ? `En este navegador hay ${read.length} de ${concepts.length} marcados.` : "Nada marcado todavía."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 flex flex-col gap-10",
				children: threads.map((thread) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl",
					children: thread.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 border-t border-line",
					children: thread.slugs.map((slug) => {
						const concept = concepts.find((item) => item.slug === slug);
						if (!concept) return null;
						const seen = read.includes(slug);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-b border-line",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/biblioteca/$slug",
								params: { slug },
								className: "block py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-baseline justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-serif text-2xl",
										children: concept.title
									}), seen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-sm text-copper",
										children: "leído"
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block text-pretty text-muted",
									children: concept.summary
								})]
							})
						}, slug);
					})
				})] }, thread.id))
			})
		]
	});
}
//#endregion
export { LibraryPage as component };
