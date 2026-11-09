import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const csharp = {
  manifiesto: {
    id: "csharp",
    tipo: "lenguaje",
    aporta: ["analizador", "nota"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "csharp",
    label: "C#",
    familia: "brace",
    nota: {
      code: `using System;
using System.Collections.Generic;

Dictionary<string, int> frecuencias(string texto) {
    var conteo = new Dictionary<string, int>(StringComparer.Ordinal);
    foreach (var palabra in texto.Split(' ', StringSplitOptions.RemoveEmptyEntries)) {
        var clave = palabra.ToLowerInvariant();
        conteo.TryGetValue(clave, out var actual);
        conteo[clave] = actual + 1;
    }
    return conteo;
}
`,
      changed: [
        "Dictionary lanza una excepción al leer una clave ausente con el indexador; TryGetValue permite iniciar el conteo sin ocultar esa regla.",
        "Split separa aquí por el espacio ASCII indicado, no por cualquier separador Unicode. Si el problema define otros espacios, el conjunto de separadores debe decirlo.",
        "ToLowerInvariant hace explícita una normalización estable. La comparación de claves y el uso de mayúsculas son parte del resultado que se debe acordar.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
