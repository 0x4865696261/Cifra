import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const css = {
  manifiesto: {
    id: "css",
    tipo: "lenguaje",
    aporta: ["analizador"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "css",
    label: "CSS",
    familia: "css",
  },
} as const satisfies Modulo<Lenguaje>;
