import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const php = {
  manifiesto: {
    id: "php",
    tipo: "lenguaje",
    aporta: ["analizador"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "php",
    label: "PHP",
    familia: "brace",
  },
} as const satisfies Modulo<Lenguaje>;
