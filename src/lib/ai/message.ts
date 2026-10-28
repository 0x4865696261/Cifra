/**
 * Lectura del texto del mensaje de error, sin ejecutar nada ni llamar al modelo.
 * Igual que el análisis del código: hechos visibles en el texto, marcados como lo que son.
 */

export type MessageFact = { lines: string; text: string };

export type MessageReading = {
  summary: string;
  facts: MessageFact[];
  namedLines: number[];
  namedIdentifiers: string[];
};

const LINE_PATTERNS = [
  /(?:l[ií]nea|l[ií]neas?|line)\s+(\d{1,5})/gi,
  /, line (\d{1,5})/gi,
  /:(\d{1,5}):(\d{1,5})/g,
];

const IDENTIFIER_PATTERN = /["'`]([^"'`\n]{1,40})["'`]/g;

const TRACE_HINTS = [
  { test: /\btraceback\b/i, name: "una traza de Python: el fallo llega en ejecución, no al leer el texto" },
  { test: /\bsyntaxerror\b|sintaxis/i, name: "un error de sintaxis: el programa no llegó a ejecutarse" },
  { test: /\breferenceerror\b|\bnameerror\b|is not defined|no está definido/i, name: "un nombre que el programa no encuentra: revisa cómo se escribe y dónde vive" },
  { test: /\btypeerror\b|de tipo|incompatible/i, name: "una operación aplicada a valores de tipo distinto al que espera" },
  { test: /\bindexerror\b|out of range|out of bounds|fuera de rango|fuera de los límites/i, name: "un acceso fuera de los límites de una colección" },
  { test: /\bundefined\b/i, name: "un valor undefined en el momento del fallo" },
  { test: /\bnull\b|\bnonetype\b|none/i, name: "un valor nulo en el momento del fallo" },

];

export function readMessage(raw: string): MessageReading {
  const text = raw.trim();
  const lines = text.split(/\r?\n/);

  const namedLines = collectLines(text);
  const namedIdentifiers = collectIdentifiers(text);
  const hints = TRACE_HINTS.filter((hint) => hint.test.test(text)).slice(0, 3);
  const firstLine = lines.find((line) => line.trim()) ?? "";

  const facts: MessageFact[] = [];
  facts.push({
    lines: "mensaje",
    text: `Primera línea del mensaje: «${firstLine.slice(0, 140)}».`,
  });

  if (namedLines.length > 0) {
    const list = namedLines.map((line) => `L${line}`).join(", ");
    facts.push({
      lines: "mensaje",
      text: `El mensaje da números de línea: ${list}. Cádalos con el fragmento pegado: pueden apuntar al código o al archivo original.`,
    });
  } else {
    facts.push({
      lines: "mensaje",
      text: "El mensaje no da ningún número de línea que se haya podido leer.",
    });
  }

  if (namedIdentifiers.length > 0) {
    facts.push({
      lines: "mensaje",
      text: `El mensaje pone entre comillas: ${namedIdentifiers.map((name) => `«${name}»`).join(", ")}. Suelen ser nombres, archivos o cadenas implicadas.`,
    });
  }

  for (const hint of hints) {
    facts.push({ lines: "mensaje", text: `Parece ${hint.name}.` });
  }
  if (hints.length === 0) {
    facts.push({
      lines: "mensaje",
      text: "No se ha reconocido un tipo de error conocido. Lee la primera frase del mensaje: suele nombrar la regla que se detuvo.",
    });
  }

  const summary = lines.length > 1
    ? `El mensaje tiene ${lines.length} líneas. Las últimas suelen contener la causa; las primeras, el camino por el que se llegó.`
    : "El mensaje es de una sola línea, sin pila de llamadas visible.";

  return { summary, facts, namedLines, namedIdentifiers };
}

function collectLines(text: string): number[] {
  const found = new Set<number>();
  for (const pattern of LINE_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      for (const group of match.slice(1)) {
        if (!group) continue;
        const value = Number(group);
        if (Number.isInteger(value) && value >= 1 && value <= 5000) found.add(value);
      }
    }
  }
  return [...found].sort((a, b) => a - b).slice(0, 12);
}

function collectIdentifiers(text: string): string[] {
  const found = new Set<string>();
  IDENTIFIER_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = IDENTIFIER_PATTERN.exec(text))) {
    const value = match[1];
    if (value && value.trim().length >= 1 && !/^\d+$/.test(value)) {
      found.add(value.trim());
      if (found.size >= 6) break;
    }
  }
  return [...found];
}
