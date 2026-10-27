import { i as __toESM } from "../_runtime.mjs";
import { X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reading-EH7lCbSZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "cifra.leidos";
function useReading() {
	const [read, setRead] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) setRead(parsed.filter((item) => typeof item === "string"));
		} catch {
			setRead([]);
		}
	}, []);
	const mark = (slug) => {
		setRead((prev) => {
			if (prev.includes(slug)) return prev;
			const next = [...prev, slug];
			localStorage.setItem(KEY, JSON.stringify(next));
			return next;
		});
	};
	return {
		read,
		mark
	};
}
//#endregion
export { useReading as t };
