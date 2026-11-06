import { ejecutarJavaScript } from "../../ejecucion/motor-javascript.ts";
import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const javascript = {
  manifiesto: {
    id: "javascript",
    tipo: "lenguaje",
    aporta: ["analizador", "señales", "reglas", "nota", "motor"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: ["contrato:4.2"],
  },
  contenido: {
    id: "javascript",
    label: "JavaScript",
    familia: "brace",
    senales: {
      codigo: [
        /(^|\n)\s*const\s+\w+/,
        /(^|\n)\s*function\s+\w+/,
        /console\.log\s*\(/,
        /=>\s*(\S|\{)/,
        /require\s*\(/,
      ],
      mensaje: [
        /\breferenceerror\b|\btypeerror\b/i,
        /\bis not defined\b|\bis not a function\b|\bunexpected token\b/i,
        /\bat\s+[\w./:$-]+:\d+:\d+\)/,
        /\bfile\s+"[^"]+\.(js|ts|tsx)"/i,
      ],
    },
    reglasError: [
      { tipo: "valor-nulo", encaja: /cannot read propert(y|ies) of (undefined|null)/i },
      { tipo: "nombre-inexistente", encaja: /\bis not defined\b/i },
      { tipo: "metodo-inexistente", encaja: /\bis not a function\b/i },
      { tipo: "sintaxis", encaja: /\bunexpected token\b|\bsyntaxerror\b/i },
    ],
    nota: {
      code: `function frecuencias(texto) {
  const conteo = new Map();
  for (const palabra of texto.toLowerCase().split(/\\s+/)) {
    if (!palabra) continue;
    conteo.set(palabra, (conteo.get(palabra) ?? 0) + 1);
  }
  return conteo;
}
`,
      changed: [
        "Un objeto corriente también serviría de diccionario, y es lo que mucha gente escribe primero. Map deja las claves como claves, sin convertirlas a texto por detrás, y se recorre en el orden en que entraron.",
        "split con una expresión regular puede dejar un texto vacío al principio o al final. Por eso está el continue. En Python, split sin argumentos ya no los deja. Traducir la llamada tal cual cambia el resultado.",
        "?? 0 solo sustituye null o undefined. No sustituye un cero. Aquí da igual, porque un cero guardado sería un conteo real. Conviene no cambiarlo por || 0 sin mirar: || también sustituye el cero.",
      ],
    },
    motor: {
      notas: "corre en un Worker de tu navegador",
      ejecutar: ejecutarJavaScript,
    },
  },
} as const satisfies Modulo<Lenguaje>;
