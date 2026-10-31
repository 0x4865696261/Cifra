import { datosDe } from "./semilla.ts";
import type { ChallengeSpec, DatosReto, InstanciaReto } from "./tipos";
import { retosDeBucles } from "./contenido/bucles.ts";
import { retosDeCondicionales } from "./contenido/condicionales.ts";
import { retosDeFunciones } from "./contenido/funciones.ts";
import { retosDeColecciones } from "./contenido/colecciones.ts";
import { retosDeCadenas } from "./contenido/cadenas.ts";
import type { RetoCompleto } from "./contenido/utiles.ts";

/**
 * El registro de retos de fundamentos de la 0.4 (0.4.B): 5 familias × 3 niveles. Roadmap
 * restante (más familias y paquetes): solo con contenido nuevo, no reutilizando estos retos.
 */

export type { RetoCompleto } from "./contenido/utiles";

export const definiciones: RetoCompleto[] = [
  ...retosDeBucles,
  ...retosDeCondicionales,
  ...retosDeFunciones,
  ...retosDeColecciones,
  ...retosDeCadenas,
];

/** Las familias tal como se pide el map en la página de retos: en el orden escrito. */
export const familias: string[] = [...new Set(definiciones.map((reto) => reto.familia))];

export function definicionPorId(id: string): RetoCompleto | undefined {
  return definiciones.find((reto) => reto.id === id);
}

/**
 * La instancia del reto para esta persona (:4.5): los datos salen de la semilla por persona,
 * se montan en el enunciado y el código de partida, y las pruebas llevan los valores calculados
 * con la solución de referencia. La misma semilla da siempre la misma instancia; otra semilla,
 * otros datos.
 */
export function instanciaReto(definicion: RetoCompleto, semillaPersona: string): InstanciaReto {
  const datos = datosDe(definicion, semillaPersona);
  const hechos = definicion.fabrica(datos);
  const spec: ChallengeSpec = {
    id: definicion.id,
    titulo: definicion.titulo,
    familia: definicion.familia,
    nivel: definicion.nivel,
    enunciado: hechos.enunciado,
    codigoDePartida: hechos.codigoDePartida,
    lenguajes: ["javascript"],
    generador: { semilla: "por-persona", parametros: datos },
    pruebas: hechos.pruebas,
    conceptos: definicion.conceptos,
    preguntasDefensa: definicion.preguntasDefensa,
  };
  return { ...spec, datos };
}

/** Los ids y niveles en orden de dificultad ascendente, para el recorrido y la prueba de nivel. */
export function enOrdenDeDificultad(): Array<{ id: string; nivel: number; titulo: string }> {
  return [...definiciones]
    .sort((a, b) => a.nivel - b.nivel || a.familia.localeCompare(b.familia))
    .map((reto) => ({ id: reto.id, nivel: reto.nivel, titulo: reto.titulo }));
}
