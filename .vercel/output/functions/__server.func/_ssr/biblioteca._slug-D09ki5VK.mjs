import { i as __toESM } from "../_runtime.mjs";
import { n as getConcept, r as threadOf } from "./concepts-cn_FJEPI.mjs";
import { S as require_jsx_runtime, X as require_react, Y as notFound, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useReading } from "./reading-EH7lCbSZ.mjs";
import { r as Route$1 } from "./router-1de0mx_v.mjs";
import { t as CodeBlock } from "./code-block-CBoRvi11.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/biblioteca._slug-D09ki5VK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConceptPage() {
	const { slug } = Route$1.useParams();
	const concept = getConcept(slug);
	if (!concept) throw notFound();
	const { mark } = useReading();
	const thread = threadOf(slug);
	const position = thread?.slugs.indexOf(slug) ?? -1;
	const previous = position > 0 ? thread?.slugs[position - 1] : void 0;
	const next = thread && position >= 0 ? thread.slugs[position + 1] : void 0;
	(0, import_react.useEffect)(() => {
		mark(slug);
	}, [mark, slug]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		id: "contenido",
		className: "mx-auto max-w-2xl px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm text-copper",
				children: concept.thread
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: concept.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-lg text-pretty",
				children: concept.summary
			}),
			concept.body.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-pretty",
				children: paragraph
			}, paragraph)),
			concept.code && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					source: concept.code.source,
					label: concept.code.language
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-pretty text-muted",
					children: concept.code.caption
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Sigue el hilo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 border-t border-line",
						children: [
							previous && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Neighbor, { slug: previous }),
							next && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Neighbor, { slug: next }),
							concept.see.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Neighbor, { slug: item }, item))
						]
					}),
					concept.also && concept.also.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col",
						children: concept.also.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: item.href,
							className: "inline-flex min-h-11 items-center font-mono text-sm text-copper",
							children: item.label
						}) }, item.href))
					})
				]
			})
		]
	});
}
function Neighbor({ slug }) {
	const concept = getConcept(slug);
	if (!concept) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "border-b border-line",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/biblioteca/$slug",
			params: { slug },
			className: "flex min-h-11 items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-serif text-xl",
				children: concept.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-sm text-muted",
				children: concept.thread
			})]
		})
	});
}
//#endregion
export { ConceptPage as component };
