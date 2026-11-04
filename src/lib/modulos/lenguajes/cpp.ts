import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const cpp = {
  manifiesto: {
    id: "cpp",
    tipo: "lenguaje",
    aporta: ["analizador"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "cpp",
    label: "C++",
    familia: "brace",
  },
} as const satisfies Modulo<Lenguaje>;
