/**
 * El progreso de los paquetes de incidente (0.5.H): se guarda en este navegador y en ninguno
 * más, igual que el de los retos. Sin cuentas. Lo que se guarda: qué paquetes se atacaron (se
 * abrió la pantalla de incidente), en cuáles ya se entregó un análisis y cómo fue la última
 * comparación. Se puede exportar como fichero y volver a importarlo sin pérdida.
 *
 * Aquí no se decide si el análisis está bien: eso ya lo tomó la evaluación (0.5.D). Esto solo
 * lo recuerda: qué se atacó y qué quedó sin volver a mirar.
 */

export const versionProgresoIncidentes = 1;

const CLAVE = "cifra.incidentes";

export type ResumenEvaluacion = {
  /** Campos marcados «acertado» (0.5.D). */
  acertados: number;
  /** Campos marcados «deducido sin evidencia». */
  deducidos: number;
  /** Campos marcados «pasado por alto». */
  altos: number;
  /** Citas sostenidas, sobre el total de citas entregadas. */
  sostenidas: number;
  citas: number;
  /** Puntos de la evidencia esperada que quedaron sin cubrir. */
  puntosAlto: number;
  puntosTotales: number;
};

export type EntradaIncidente = {
  estado: "abierto" | "entregado";
  nivel: number;
  /** ISO del último suceso: primera apertura o última entrega. */
  cuando: string;
  /** El resumen de la última comparación; falta si nunca se entregó. */
  resumen?: ResumenEvaluacion;
};

export type ProgresoIncidentes = {
  version: typeof versionProgresoIncidentes;
  paquetes: Record<string, EntradaIncidente>;
};

export function progresoIncidentesInicial(): ProgresoIncidentes {
  return { version: versionProgresoIncidentes, paquetes: {} };
}

/** Cuántos campos forman el 0.5.C: se compara contra la respuesta esperada campo por campo. */
export const CAMPOS_TOTALES = 4;

/** Carga validada desde este navegador: lo que no encaja con la forma guardada no se usa. */
export function cargarProgresoIncidentes(): ProgresoIncidentes {
  if (typeof localStorage === "undefined") return progresoIncidentesInicial();
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return progresoIncidentesInicial();
    const deserializado = deserializar(JSON.parse(crudo) as unknown);
    return deserializado ?? progresoIncidentesInicial();
  } catch {
    return progresoIncidentesInicial();
  }
}

export function guardarProgresoIncidentes(progreso: ProgresoIncidentes): {
  ok: boolean;
  error?: string;
} {
  if (typeof localStorage === "undefined") {
    return { ok: false, error: "Este navegador no guarda datos: el progreso se perderá al cerrar." };
  }
  try {
    localStorage.setItem(CLAVE, JSON.stringify(progreso));
    return { ok: true };
  } catch {
    return { ok: false, error: "Este navegador no ha podido guardar el progreso." };
  }
}

/** Apunta que se abrió un paquete: «qué se atacó». No toca los que ya están entregados. */
export function marcarAbierto(progreso: ProgresoIncidentes, id: string, nivel: number): ProgresoIncidentes {
  const paquetes = { ...progreso.paquetes };
  const previa = paquetes[id];
  if (previa?.estado === "entregado") return progreso;
  paquetes[id] = {
    estado: "abierto",
    nivel: nivelValido(nivel),
    cuando: previa?.cuando ?? new Date().toISOString(),
  };
  return { ...progreso, paquetes };
}

/** Guarda la entrega con el resumen de la comparación (0.5.D). Sobre «abierto», la asciende. */
export function guardarEntrega(
  progreso: ProgresoIncidentes,
  id: string,
  nivel: number,
  resumen: ResumenEvaluacion,
): { progreso: ProgresoIncidentes; entradoAntes: boolean } {
  const paquetes = { ...progreso.paquetes };
  const previa = paquetes[id];
  paquetes[id] = {
    estado: "entregado",
    nivel: nivelValido(nivel),
    cuando: new Date().toISOString(),
    resumen,
  };
  return { progreso: { ...progreso, paquetes }, entradoAntes: previa?.estado === "entregado" };
}

/** Lo que quedó sin volver a mirar: paquetes abiertos que nunca llegaron a entregarse. */
export function sinVolverAMirar(progreso: ProgresoIncidentes): string[] {
  return Object.entries(progreso.paquetes)
    .filter(([, entrada]) => entrada.estado === "abierto")
    .sort((a, b) => a[1].cuando.localeCompare(b[1].cuando))
    .map(([id]) => id);
}

/** El texto que la persona descarga como fichero. El formato propio es el de `ProgresoIncidentes`. */
export function exportarProgresoIncidentes(progreso: ProgresoIncidentes): string {
  return JSON.stringify(progreso, null, 2);
}

/** Importación estricta: solo se acepta lo que tiene la forma exacta que exportamos. */
export function importarProgresoIncidentes(
  texto: string,
): { ok: true; progreso: ProgresoIncidentes } | { ok: false; error: string } {
  let valor: unknown;
  try {
    valor = JSON.parse(texto);
  } catch {
    return { ok: false, error: "El fichero no es JSON legible." };
  }
  const progreso = deserializar(valor, { exigente: true });
  if (!progreso) {
    return {
      ok: false,
      error: "El fichero no tiene la forma de un progreso de incidentes exportado por Cifra.",
    };
  }
  return { ok: true, progreso };
}

function deserializar(
  valor: unknown,
  { exigente = false }: { exigente?: boolean } = {},
): ProgresoIncidentes | null {
  if (!valor || typeof valor !== "object") return null;
  const crudo = valor as Record<string, unknown>;
  if (crudo.version !== versionProgresoIncidentes) return null;
  if (!crudo.paquetes || typeof crudo.paquetes !== "object" || Array.isArray(crudo.paquetes)) {
    return null;
  }
  const paquetes: Record<string, EntradaIncidente> = {};
  for (const [id, entrada] of Object.entries(crudo.paquetes as Record<string, unknown>)) {
    const valida = deserializarEntrada(entrada);
    if (valida) paquetes[id] = valida;
    else if (exigente) return null;
  }
  return { version: versionProgresoIncidentes, paquetes };
}

function deserializarEntrada(valor: unknown): EntradaIncidente | null {
  if (!valor || typeof valor !== "object") return null;
  const cruda = valor as Record<string, unknown>;
  if (cruda.estado !== "abierto" && cruda.estado !== "entregado") return null;
  if (!esFechaISO(cruda.cuando)) return null;
  let resumen: ResumenEvaluacion | undefined;
  if (cruda.resumen !== undefined) {
    const valido = deserializarResumen(cruda.resumen);
    if (!valido) return null;
    resumen = valido;
  }
  return {
    estado: cruda.estado as EntradaIncidente["estado"],
    nivel: nivelValido(cruda.nivel),
    cuando: cruda.cuando as string,
    resumen,
  };
}

function deserializarResumen(valor: unknown): ResumenEvaluacion | null {
  if (!valor || typeof valor !== "object") return null;
  const crudo = valor as Record<string, unknown>;
  const enteros = [
    "acertados",
    "deducidos",
    "altos",
    "sostenidas",
    "citas",
    "puntosAlto",
    "puntosTotales",
  ] as const;
  const salida: Record<string, number> = {};
  for (const campo of enteros) {
    const numero = Number(crudo[campo]);
    if (!Number.isInteger(numero) || numero < 0) return null;
    salida[campo] = numero;
  }
  const total = salida.acertados + salida.deducidos + salida.altos;
  // El resumen debe poder venir de una comparación real: cuatro campos, sin inventar.
  if (total !== CAMPOS_TOTALES) return null;
  if (salida.citas > 0 && salida.sostenidas > salida.citas) return null;
  return {
    acertados: salida.acertados,
    deducidos: salida.deducidos,
    altos: salida.altos,
    sostenidas: salida.sostenidas,
    citas: salida.citas,
    puntosAlto: salida.puntosAlto,
    puntosTotales: salida.puntosTotales,
  };
}

function esFechaISO(valor: unknown): valor is string {
  if (typeof valor !== "string") return false;
  return !Number.isNaN(Date.parse(valor));
}

function nivelValido(valor: unknown): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1 || numero > 10) return 1;
  return numero;
}
