import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const rust = {
  manifiesto: {
    id: "rust",
    tipo: "lenguaje",
    aporta: ["analizador", "señales", "reglas", "nota", "ensayo"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: ["contrato:4.2"],
  },
  contenido: {
    id: "rust",
    label: "Rust",
    familia: "brace",
    senales: {
      codigo: [
        /(^|\n)\s*fn\s+\w+/,
        /(^|\n)\s*let\s+mut\s+/,
        /\bfn\s+main\s*\(\s*\)/,
        /(^|\n)\s*impl\s+\w+/,
        /\bmatch\s+\w+\s*\{/,
      ],
      mensaje: [/\berror\[E\d{4}\]/, /\bpanicked at\b/],
    },
    reglasError: [
      { tipo: "nombre-inexistente", encaja: /\bE0425\b/ },
      { tipo: "tipo", encaja: /\bE0308\b/ },
      { tipo: "prestamo-propiedad", encaja: /\bE0382\b|\bE0499\b|\bE0502\b/ },
      { tipo: "metodo-inexistente", encaja: /\bE0599\b/ },
      { tipo: "limite-coleccion", encaja: /index out of bounds/i },
      { tipo: "valor-nulo", encaja: /called `?Option::unwrap\(\)` on a `?None`? value/i },
    ],
    nota: {
      code: `use std::collections::HashMap;

fn frecuencias(texto: &str) -> HashMap<String, usize> {
    let mut conteo = HashMap::new();
    for palabra in texto.split_whitespace() {
        let clave = palabra.to_lowercase();
        *conteo.entry(clave).or_insert(0) += 1;
    }
    conteo
}
`,
      changed: [
        "texto: &str es un préstamo. La función puede mirar el texto y no se queda con él. El mapa que devuelve es suyo: el llamador pasa a ser el dueño.",
        "to_lowercase() construye un String nuevo. No se puede usar la porción prestada como clave si la clave tiene que seguir viva dentro del mapa después de que el préstamo termine, y además las minúsculas pueden ocupar distinto sitio.",
        "entry evita buscar la clave dos veces y deja el cero solo si faltaba. mut está escrito porque el mapa cambia. Nada de esto aparece en la versión de Python, y no sobra: es el programa diciendo cuánto dura cada valor.",
      ],
    },
    ensayo: {
      id: "propiedad",
      title: "De Python a Rust",
      see: "propiedad-rust",
      body: [
        "En Python guardas un texto en una lista y no escribes quién lo liberará. El lenguaje lleva la cuenta de quién lo nombra y, cuando ya nadie puede usarlo, lo retira. Casi nunca lo ves. Casi nunca lo decides.",
        "Rust quiere esa decisión en el código para poder rechazar, al compilar, dos fallos concretos: liberar dos veces y usar algo ya liberado. Por eso aparece el dueño, y por eso un préstamo tiene fecha de caducidad. No es una forma más rebuscada de escribir el mismo diccionario. Es otro contrato.",
        "La primera vez, el compilador parece discutir por detalles. Casi siempre está señalando dos usos que no pueden ser verdad juntos. Leer el error como una frase sobre duraciones, y no como un capricho de sintaxis, es el paso que acorta el resto.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
