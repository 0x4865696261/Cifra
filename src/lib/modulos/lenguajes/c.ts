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
      code: `#include <ctype.h>
#include <stddef.h>
#include <string.h>

#define MAX_PALABRA 128

struct Par {
    char palabra[MAX_PALABRA];
    int veces;
};

int frecuencias(const char *texto, struct Par *pares, int capacidad) {
    if (!texto || capacidad < 0 || (capacidad > 0 && !pares)) return -1;
    int usados = 0;
    while (*texto) {
        while (*texto && isspace((unsigned char)*texto)) texto++;
        if (!*texto) break;

        char palabra[MAX_PALABRA];
        int largo = 0;
        while (*texto && !isspace((unsigned char)*texto)) {
            if (largo + 1 >= MAX_PALABRA) return -1;
            palabra[largo++] = (char)tolower((unsigned char)*texto++);
        }
        palabra[largo] = '\\0';

        int i = 0;
        while (i < usados && strcmp(pares[i].palabra, palabra) != 0) i++;
        if (i < usados) {
            pares[i].veces++;
        } else {
            if (usados == capacidad) return -1;
            strcpy(pares[usados].palabra, palabra);
            pares[usados++].veces = 1;
        }
    }
    return usados;
}
`,
      changed: [
        "C no amplía la tabla: quien llama reserva pares y pasa su capacidad. -1 indica que no cabía una palabra o una clave más; el llamador debe decidir cómo manejar ese límite.",
        "texto y pares son direcciones, no valores con tamaño incorporado. La función debe respetar el terminador nulo y la capacidad recibida. Aquí limita también cada palabra a 127 bytes.",
        "La tabla conserva copias de las claves en su propio almacenamiento. Devolver una dirección a la variable local palabra sería inválido: deja de vivir al terminar cada vuelta. tolower convierte bytes según el locale actual, no aplica minúsculas Unicode completas.",
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
