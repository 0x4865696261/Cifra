import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const ruby = {
  manifiesto: {
    id: "ruby",
    tipo: "lenguaje",
    aporta: ["analizador", "nota"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "ruby",
    label: "Ruby",
    familia: "ruby",
    nota: {
      code: `def frecuencias(texto)
  conteo = Hash.new(0)
  texto.downcase.split.each do |palabra|
    conteo[palabra] += 1
  end
  conteo
end
`,
      changed: [
        "Hash.new(0) da cero a una clave que aún no existe y además la guarda al modificarla. Un Hash sin ese valor por defecto se comporta distinto.",
        "split sin argumentos separa por espacios en blanco y descarta extremos vacíos. Cambiarlo por split(' ') altera el tratamiento de espacios repetidos.",
        "downcase devuelve otro texto y las reglas de mayúsculas pueden depender de codificación y locale. El ejemplo define el caso habitual, no toda segmentación Unicode.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
