import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as mathTopics } from "./math-CnHQOZYR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/matematicas-Bg02jRz3.js
var import_jsx_runtime = require_jsx_runtime();
function MathIndex() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		id: "contenido",
		className: "mx-auto max-w-3xl px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm text-copper",
				children: "Matemáticas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "De la fórmula a los pasos."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-pretty",
				children: "Cada puente dice qué significa la idea, cómo se razona, cómo queda en pseudocódigo y cómo se escribe en dos lenguajes. Abajo puedes mover los valores. Eso es un cálculo de Cifra, no una demostración dibujada."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-10 border-t border-line",
				children: mathTopics.map((topic, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-line py-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/matematicas/$slug",
						params: { slug: topic.slug },
						className: "block min-h-11",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-sm text-muted",
								children: [
									String(index + 1).padStart(2, "0"),
									" · ",
									topic.kicker
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-serif text-3xl",
								children: topic.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-sm",
								children: topic.formula
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-pretty text-muted",
								children: topic.promise
							})
						]
					})
				}, topic.slug))
			})
		]
	});
}
//#endregion
export { MathIndex as component };
