import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const java = {
  manifiesto: {
    id: "java",
    tipo: "lenguaje",
    aporta: ["analizador", "nota"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "java",
    label: "Java",
    familia: "brace",
    nota: {
      code: `import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

Map<String, Integer> frecuencias(String texto) {
    Map<String, Integer> conteo = new HashMap<>();
    for (String palabra : texto.toLowerCase(Locale.ROOT).split("\\\\s+")) {
        if (!palabra.isEmpty()) {
            conteo.merge(palabra, 1, Integer::sum);
        }
    }
    return conteo;
}
`,
      changed: [
        "El tipo genérico fija claves String y valores Integer. El mapa y la operación merge expresan la inserción y el incremento; no existe un cero implícito para una clave ausente.",
        "split con una expresión regular y el caso vacío no son lo mismo que strings.Fields o split de Python. La normalización de mayúsculas usa Locale.ROOT para no depender de la región del equipo.",
        "Integer puede desbordarse en conteos muy grandes; elegir long cambia el contrato del resultado, no solo el nombre del tipo.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
