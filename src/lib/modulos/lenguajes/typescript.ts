import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const typescript = {
  manifiesto: {
    id: "typescript",
    tipo: "lenguaje",
    aporta: ["analizador", "señales", "nota", "ensayo"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "typescript",
    label: "TypeScript",
    familia: "brace",
    senales: {
      codigo: [/:\s*(string|number|boolean)\b/, /(^|\n)\s*interface\s+\w+\s*\{/],
      mensaje: [],
    },
    nota: {
      code: `function frecuencias(texto: string): Map<string, number> {
  const conteo = new Map<string, number>();
  for (const palabra of texto.toLowerCase().split(/\\s+/).filter(Boolean)) {
    conteo.set(palabra, (conteo.get(palabra) ?? 0) + 1);
  }
  return conteo;
}
`,
      changed: [
        "Map<string, number> describe qué claves y valores admite el mapa durante la comprobación estática. El algoritmo se parece al de JavaScript, pero los tipos detectan algunos errores antes de ejecutar.",
        "Las anotaciones se borran al compilar: no validan por sí solas el texto que llega de una petición. La frontera externa sigue necesitando una comprobación en tiempo de ejecución.",
        "El tipo de retorno también forma parte del contrato. Cambiar Map por un objeto o devolver una lista no es una traducción neutra, aunque las claves parezcan iguales.",
      ],
    },
    ensayo: {
      id: "tipos",
      title: "De JavaScript a TypeScript",
      see: "compilador",
      body: [
        "JavaScript decide muchas incompatibilidades al ejecutar. TypeScript puede detectar otras antes, mientras comprueba el programa. Las anotaciones no son instrucciones para la máquina: se eliminan al generar JavaScript.",
        "Un tipo escrito no valida automáticamente un JSON, un formulario ni una respuesta de red. Para esos datos hace falta comprobar la forma real antes de tratarlos como el tipo esperado.",
        "Una traducción literal puede conservar el cálculo y perder la garantía si se salta la comprobación de tipos. Un cast cambia lo que el compilador cree; no convierte ni valida el valor.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
