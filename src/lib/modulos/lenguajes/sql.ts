import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const sql = {
  manifiesto: {
    id: "sql",
    tipo: "lenguaje",
    aporta: ["analizador", "nota"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "sql",
    label: "SQL",
    familia: "sql",
    nota: {
      code: `-- PostgreSQL: frecuencias($1)
SELECT lower(palabra) AS palabra, count(*) AS veces
FROM regexp_split_to_table($1, '\\s+') AS partes(palabra)
WHERE palabra <> ''
GROUP BY lower(palabra);
`,
      changed: [
        "SQL expresa una consulta de conjunto, no un bucle que actualiza un mapa. La agrupación y el count calculan todas las frecuencias en una operación relacional.",
        "regexp_split_to_table es de PostgreSQL, no una función universal de SQL. El dialecto y el parámetro $1 forman parte de la solución.",
        "La consulta devuelve filas; orden y formato del resultado requieren una cláusula explícita. No equivale a recibir un mapa ordenado en memoria.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
