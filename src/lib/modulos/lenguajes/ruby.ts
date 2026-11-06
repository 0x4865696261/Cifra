import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const ruby = {
  manifiesto: {
    id: "ruby",
    tipo: "lenguaje",
    aporta: ["analizador"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "ruby",
    label: "Ruby",
    familia: "ruby",
  },
} as const satisfies Modulo<Lenguaje>;
