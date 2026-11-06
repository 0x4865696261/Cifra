import { ejecutarPython } from "../../ejecucion/motor-python.ts";
import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const python = {
  manifiesto: {
    id: "python",
    tipo: "lenguaje",
    aporta: ["analizador", "señales", "reglas", "nota", "motor"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: ["contrato:4.2"],
  },
  contenido: {
    id: "python",
    label: "Python",
    familia: "python",
    senales: {
      codigo: [
        /(^|\n)\s*def\s+\w+\s*\(/,
        /(^|\n)\s*import\s+\w+|(^|\n)\s*from\s+\w+\s+import\s/,
        /(^|\n)\s*print\s*\(/,
        /self\./,
        /#!\s*\/usr\/bin\/env\s+python/,
      ],
      mensaje: [
        /\btraceback\b/i,
        /\b(nameerror|keyerror|indexerror|attributeerror|zerodivisionerror|modulenotfounderror|indentationerror|importerror)\b/i,
        /\bfile\s+"[^"]+\.py"/i,
      ],
    },
    reglasError: [
      { tipo: "valor-nulo", encaja: /attributeerror:\s*'?nonetype'?/i },
      { tipo: "nombre-inexistente", encaja: /\bnameerror\b/i },
      { tipo: "limite-coleccion", encaja: /\bindexerror\b|\bkeyerror\b/i },
      { tipo: "tipo", encaja: /\btypeerror\b/i },
      { tipo: "aritmetica", encaja: /\bzerodivisionerror\b/i },
      { tipo: "sintaxis", encaja: /\bindentationerror\b|\bsyntaxerror\b/i },
      { tipo: "importacion", encaja: /\bmodulenotfounderror\b|\bimporterror\b/i },
    ],
    nota: {
      code: `def frecuencias(texto: str) -> dict[str, int]:
    conteo: dict[str, int] = {}
    for palabra in texto.lower().split():
        conteo[palabra] = conteo.get(palabra, 0) + 1
    return conteo
`,
      changed: [
        "El diccionario crece solo. get(palabra, 0) dice: si no está, cuenta como cero, y entonces sumo uno. No hay un paso aparte de «reservar memoria».",
        "split corta por espacios y tira los vacíos de los extremos, pero deja puntuación pegada a la palabra. «fin.» y «fin» son claves distintas. Eso es una decisión del corte, no del diccionario.",
        "lower devuelve un texto nuevo. El original no cambia. Quien llama sigue viendo sus mayúsculas.",
      ],
    },
    motor: {
      notas: "Pyodide se baja del CDN la primera vez; tarda al cargar",
      ejecutar: ejecutarPython,
    },
  },
} as const satisfies Modulo<Lenguaje>;
