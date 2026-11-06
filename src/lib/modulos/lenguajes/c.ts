import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const c = {
  manifiesto: {
    id: "c",
    tipo: "lenguaje",
    aporta: ["analizador", "nota", "ensayo"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "c",
    label: "C",
    familia: "brace",
    nota: {
      code: `int sumar_si_esta(struct Par *pares, int n, const char *palabra) {
    for (int i = 0; i < n; i++) {
        if (strcmp(pares[i].palabra, palabra) == 0) {
            pares[i].veces++;
            return pares[i].veces;
        }
    }
    return -1;
}
`,
      changed: [
        "En C la tabla no crece sola. Esta función solo incrementa una palabra que ya tiene sitio. Si devuelve −1, el llamador decide si hay hueco, si hay que pedir más memoria o si se ignora la palabra. Esas decisiones son el programa.",
        "struct Par *pares es una dirección. n dice cuántos pares hay detrás. El lenguaje no lo recuerda por ti. Si n miente, strcmp lee de más. El mismo algoritmo del diccionario, aquí, arrastra el tamaño al lado de los datos.",
        "No hay una línea que sea «la traducción» del diccionario de Python. Pretender que la hay esconde justo lo que C pone encima de la mesa: quién reserva, quién libera y cómo se comparan los textos.",
      ],
    },
    ensayo: {
      id: "memoria",
      title: "C, C++ y cuánto vive un objeto",
      see: "puntero",
      body: [
        "C te da direcciones y el tamaño. Puedes hacer de todo, incluido leer donde no hay un valor tuyo. La duración la llevas tú: una variable local muere al salir de la función, aunque hayas guardado su dirección.",
        "C++ añade objetos que se inicializan y se destruyen en momentos definidos, y referencias que son otro nombre y no una dirección reasignable. También puedes seguir usando punteros. El lenguaje no te obliga a un solo modelo, y por eso un archivo mezcla los tres. Hay que mirar el tipo de cada nombre, no la vibra general del archivo.",
        "Rust no está en esta página como «el C correcto». Está al lado porque responde a los mismos accidentes con otra regla. Leer los tres juntos sirve para ver el problema —quién vive, quién libera— y no para coronar una sintaxis.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
