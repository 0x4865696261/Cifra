import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const cpp = {
  manifiesto: {
    id: "cpp",
    tipo: "lenguaje",
    aporta: ["analizador", "nota"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "cpp",
    label: "C++",
    familia: "brace",
    nota: {
      code: `#include <algorithm>
#include <cctype>
      #include <cstddef>
      #include <sstream>
#include <string>
#include <unordered_map>

std::unordered_map<std::string, std::size_t> frecuencias(const std::string& texto) {
    std::istringstream entrada(texto);
    std::unordered_map<std::string, std::size_t> conteo;
    std::string palabra;
    while (entrada >> palabra) {
        std::transform(palabra.begin(), palabra.end(), palabra.begin(),
            [](unsigned char letra) { return static_cast<char>(std::tolower(letra)); });
        ++conteo[palabra];
    }
    return conteo;
}
`,
      changed: [
        "unordered_map inserta una clave nueva al usar operator[] y deja su valor numérico inicial en cero. ++ hace el primer conteo y los siguientes en el mismo sitio.",
        "La referencia const std::string& evita copiar la entrada, pero obliga a que el texto siga vivo durante la llamada. La propiedad y la duración no desaparecen porque el mapa gestione sus propios nodos.",
        "La división de espacios y el cambio de mayúsculas están escritos aparte; una traducción que use otra regla de corte producirá claves distintas.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
