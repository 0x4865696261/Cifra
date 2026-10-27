//#region node_modules/.nitro/vite/services/ssr/assets/structure-CpTrzxSL.js
var languageIds = [
	"python",
	"javascript",
	"typescript",
	"rust",
	"go",
	"c",
	"cpp",
	"java",
	"csharp",
	"ruby",
	"php",
	"sql",
	"html",
	"css"
];
var languageLabels = {
	python: "Python",
	javascript: "JavaScript",
	typescript: "TypeScript",
	rust: "Rust",
	go: "Go",
	c: "C",
	cpp: "C++",
	java: "Java",
	csharp: "C#",
	ruby: "Ruby",
	php: "PHP",
	sql: "SQL",
	html: "HTML",
	css: "CSS"
};
var familyOf = {
	python: "python",
	ruby: "ruby",
	javascript: "brace",
	typescript: "brace",
	rust: "brace",
	go: "brace",
	c: "brace",
	cpp: "brace",
	java: "brace",
	csharp: "brace",
	php: "brace",
	sql: "sql",
	html: "html",
	css: "css"
};
var LOOP_RE = /^\s*(for|while|foreach|loop)\b/;
var CONTROL_WORDS = /* @__PURE__ */ new Set([
	"if",
	"for",
	"while",
	"switch",
	"catch",
	"return",
	"sizeof",
	"else"
]);
function isLanguageId(value) {
	return languageIds.includes(value);
}
function analyze(source, language) {
	const family = familyOf[language];
	const scanned = scan(source, family === "python" || family === "ruby");
	const facts = [];
	const nonEmpty = scanned.filter((line) => line.text.trim().length > 0).length;
	if (scanned.length === 0 || nonEmpty === 0) return {
		language,
		lineCount: scanned.length,
		facts: [{
			lines: "1",
			text: "El fragmento está vacío."
		}],
		nestedLoops: false,
		recursion: false,
		hasErrorHandling: false
	};
	if (family === "html") return finish(language, scanned, analyzeHtml(scanned), false, false, false);
	if (family === "css") return finish(language, scanned, analyzeCss(scanned), false, false, false);
	if (family === "sql") return finish(language, scanned, analyzeSql(scanned), false, false, false);
	const definitions = findDefinitions(scanned, language);
	if (definitions.length > 0) {
		const listed = definitions.slice(0, 6).map((item) => `${item.name} (línea ${item.line})`).join(", ");
		const extra = definitions.length > 6 ? ` y ${definitions.length - 6} más` : "";
		facts.push({
			lines: span(definitions.map((item) => item.line)),
			text: `${definitions.length === 1 ? "Hay una definición" : `Hay ${definitions.length} definiciones`}: ${listed}${extra}.`
		});
	}
	const imports = findImports(scanned, language);
	for (const item of imports.slice(0, 4)) facts.push(item);
	const branches = scanned.filter((line) => /^\s*(if|elif|elsif|elseif|switch|match|case)\b/.test(line.code));
	if (branches.length > 0) facts.push({
		lines: span(branches.map((line) => lineNo(scanned, line))),
		text: branches.length === 1 ? "Hay una bifurcación: el programa no sigue un único camino." : `Hay ${branches.length} bifurcaciones. El camino depende de condiciones.`
	});
	const loops = findLoops(scanned, family);
	if (loops.lines.length > 0) facts.push({
		lines: span(loops.lines),
		text: loops.lines.length === 1 ? "Hay un bucle. Algo se repite mientras una condición siga siendo cierta, o una vez por elemento." : `Hay ${loops.lines.length} bucles.`
	});
	if (loops.nested.length > 0) {
		const first = loops.nested[0];
		facts.push({
			lines: `${first.inner}`,
			text: `El bucle de la línea ${first.inner} está dentro del de la línea ${first.outer}. Si ambos recorren los mismos datos, el trabajo crece más deprisa que el tamaño de la lista. Es una lectura de la forma, no una medición.`
		});
	}
	const errorLines = scanned.map((line, index) => ({
		line: index + 1,
		code: line.code
	})).filter((line) => /\b(try|catch|except|finally|throw|panic|unwrap|raise)\b|Result<|Option</.test(line.code));
	if (errorLines.length > 0) facts.push({
		lines: span(errorLines.map((line) => line.line)),
		text: "Hay una construcción de error o de ausencia de valor. El texto contempla que algo puede no salir bien; eso no dice si sale bien."
	});
	const recursion = findRecursion(scanned, definitions, family);
	for (const item of recursion) facts.push({
		lines: `${item.call}`,
		text: `${item.name} vuelve a aparecer como llamada dentro de su propio cuerpo (línea ${item.call}). Puede ser recursión. No he ejecutado las llamadas.`
	});
	const entries = definitions.filter((item) => item.name === "main" || item.name === "Main");
	const pythonMain = scanned.findIndex((line) => line.code.includes("__name__"));
	if (entries.length > 0) facts.push({
		lines: `${entries[0].line}`,
		text: "Hay un main. En muchos programas es la puerta por la que empieza la ejecución; aquí solo consta que está escrito."
	});
	else if (pythonMain >= 0) facts.push({
		lines: `${pythonMain + 1}`,
		text: "Aparece __name__. En Python suele usarse para que un archivo pueda ejecutarse o importarse. No he comprobado cómo se lanza."
	});
	const maxDepth = scanned.reduce((max, line) => Math.max(max, line.depthAfter), 0);
	if (family === "brace" && maxDepth >= 4) facts.push({
		lines: "1",
		text: `Los bloques llegan a anidar ${maxDepth} niveles. No es un defecto: es una pista de que hay que leer de fuera hacia dentro.`
	});
	if (facts.length === 0) facts.push({
		lines: "1",
		text: "No veo definiciones, bucles ni imports. Puede ser un trozo suelto, datos, o un lenguaje mal etiquetado."
	});
	return finish(language, scanned, facts, loops.nested.length > 0, recursion.length > 0, errorLines.length > 0);
}
function finish(language, scanned, facts, nestedLoops, recursion, hasErrorHandling) {
	return {
		language,
		lineCount: scanned.length,
		facts,
		nestedLoops,
		recursion,
		hasErrorHandling
	};
}
function scan(source, hashComment) {
	const lines = source.split(/\r?\n/);
	let state = "code";
	let depth = 0;
	const out = [];
	for (const text of lines) {
		const depthBefore = depth;
		let code = "";
		let lineState = state;
		for (let i = 0; i < text.length; i++) {
			const char = text[i];
			const next = text[i + 1];
			if (lineState === "block") {
				if (char === "*" && next === "/") {
					lineState = "code";
					i += 1;
				}
				continue;
			}
			if (lineState === "sq" || lineState === "dq" || lineState === "bt") {
				if (char === "\\") {
					i += 1;
					continue;
				}
				if (char === (lineState === "sq" ? "'" : lineState === "dq" ? "\"" : "`")) lineState = "code";
				continue;
			}
			if (char === "/" && next === "/") break;
			if (hashComment && char === "#") break;
			if (char === "/" && next === "*") {
				lineState = "block";
				i += 1;
				continue;
			}
			if (char === "'") {
				lineState = "sq";
				continue;
			}
			if (char === "\"") {
				lineState = "dq";
				continue;
			}
			if (char === "`") {
				lineState = "bt";
				continue;
			}
			if (char === "{") depth += 1;
			else if (char === "}") depth = Math.max(0, depth - 1);
			code += char;
		}
		state = lineState === "block" ? "block" : "code";
		out.push({
			text,
			code,
			depthBefore,
			depthAfter: depth
		});
	}
	return out;
}
function findDefinitions(lines, language) {
	const found = [];
	lines.forEach((line, index) => {
		const name = definitionName(line.code.trim(), language);
		if (name) found.push({
			name,
			line: index + 1
		});
	});
	return found;
}
function definitionName(code, language) {
	const patterns = [];
	if (language === "python") patterns.push(/^(?:async\s+def|def)\s+([A-Za-z_]\w*)/);
	if (language === "ruby") patterns.push(/^def\s+(?:self\.)?([A-Za-z_]\w*[!?]?)/);
	if (language === "php") patterns.push(/^function\s+([A-Za-z_]\w*)/);
	if (language === "rust") patterns.push(/^(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+([A-Za-z_]\w*)/);
	if (language === "go") patterns.push(/^func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)/);
	if (language === "javascript" || language === "typescript") {
		patterns.push(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s+([A-Za-z_$][\w$]*)/);
		patterns.push(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/);
	}
	if (language === "java" || language === "csharp" || language === "c" || language === "cpp" || language === "php") {
		const match = code.match(/^(?:[\w.[\],<>:*&\s]+)\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*(?:\{|=>)?$/);
		if (match && !CONTROL_WORDS.has(match[1]) && /\s/.test(code.slice(0, code.indexOf(match[1])))) return match[1];
	}
	for (const pattern of patterns) {
		const match = code.match(pattern);
		if (match) return match[1];
	}
	return null;
}
function findImports(lines, language) {
	const facts = [];
	lines.forEach((line, index) => {
		const code = line.code.trim();
		const lineNo = index + 1;
		let text = null;
		if (language === "python") {
			const from = code.match(/^from\s+(\S+)\s+import\b/);
			const plain = code.match(/^import\s+(\S+)/);
			if (from) text = `Importa nombres desde ${from[1]}.`;
			else if (plain) text = `Importa ${plain[1]}.`;
		} else if (language === "javascript" || language === "typescript") {
			if (/^import\b/.test(code)) text = "Hay un import. El archivo depende de otro módulo que no está aquí.";
		} else if (language === "rust" && /^use\b/.test(code)) text = "Hay un use. El nombre viene de otro módulo.";
		else if (language === "go" && /^import\b/.test(code)) text = "Hay un import.";
		else if ((language === "c" || language === "cpp") && /^#\s*include\b/.test(line.text.trim())) text = "Hay un include. Parte del programa vive en otro archivo.";
		else if ((language === "java" || language === "csharp") && /^(import|using)\b/.test(code)) text = language === "java" ? "Hay un import." : "Hay un using.";
		else if (language === "php" && /^(use|require|include)\b/.test(code)) text = "El archivo trae código o nombres de otro sitio.";
		else if (language === "ruby" && /^require\b/.test(code)) text = "Hay un require.";
		if (text) facts.push({
			lines: `${lineNo}`,
			text
		});
	});
	return facts;
}
function findLoops(lines, family) {
	if (family === "python" || family === "ruby") return findIndentLoops(lines);
	const found = [];
	const nested = [];
	const stack = [];
	lines.forEach((line, index) => {
		if (LOOP_RE.test(line.code)) {
			const outer = [...stack].reverse().find((item) => line.depthBefore > item.exitDepth);
			if (outer) nested.push({
				outer: outer.line,
				inner: index + 1
			});
			found.push(index + 1);
			stack.push({
				exitDepth: line.depthBefore,
				line: index + 1
			});
		}
		while (stack.length > 0 && line.depthAfter <= stack[stack.length - 1].exitDepth) stack.pop();
	});
	return {
		lines: found,
		nested
	};
}
function findIndentLoops(lines) {
	const found = [];
	const nested = [];
	const stack = [];
	lines.forEach((line, index) => {
		if (!line.code.trim()) return;
		const indent = indentOf(line.text);
		while (stack.length > 0 && indent <= stack[stack.length - 1].indent) stack.pop();
		if (LOOP_RE.test(line.code)) {
			if (stack.length > 0) nested.push({
				outer: stack[stack.length - 1].line,
				inner: index + 1
			});
			found.push(index + 1);
			stack.push({
				indent,
				line: index + 1
			});
		}
	});
	return {
		lines: found,
		nested
	};
}
function findRecursion(lines, definitions, family) {
	const found = [];
	for (const definition of definitions) {
		const start = definition.line - 1;
		const baseIndent = indentOf(lines[start]?.text ?? "");
		const baseDepth = lines[start]?.depthBefore ?? 0;
		let opened = (lines[start]?.depthAfter ?? 0) > baseDepth;
		for (let index = start + 1; index < lines.length; index++) {
			const line = lines[index];
			if (family === "python" || family === "ruby") {
				if (!line.code.trim()) continue;
				if (indentOf(line.text) <= baseIndent) break;
			} else {
				if (line.depthAfter > baseDepth || line.depthBefore > baseDepth) opened = true;
				if (opened && line.depthBefore <= baseDepth) break;
				if (!opened && index > start + 3) break;
			}
			if (new RegExp(`\\b${definition.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(`).test(line.code)) {
				found.push({
					name: definition.name,
					call: index + 1
				});
				break;
			}
		}
	}
	return found;
}
function analyzeHtml(lines) {
	const tags = /* @__PURE__ */ new Map();
	for (const line of lines) for (const match of line.text.matchAll(/<\/?([a-zA-Z][\w:-]*)\b/g)) {
		const name = match[1].toLowerCase();
		tags.set(name, (tags.get(name) ?? 0) + 1);
	}
	if (tags.size === 0) return [{
		lines: "1",
		text: "No veo etiquetas. Puede que el fragmento no sea HTML, o que esté incompleto."
	}];
	const interesting = [
		"script",
		"form",
		"input",
		"a",
		"img"
	].filter((name) => tags.has(name));
	const facts = [{
		lines: "1",
		text: `Veo etiquetas (${tags.size} distintas). HTML describe una estructura; no calcula nada por sí mismo.`
	}];
	if (interesting.includes("script")) facts.push({
		lines: "1",
		text: "Hay un script. El comportamiento está en otro lenguaje, metido dentro del documento."
	});
	if (interesting.includes("form") || interesting.includes("input")) facts.push({
		lines: "1",
		text: "Hay un formulario o un campo. Los datos que escriba una persona entran por ahí."
	});
	return facts;
}
function analyzeCss(lines) {
	const opens = lines.filter((line) => line.text.includes("{")).length;
	const medias = lines.filter((line) => /@media\b/.test(line.text)).length;
	const facts = [{
		lines: "1",
		text: opens === 0 ? "No veo reglas con llaves. Puede ser un fragmento suelto de CSS." : `Hay unas ${opens} reglas o bloques. CSS dice cómo se presenta algo; no en qué orden se ejecuta.`
	}];
	if (medias > 0) facts.push({
		lines: "1",
		text: "Hay una consulta de medios: parte del estilo depende del tamaño o del medio."
	});
	return facts;
}
function analyzeSql(lines) {
	const text = lines.map((line) => line.code).join("\n");
	const facts = [];
	if (/\bselect\b/i.test(text)) facts.push({
		lines: "1",
		text: "Hay un SELECT: la frase pide filas, no las modifica por sí sola."
	});
	if (/\b(insert|update|delete)\b/i.test(text)) facts.push({
		lines: "1",
		text: "Hay una frase que escribe o borra. El efecto depende de la base, que no está aquí."
	});
	if (/\bjoin\b/i.test(text)) facts.push({
		lines: "1",
		text: "Hay un JOIN: se combinan filas de más de una tabla según una condición."
	});
	if (/\bwhere\b/i.test(text)) facts.push({
		lines: "1",
		text: "Hay un WHERE: no viajan todas las filas, solo las que cumplen la condición."
	});
	if (facts.length === 0) facts.push({
		lines: "1",
		text: "No reconozco una frase SQL clara. Puede estar incompleta."
	});
	return facts;
}
function indentOf(text) {
	let count = 0;
	for (const char of text) if (char === " ") count += 1;
	else if (char === "	") count += 4;
	else break;
	return count;
}
function lineNo(lines, line) {
	return lines.indexOf(line) + 1;
}
function span(lineNumbers) {
	if (lineNumbers.length === 0) return "1";
	const sorted = [...lineNumbers].sort((a, b) => a - b);
	const first = sorted[0];
	const last = sorted[sorted.length - 1];
	return first === last ? `${first}` : `${first}-${last}`;
}
//#endregion
export { languageLabels as i, isLanguageId as n, languageIds as r, analyze as t };
