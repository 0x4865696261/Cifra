import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const php = {
  manifiesto: {
    id: "php",
    tipo: "lenguaje",
    aporta: ["analizador", "nota"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "php",
    label: "PHP",
    familia: "brace",
    nota: {
      code: `function frecuencias(string $texto): array {
    $conteo = [];
    $palabras = preg_split('/\\s+/', strtolower(trim($texto)), -1, PREG_SPLIT_NO_EMPTY);
    foreach ($palabras as $palabra) {
        $conteo[$palabra] = ($conteo[$palabra] ?? 0) + 1;
    }
    return $conteo;
}
`,
      changed: [
        "El array asociativo usa texto como clave y convierte ciertas claves numéricas según las reglas de PHP. No es el mismo contrato que Map en JavaScript.",
        "El operador ?? solo sustituye null o una clave ausente; usar ?: también reemplazaría un cero real. En un conteo el resultado puede parecer correcto y aun así expresar otra regla.",
        "trim y preg_split definen los separadores y los extremos vacíos. Cambiar la expresión regular sin acordar el texto de entrada cambia qué se cuenta.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
