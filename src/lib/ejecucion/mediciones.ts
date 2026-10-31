import type { RunResult } from "./tipos.ts";

/**
 * Comparación de mediciones (0.3.F, tarea 7).
 *
 * Metodología fija, única y declarada: 2 corridas de calentamiento que se descartan, 10 corridas
 * válidas, mediana y mediana de las desviaciones absolutas (MAD). Solo se declara que una versión
 * es más rápida si la diferencia de medianas supera el doble del mayor MAD de las dos; si no, la
 * diferencia cae dentro de la dispersión y no hay ganadora.
 *
 * Lo que aquí se mide es `duracionMs` de corridas reales — nada simulado. El resultado dice
 * siempre «medido en este equipo con estos límites»: no es un valor universal.
 */

export const calentamientos = 2;
export const repeticiones = 10;

export type Medida = { mediana: number; mad: number; corridas: number[] };

export type Veredicto =
  | "mas-rapida-la-original"
  | "mas-rapida-la-optimizada"
  | "dentro-de-la-dispersion";

export type Comparacion = {
  original: Medida;
  optimizada: Medida;
  veredicto: Veredicto;
  /** Cómo se midió, por si alguien quiere saber cuánto valen estas cifras. */
  notas: string;
};

/** Ejecuta la secuencia fija: calentamientos descartados + repeticiones válidas. */
export async function medir(correr: () => Promise<RunResult>): Promise<Medida> {
  for (let i = 0; i < calentamientos; i++) {
    await correr(); // calentamiento: se descarta, las cifras no entran
  }
  const corridas: number[] = [];
  for (let i = 0; i < repeticiones; i++) {
    const resultado = await correr();
    corridas.push(Math.max(0, Math.round(resultado.duracionMs)));
  }
  const resumen = medianaYMad(corridas);
  return { mediana: resumen.mediana, mad: resumen.mad, corridas };
}

/** Mediana y mediana de las desviaciones absolutas (MAD), en un solo sitio. */
export function medianaYMad(valores: number[]): { mediana: number; mad: number } {
  if (valores.length === 0) return { mediana: 0, mad: 0 };
  const ordenados = valores.slice().sort((a, b) => a - b);
  const mitad = Math.floor(ordenados.length / 2);
  const mediana =
    ordenados.length % 2 === 0
      ? (ordenados[mitad - 1] + ordenados[mitad]) / 2
      : ordenados[mitad];
  const desviaciones = ordenados
    .map((valor) => Math.abs(valor - mediana))
    .sort((a, b) => a - b);
  const mitadDesvi = Math.floor(desviaciones.length / 2);
  const mad =
    desviaciones.length % 2 === 0
      ? (desviaciones[mitadDesvi - 1] + desviaciones[mitadDesvi]) / 2
      : desviaciones[mitadDesvi];
  return { mediana, mad };
}

/** La regla de la 0.3.F: nada de ganadoras por debajo del doble del mayor MAD. */
export function veredictoDe(original: Medida, optimizada: Medida): Veredicto {
  const umbral = 2 * Math.max(original.mad, optimizada.mad);
  const diferencia = original.mediana - optimizada.mediana;
  if (Math.abs(diferencia) <= umbral) return "dentro-de-la-dispersion";
  return diferencia > 0 ? "mas-rapida-la-optimizada" : "mas-rapida-la-original";
}

export async function compararMediciones(
  correrOriginal: () => Promise<RunResult>,
  correrOptimizada: () => Promise<RunResult>,
): Promise<Comparacion> {
  const original = await medir(correrOriginal);
  const optimizada = await medir(correrOptimizada);
  return {
    original,
    optimizada,
    veredicto: veredictoDe(original, optimizada),
    notas: "Medido en este equipo con estos límites: 2 corridas de calentamiento descartadas y 10 válidas, mediana y mediana de desviaciones absolutas (MAD). La diferencia entre equipos no se promete.",
  };
}
