import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const csharp = {
  manifiesto: {
    id: "csharp",
    tipo: "lenguaje",
    aporta: ["analizador"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "csharp",
    label: "C#",
    familia: "brace",
  },
} as const satisfies Modulo<Lenguaje>;
