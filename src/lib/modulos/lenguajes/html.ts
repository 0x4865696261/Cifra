import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const html = {
  manifiesto: {
    id: "html",
    tipo: "lenguaje",
    aporta: ["analizador"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "html",
    label: "HTML",
    familia: "html",
  },
} as const satisfies Modulo<Lenguaje>;
