import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const java = {
  manifiesto: {
    id: "java",
    tipo: "lenguaje",
    aporta: ["analizador"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "java",
    label: "Java",
    familia: "brace",
  },
} as const satisfies Modulo<Lenguaje>;
