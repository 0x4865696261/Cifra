/**
 * Señales de integridad (0.4.D) y lo que Cifra no promete (§9): una web no ve otras pestañas,
 * y las señales de la propia pestaña no prueban nada por sí solas.
 *
 * Por eso todo aquí es observación: una señal se acumula, se guarda tal cual y como mucho
 * activa la pregunta de defensa. Nada en este fichero puede impedir un envío: las funciones
 * no devuelven permisos, devuelven descripciones. Las reglas están fijadas aquí en un único
 * sitio (comprobado-regla), no repartidas por los componentes.
 */

import type { SenalIntegridad } from "./tipos";

/** Un pegado que llega mayor que esto se anota: no se bloquea. */
export const topePegadoGrande = 80;

/** Más que estos caracteres "tecleados" en menos de un segundo no es un ritmo humano. */
export const topeRitmoCaracteres = 60;
export const ventanaRitmoMs = 1000;

/** El registro no crece sin límite. */
export const topeSenales = 20;

export type ObservacionIntegridad = {
  señales: SenalIntegridad[];
  /** true solo si hay al menos una señal: pide a la IA las preguntas de defensa. */
  pideDefensa: boolean;
};

export function observacionVacia(): ObservacionIntegridad {
  return { señales: [], pideDefensa: false };
}

export function observacionDe(señales: SenalIntegridad[]): ObservacionIntegridad {
  return { señales: [...señales], pideDefensa: señales.length > 0 };
}

/** Se anota un pegado: si supera el tope, queda como señal `pegado-grande`. */
export function agregarPegado(
  señales: SenalIntegridad[],
  caracteres: number,
  cuando: number,
): SenalIntegridad[] {
  if (caracteres <= topePegadoGrande) return señales;
  return añadir(señales, {
    tipo: "pegado-grande",
    detalle: `un pegado de ${caracteres} caracteres (tope anotado: ${topePegadoGrande})`,
    cuando,
  });
}

/** La pestaña perdió visibilidad mientras se trabajaba: se anota, nada más. */
export function agregarFocoPerdido(señales: SenalIntegridad[], cuando: number): SenalIntegridad[] {
  return añadir(señales, {
    tipo: "foco-perdido",
    detalle: "la pestaña dejó de estar visible mientras se trabajaba",
    cuando,
  });
}

/**
 * Convierte lo que el editor vio en señales: `caracteres` escritos desde la última marca.
 * El ritmo imposible es una regla aquí, no un cálculo dentro del editor.
 */
export function agregarEscritura(
  señales: SenalIntegridad[],
  caracteres: number,
  desdeMs: number,
  cuando: number,
): SenalIntegridad[] {
  if (caracteres < topeRitmoCaracteres || desdeMs >= ventanaRitmoMs) return señales;
  return añadir(señales, {
    tipo: "ritmo-imposible",
    detalle: `${caracteres} caracteres en menos de ${ventanaRitmoMs} ms`,
    cuando,
  });
}

function añadir(señales: SenalIntegridad[], señal: SenalIntegridad): SenalIntegridad[] {
  const siguientes = [...señales, señal];
  return siguientes.length > topeSenales ? siguientes.slice(siguientes.length - topeSenales) : siguientes;
}
