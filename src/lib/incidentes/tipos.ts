/**
 * Contrato 4.6 de NOVEDADES_AI.md: un paquete de incidente.
 *
 * `IncidentSpec` copia el contrato tal cual está en el documento. Lo que aquí se añade no
 * forma parte del contrato: `AnalizoIncidente` es el análisis con campos fijos que escribe la
 * persona (0.5.C) y `DefinicionIncidente` añade al paquete su análisis de ejemplo correcto,
 * que solo lo usan las pruebas (0.5: «el análisis de ejemplo correcto de cada paquete se
 * evalúa como acertado»).
 */

export type IncidentSpec = {
  id: string;
  titulo: string;
  nivel: number; // 1 a 10
  familia: string;
  sintoma: string; // lo que la persona sabe al empezar
  ficheros: Record<string, string>; // sistema de ficheros virtual: ruta → contenido
  respuestaEsperada: {
    causa: string;
    evidencia: string[]; // «ruta:cadena de la línea que lo prueba» o «ruta» (el fichero entero)
    impacto: string;
    correccion: string;
    comoDetectarlo: string;
  };
  conceptos: string[]; // slugs de la biblioteca
};

/** Las familias de 0.5.F. Un paquete del mínimo pertenece a una de ellas. */
export const familiasIncidente = [
  "limite-coleccion",
  "valor-nulo",
  "nombre-inexistente",
  "estado-corrupto",
  "secreto-expuesto",
  "permiso-de-mas",
  "consulta-lenta",
  "bloqueo-espera",
  "desborde-recursos",
  "discrepancia-mensaje",
] as const;

/** Rutas del paquete: sin punto, sin mayúsculas y siempre con la raíz `/`. Es material sintético. */
export const rutaIncidente = /^[a-z0-9][a-z0-9._/-]*$/;

/**
 * Una cita de evidencia (0.5.C): dónde miró y qué dice ahí. Sin `linea`, la afirmación se
 * comprueba contra el fichero entero; con `linea`, contra esa línea (±2 de renumeración).
 */
export type CitaEvidencia = {
  ruta: string;
  linea?: number;
  afirmacion: string;
};

/** El análisis con campos fijos (0.5.C). Lo que la persona manda, sin relleno. */
export type AnalizoIncidente = {
  idPaquete: string;
  quePaso: string;
  evidencia: CitaEvidencia[];
  impacto: string;
  correccion: string;
  comoDetectarlo: string;
};

/**
 * El resultado del análisis de la persona (0.5.D), todo `comprobado-regla`: la comparación ya
 * está tomada antes de que el modelo exista. El modelo la redacta; no la cambia.
 */
export type JuicioCampo = "acertado" | "deducido-sin-evidencia" | "pasado-por-alto";

export type JuicioEvidencia = {
  cita: CitaEvidencia;
  estado: "sostenida" | "no-existe" | "no-sostiene";
  /** Por qué: la línea que de verdad sostiene la afirmación, o qué falta. */
  detalle: string;
};

export type EvaluacionIncidente = {
  campos: Record<"causa" | "impacto" | "correccion" | "comoDetectarlo", JuicioCampo>;
  evidencia: JuicioEvidencia[];
  /** Puntos de `respuestaEsperada.evidencia` que ninguna cita sostenida cubrió. */
  pasadoPorAlto: string[];
};

export type DefinicionIncidente = IncidentSpec & {
  notaFamilia: string;
  /** El análisis correcto de ejemplo: lo usan las pruebas del paquete (0.5), no la interfaz. */
  analizoEstandar: AnalizoIncidente;
};
