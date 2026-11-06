import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const sql = {
  manifiesto: {
    id: "sql",
    tipo: "lenguaje",
    aporta: ["analizador"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "sql",
    label: "SQL",
    familia: "sql",
  },
} as const satisfies Modulo<Lenguaje>;
