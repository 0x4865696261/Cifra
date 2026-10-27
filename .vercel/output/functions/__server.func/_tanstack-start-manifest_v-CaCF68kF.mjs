//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-CaCF68kF.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspace/src/routes/__root.tsx",
		children: [
			"/",
			"/biblioteca",
			"/estudio",
			"/lenguajes",
			"/matematicas"
		],
		preloads: [
			"/assets/index-B4LP2cPe.js",
			"/assets/react-DB-4Zxce.js",
			"/assets/invariant-BeDuhpwN.js",
			"/assets/link-FStLKvPX.js",
			"/assets/useRouter-CnG7R4es.js"
		],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-B4LP2cPe.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: ["/assets/routes-BUuMkHyc.js", "/assets/registry-BUP86G0H.js"]
	},
	"/biblioteca": {
		filePath: "/workspace/src/routes/biblioteca.tsx",
		children: ["/biblioteca/$slug"],
		preloads: ["/assets/biblioteca-gtMXzrCM.js", "/assets/reading-fb91O38D.js"]
	},
	"/estudio": {
		filePath: "/workspace/src/routes/estudio.tsx",
		children: void 0,
		preloads: [
			"/assets/estudio-C1f_CodE.js",
			"/assets/select-Cx9_G7ZL.js",
			"/assets/structure-DKJFQvUM.js",
			"/assets/registry-BUP86G0H.js"
		]
	},
	"/lenguajes": {
		filePath: "/workspace/src/routes/lenguajes.tsx",
		children: void 0,
		preloads: [
			"/assets/lenguajes-DWCBeKYV.js",
			"/assets/code-block-BfgKoXEe.js",
			"/assets/structure-DKJFQvUM.js"
		]
	},
	"/matematicas": {
		filePath: "/workspace/src/routes/matematicas.tsx",
		children: ["/matematicas/$slug"],
		preloads: ["/assets/matematicas-D1jb8PU5.js"]
	},
	"/biblioteca/$slug": {
		filePath: "/workspace/src/routes/biblioteca.$slug.tsx",
		children: void 0,
		preloads: ["/assets/biblioteca._slug-DkhdeTzx.js", "/assets/code-block-BfgKoXEe.js"]
	},
	"/matematicas/$slug": {
		filePath: "/workspace/src/routes/matematicas.$slug.tsx",
		children: void 0,
		preloads: [
			"/assets/matematicas._slug-B5rw5RSJ.js",
			"/assets/select-Cx9_G7ZL.js",
			"/assets/code-block-BfgKoXEe.js",
			"/assets/registry-BUP86G0H.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
