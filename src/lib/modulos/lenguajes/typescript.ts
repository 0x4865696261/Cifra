import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const typescript = {
  manifiesto: {
    id: "typescript",
    tipo: "lenguaje",
    aporta: ["analizador", "señales"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "typescript",
    label: "TypeScript",
    familia: "brace",
    senales: {
      codigo: [/:\s*(string|number|boolean)\b/, /(^|\n)\s*interface\s+\w+\s*\{/],
      mensaje: [],
    },
  },
} as const satisfies Modulo<Lenguaje>;
