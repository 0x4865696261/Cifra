import { contratosDeModulo, type Modulo } from "../tipos.ts";
import type { Lenguaje } from "./tipos.ts";

export const go = {
  manifiesto: {
    id: "go",
    tipo: "lenguaje",
    aporta: ["analizador", "nota", "ensayo"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
  },
  contenido: {
    id: "go",
    label: "Go",
    familia: "brace",
    nota: {
      code: `func frecuencias(texto string) map[string]int {
    conteo := make(map[string]int)
    for _, palabra := range strings.Fields(strings.ToLower(texto)) {
        conteo[palabra]++
    }
    return conteo
}
`,
      changed: [
        "Leer una clave que no está devuelve el cero del tipo, no un error. Por eso conteo[palabra]++ funciona la primera vez: lee 0 y guarda 1. Esa es la diferencia con un lenguaje que protestaría.",
        "El mapa es una referencia. Quien recibe el resultado y mete otra clave está modificando el mismo mapa. No hace falta devolverlo «por si acaso» una segunda vez, pero sí saber que no es una copia.",
        'strings.Fields corta por cualquier espacio Unicode y no deja trozos vacíos. No es split(" "). El bucle no tiene if. El trabajo de limpiar está en la función de la biblioteca, y hay que saber cuál se eligió.',
      ],
    },
    ensayo: {
      id: "concurrencia",
      title: "De JavaScript a Go",
      see: "concurrencia",
      body: [
        "JavaScript te acostumbra a un solo hilo que no se queda bloqueado: pide algo que tardará y sigue. El orden de los cuerpos síncronos es estable. Lo que no es estable es en qué momento vuelve una espera.",
        "Go reparte el trabajo en goroutines y puede ejecutarlas a la vez. Un mapa compartido, escrito desde dos, no está cubierto por la regla de «leer una clave ausente da cero». Esa regla vale dentro de una goroutine. Entre dos, el lenguaje pide un canal o un cerrojo, o aceptas un fallo que no se reproduce siempre.",
        "Pasar un programa de uno a otro no es cambiar function por func. Es preguntar si hay estado compartido y quién tiene permiso para tocarlo. Si no lo hay, la traducción es aburrida, y eso es una buena señal.",
      ],
    },
  },
} as const satisfies Modulo<Lenguaje>;
