/**
 * El contrato del modelo en los incidentes (0.5.D/E), separado de las funciones de servidor
 * para que las pruebas lo corran sin red. La comparación campo por campo ya está tomada por
 * la regla local de `src/lib/incidentes/evaluar.ts`: el modelo solo la REDACTA.
 *
 * El modelo nunca recibe `respuestaEsperada` (la causa, la corrección ni el «cómo detectarlo»
 * esperados no salen de Cifra) y no puede devolver juicio: si la respuesta del modelo enumera
 * un estado nuevo, una calificación o una causa que no esté en la comparación, se rechaza
 * enterá. La redacción válida lleva cada párrafo con su procedencia, y `comprobado-regla` se
 * exige exacto: marquear una creación suya con ese sello sería lavar la regla.
 */

import type { CitaEvidencia, EvaluacionIncidente, JuicioCampo } from "@/lib/incidentes/tipos";

export type ProcedenciaComentario = "comprobado-regla" | "opinion";

export type ParrafoComparacion = { texto: string; procedencia: ProcedenciaComentario };

export type RedaccionComparacion = {
  /** 1 a 8 párrafos que redactan la comparación que ya está decidida. */
  parrafos: ParrafoComparacion[];
};

export type ResultadoRedaccion =
  | { ok: true; redaccion: RedaccionComparacion }
  | { ok: false; error: string; raw?: string };

/** Topes de la redacción del modelo, en un solo lugar. */
export const TOPE_PARRAFOS = 8;
export const TOPE_TEXTO_PARAFO = 900;

/**
 * Palabras reservadas del juicio: si el modelo las usa como clave, está decidiendo —y eso no
 * le corresponde—. La comparación ya decidió; rechazar la respuesta entera evita una redacción
 * que traiga su propio veredicto.
 */
const JUICIOS_PROHIBIDOS = [
  "veredicto",
  "verdict",
  "calificacion",
  "calificación",
  "aprobado",
  "suspenso",
  "suspendido",
  "superado",
  "nota",
  "score",
  "rating",
  "causa real",
  "causa esperada",
  "solución correcta",
  "respuesta esperada",
  "puntua",
  "puntúa",
];

export function parseRedaccion(raw: string): RedaccionComparacion | null {
  const valor = jsonDe(raw);
  if (!valor) return null;
  for (const juicio of JUICIOS_PROHIBIDOS) {
    if (Object.keys(valor).some((key) => key.toLowerCase().includes(juicio))) return null;
  }
  if (valor.parrafos === undefined) return null;
  const entradas = valor.parrafos;
  if (!Array.isArray(entradas) || entradas.length === 0 || entradas.length > TOPE_PARRAFOS) {
    return null;
  }
  const parrafos: ParrafoComparacion[] = [];
  for (const entrada of entradas) {
    if (!entrada || typeof entrada !== "object") return null;
    const cruda = entrada as Record<string, unknown>;
    // El texto llega acotado y la procedencia se exige exacta: sin sello, rechazo.
    const texto = typeof cruda.texto === "string" ? cruda.texto.trim() : "";
    if (!texto || texto.length > TOPE_TEXTO_PARAFO) return null;
    if (cruda.procedencia !== "comprobado-regla" && cruda.procedencia !== "opinion") return null;
    parrafos.push({
      texto,
      procedencia: cruda.procedencia as ProcedenciaComentario,
    });
  }
  return { parrafos };
}

/** La vía que lleva la redacción a la interfaz: la forma correcta o un error útil. */
export function redactarComparacionLocal(raw: string): ResultadoRedaccion {
  const redaccion = parseRedaccion(raw);
  if (!redaccion) {
    return {
      ok: false,
      error:
        "El modelo contestó, pero no en la forma esperada, o intentó decidir la comparación, " +
        "que ya está tomada por la regla local.",
      raw: raw.slice(0, 1500),
    };
  }
  return { ok: true, redaccion };
}

/* ------------------------------------------------------------------ */
/* Lo que recibe el modelo: la comparación, no más                     */
/* ------------------------------------------------------------------ */

const NOMBRES_CAMPO: Record<"causa" | "impacto" | "correccion" | "comoDetectarlo", string> = {
  causa: "qué pasó",
  impacto: "impacto",
  correccion: "corrección",
  comoDetectarlo: "cómo detectarlo antes",
};

const NOMBRE_ESTADO: Record<JuicioCampo, string> = {
  "acertado": "acertado (sostenido por evidencia)",
  "deducido-sin-evidencia": "deducido sin evidencia",
  "pasado-por-alto": "pasado por alto",
};

const ESTADO_CITA: Record<string, string> = {
  "sostenida": "sostenida (el fichero dice lo citado)",
  "no-existe": "no existe en el paquete",
  "no-sostiene": "nada en el fichero sostiene lo citado",
};

/** El análisis de la persona, tal cual lo escribió. Va envuelto como material, no como orden. */
export type AnalizoParaRedaccion = {
  quePaso: string;
  impacto: string;
  correccion: string;
  comoDetectarlo: string;
};

/** Las líneas de la comparación que el modelo puede comentar: cada una lleva su estado ya decidido. */
export function lineasDeComparacion(
  evaluacion: EvaluacionIncidente,
  analizo: AnalizoParaRedaccion,
): string[] {
  const lineas: string[] = [];
  for (const nombre of ["causa", "impacto", "correccion", "comoDetectarlo"] as const) {
    const escrito = nombre === "causa" ? analizo.quePaso : analizo[nombre];
    lineas.push(
      `- campo ${NOMBRES_CAMPO[nombre]}: ${NOMBRE_ESTADO[evaluacion.campos[nombre]]}.` +
        (escrito.trim() ? ` Lo que la persona escribió: «${acota(escrito, 400)}».` : " Quedó vacío."),
    );
  }
  for (const juicio of evaluacion.evidencia) {
    lineas.push(
      `- cita de ${juicio.cita.ruta}` +
        (juicio.cita.linea ? ` línea ${juicio.cita.linea}` : "") +
        `: ${ESTADO_CITA[juicio.estado]}${juicio.detalle ? ` — ${juicio.detalle}` : ""}`,
    );
  }
  for (const punto of evaluacion.pasadoPorAlto) {
    lineas.push(`- llamado y sin cubrir: ${punto}`);
  }
  return lineas;
}

function acota(texto: string, tope: number): string {
  return texto.length > tope ? `${texto.slice(0, tope)}…` : texto;
}

export type { CitaEvidencia };

function jsonDe(raw: string): Record<string, unknown> | null {
  const fenced = raw.trim().match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidato = fenced?.[1]?.trim() ?? raw.trim();
  const inicio = candidato.indexOf("{");
  const fin = candidato.lastIndexOf("}");
  if (inicio < 0 || fin <= inicio) return null;
  try {
    const valor: unknown = JSON.parse(candidato.slice(inicio, fin + 1));
    if (!valor || typeof valor !== "object") return null;
    return valor as Record<string, unknown>;
  } catch {
    return null;
  }
}
