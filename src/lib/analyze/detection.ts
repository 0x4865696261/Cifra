import type { LanguageId } from "./structure.ts";

/**
 * Detección del lenguaje por señales del código y del mensaje, sin modelo.
 * Conservadora: si las señales no bastan o empatan, se declara que no se puede
 * asegurar; nunca se marca como segura una sugerencia débil.
 */

export type Deteccion = { sugerencia: LanguageId | null; segura: boolean };

type Senal = { re: RegExp; lenguaje: LanguageId };

const senalesCodigo: Senal[] = [
  { re: /(^|\n)\s*def\s+\w+\s*\(/, lenguaje: "python" },
  { re: /(^|\n)\s*import\s+\w+|(^|\n)\s*from\s+\w+\s+import\s/, lenguaje: "python" },
  { re: /(^|\n)\s*print\s*\(/, lenguaje: "python" },
  { re: /self\./, lenguaje: "python" },
  { re: /#!\s*\/usr\/bin\/env\s+python/, lenguaje: "python" },
  { re: /(^|\n)\s*fn\s+\w+/, lenguaje: "rust" },
  { re: /(^|\n)\s*let\s+mut\s+/, lenguaje: "rust" },
  { re: /\bfn\s+main\s*\(\s*\)/, lenguaje: "rust" },
  { re: /(^|\n)\s*impl\s+\w+/, lenguaje: "rust" },
  { re: /\bmatch\s+\w+\s*\{/, lenguaje: "rust" },
  { re: /(^|\n)\s*const\s+\w+/, lenguaje: "javascript" },
  { re: /(^|\n)\s*function\s+\w+/, lenguaje: "javascript" },
  { re: /console\.log\s*\(/, lenguaje: "javascript" },
  { re: /=>\s*(\S|\{)/, lenguaje: "javascript" },
  { re: /require\s*\(/, lenguaje: "javascript" },
  { re: /:\s*(string|number|boolean)\b/, lenguaje: "typescript" },
  { re: /(^|\n)\s*interface\s+\w+\s*\{/, lenguaje: "typescript" },
];

const senalesMensaje: Senal[] = [
  { re: /\btraceback\b/i, lenguaje: "python" },
  { re: /\b(nameerror|keyerror|indexerror|attributeerror|zerodivisionerror|modulenotfounderror|indentationerror|importerror)\b/i, lenguaje: "python" },
  { re: /\bfile\s+"[^"]+\.py"/i, lenguaje: "python" },
  { re: /\breferenceerror\b|\btypeerror\b/i, lenguaje: "javascript" },
  { re: /\bis not defined\b|\bis not a function\b|\bunexpected token\b/i, lenguaje: "javascript" },
  { re: /\bat\s+[\w./:$-]+:\d+:\d+\)/, lenguaje: "javascript" },
  { re: /\bfile\s+"[^"]+\.(js|ts|tsx)"/i, lenguaje: "javascript" },
  { re: /\berror\[E\d{4}\]/, lenguaje: "rust" },
  { re: /\bpanicked at\b/, lenguaje: "rust" },
];

export function detectLanguage(codigo: string, mensaje: string): Deteccion {
  const puntos = new Map<LanguageId, number>();

  const sumar = (senales: Senal[], texto: string, peso: number) => {
    for (const senal of senales) {
      if (senal.re.test(texto)) {
        puntos.set(senal.lenguaje, (puntos.get(senal.lenguaje) ?? 0) + peso);
      }
    }
  };

  sumar(senalesCodigo, codigo, 1);
  sumar(senalesMensaje, mensaje, 2);

  if (puntos.size === 0) return { sugerencia: null, segura: false };

  const clasificados = [...puntos.entries()].sort((a, b) => b[1] - a[1]);
  const [mejor, segundo] = clasificados;
  if (segundo && segundo[1] === mejor[1]) return { sugerencia: null, segura: false };
  const margen = segundo ? mejor[1] - segundo[1] : mejor[1];
  return { sugerencia: mejor[0], segura: mejor[1] >= 3 && margen >= 2 };
}
