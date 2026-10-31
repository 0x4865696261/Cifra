/**
 * Contrato 4.5 de NOVEDADES_AI.md: un reto de fundamentos.
 *
 * `ChallengeSpec` copia el contrato tal cual está en el documento. Lo que aquí se amplía no
 * forma parte del contrato: `DefinicionReto` describe cómo un módulo de contenido produce una
 * instancia concreta del reto para una persona, y `InstanciaReto` es lo que la interfaz ya
 * recibe resuelto (con los datos generados y las pruebas fijadas dentro).
 */

import type { TestSpec } from "@/lib/ejecucion/tipos";

export type ChallengeSpec = {
  id: string;
  titulo: string;
  familia: string; // "bucles", "condicionales", "funciones", "colecciones", "cadenas", ...
  nivel: number; // 1 a 10
  enunciado: string;
  codigoDePartida: string;
  lenguajes: string[]; // 0.4: ["javascript"] hasta que exista un ejecutor de pruebas de Python
  generador?: { semilla: "por-persona"; parametros: Record<string, unknown> }; // variantes
  pruebas: TestSpec[];
  conceptos: string[]; // ids de la biblioteca
  preguntasDefensa: string[]; // para «defiende tu solución»
};

/** La fuente determinista de la que sale una variante: un número y una forma de pedir más. */
export type Rand = () => number;

/** Los datos generados para una persona: van a la vista (enunciado, código) y a las pruebas. */
export type DatosReto = Record<string, string>;

/** Con los datos ya generados, el módulo produce el texto y las pruebas fijas del reto. */
export type FabricaReto = (datos: DatosReto) => {
  enunciado: string;
  codigoDePartida: string;
  pruebas: TestSpec[];
};

export type DefinicionReto = {
  id: string;
  titulo: string;
  familia: string;
  nivel: number;
  conceptos: string[];
  preguntasDefensa: string[];
  /** Los datos que cambian con la semilla por persona. */
  crearDatos: (aleatorio: Rand) => DatosReto;
  fabrica: FabricaReto;
};

export type InstanciaReto = ChallengeSpec & { datos: DatosReto };

/** El plan elegido en la entrada (0.4.A): elegir no destruye el progreso, es reversible. */
export type Plan = "desde-cero" | "profesional";

/** Cómo acaba un reto para esta persona (0.4.E). Solo la ejecución da "superado". */
export type EstadoReto = "pendiente" | "superado" | "superado-sin-comprender";

/**
 * Una señal de integridad (0.4.D): describe lo que ocurrió en la pestaña, no acusa a nadie y
 * nunca bloquea un envío. La señal activa la pregunta de defensa, nada más.
 */
export type SenalIntegridad = {
  tipo: "foco-perdido" | "pegado-grande" | "ritmo-imposible";
  detalle: string;
  /** Marca de tiempo relativa del navegador (performance.now) en ms. */
  cuando: number;
};
