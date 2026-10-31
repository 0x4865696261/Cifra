import type { DatosReto, DefinicionReto } from "../tipos";

/**
 * El arnés común de las familias de retos (0.4.B).
 *
 * Cada reto se escribe una vez y produce, con los datos generados de esta persona: el texto
 * del enunciado, el código de partida con los casos plantados, las pruebas con sus valores
 * esperados —calculados con la solución de referencia de la propia plataforma, no a mano— y
 * dos cuerpos completos que prueban la calidad: la «casi correcta más típica» debe FALLAR
 * alguna prueba (un límite mal puesto, un caso vacío, un orden confundido).
 */

export type RetoCompleto = DefinicionReto & {
  /** La solución de la plataforma: misma plantilla, cuerpo resuelto. Solo la usan las pruebas. */
  solucionReferencia(datos: DatosReto): string;
  /** La solución «casi correcta» del límite típico: cae en al menos una prueba. */
  solucionCasi(datos: DatosReto): string;
};

export type Plantilla = {
  nombre: string;
  firma: string;
  pista: string;
  /** El cuerpo ya escrito, o cadena vacía para que la persona lo llene. */
  cuerpo: string;
  /** Las líneas de datos y de llamadas que la plantilla pone bajo la función. */
  casos: string;
  /** La expresión de cierre: su valor de finalización es el que juzga la prueba `retorno`. */
  final: string;
};

export const notasFamilias: Record<string, string> = {
  bucles: "Repetir calculando: límites del bucle, acumuladores y estados que sobrepasan una vez.",
  condicionales: "Decidir: los bordes de cada franja, la prioridad de las reglas y el caso que nadie mira.",
  funciones: "Escribir piezas llamables: firma, base y llamada de la recursión, valores de vuelta.",
  colecciones: "Guardar y recorrer: listas, los índices que importan y lo que se compara con qué.",
  cadenas: "Tratar el texto: qué es letra, qué es palabra, qué pasa con mayúsculas y con signos.",
};

/** El cuerpo vacío: el esqueleto que la persona rellena. */
export const cuerpoVacio = "  // Escribe tu solución aquí.\n";

export function plantillaReto({ nombre, firma, pista, cuerpo, casos, final }: Plantilla): string {
  const cuerpoEscrito =
    cuerpo.trim().length > 0 ? cuerpo : "  // Escribe tu solución aquí.\n";
  return (
    `function ${nombre}(${firma}) {\n` +
    `  // ${pista}\n` +
    cuerpoEscrito +
    `}\n\n` +
    `// Los casos de abajo son tuyos: otra persona recibe otros valores.\n` +
    `// Lo que imprimes y lo que devuelves se compara con la ejecución real en tu navegador.\n` +
    casos +
    final
  );
}

/** "[3, 7, 2]" — el literal de una lista de números dentro del código de partida. */
export function literalLista(numeros: readonly number[]): string {
  return `[${numeros.join(", ")}]`;
}

/** `"hola"` — el literal de un texto, ya con sus comillas y su contenido con escapes. */
export function literalTexto(texto: string): string {
  return JSON.stringify(texto);
}

/** La salida esperada de un caso: la misma forma que la plantilla imprime, sin inventar.
 * Los arrays salen como los imprime el worker (`aTexto` usa `JSON.stringify`), no como
 * `String()`, que azotaría sin corchetes y sería un espejismo distinto. */
export function lineaDe(caso: { etiqueta: string; valor: unknown }): string {
  const valor = caso.valor;
  const texto =
    valor !== null && typeof valor === "object" ? JSON.stringify(valor) : String(valor);
  return `${caso.etiqueta}: ${texto}\n`;
}
