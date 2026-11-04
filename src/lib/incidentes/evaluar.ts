/**
 * La evaluación estructurada (0.5.D): local y pura, sin red y sin modelo. Los campos del
 * análisis de la persona se comparan campo por campo contra `respuestaEsperada`, y cada cita
 * de evidencia se comprueba contra el sistema de ficheros real del paquete.
 *
 * Todo el resultado es `comprobado-regla`: cada estado y cada detalle se puede verificar
 * volviendo a ejecutar la comparación. La IA (0.5.E) recibe esta comparación y la redacta;
 * nunca recibe `respuestaEsperada` ni devuelve juicio.
 *
 * Reglas de la comparación (notas de la 0.5 en NOVEDADES_AI.md):
 * - Un campo encaja cuando sus palabras salientes (sin artículos, con plurales y femeninos
 *   reducidos a raíz) cubren las del texto esperado. No hay modelo: es una regla verificable.
 * - El campo solo queda «acertado» si el análisis lleva al menos una cita SOSTENIDA que lo
 *   respalda; las citas llevan ruta y texto, no etiqueta de campo, así que el respaldo se
 *   determina a nivel de análisis. Fallar esa prueba nunca finge éxito.
 * - La evidencia de `respuestaEsperada` se escribe como `ruta:cadena` o `ruta`. Un punto que
 *   ninguna cita sostenida cubre queda en `pasadoPorAlto`.
 */

import type {
  AnalizoIncidente,
  CitaEvidencia,
  EvaluacionIncidente,
  IncidentSpec,
  JuicioCampo,
  JuicioEvidencia,
} from "./tipos.ts";
import { buscaRuta, creaSistema, lineasDe, type Sistema } from "./sistema.ts";

/** Cobertura mínima de las palabras del texto esperado para dar un campo por encajado. */
export const UMBRAL_COBERTURA = 0.6;

/** Páginas completas de una cita: la tolerancia de renumeración es ±2 (nota de la 0.5). */
export const TOLERANCIA_RENUMERACION = 2;

/* ------------------------------------------------------------------ */
/* Palabras: quitar tildes, partir y reducir a raíz                    */
/* ------------------------------------------------------------------ */

const PALABRAS_DE = new Set([
  "de",
  "la",
  "el",
  "que",
  "en",
  "y",
  "a",
  "los",
  "del",
  "se",
  "las",
  "por",
  "un",
  "una",
  "para",
  "con",
  "no",
  "su",
  "al",
  "lo",
  "como",
  "o",
  "es",
  "esta",
  "este",
  "hay",
  "mas",
  "sin",
  "sobre",
  "si",
  "fue",
  "ser",
]);

/** Baja las tildes y el resto de diacríticos, y normaliza todo a minúsculas. */
export function sinTildes(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Todo a una forma comparable: sin tildes, sin puntuación y con espacios limpios. */
export function textoPlano(texto: string): string {
  return sinTildes(texto.toLowerCase())
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reduce una palabra a su raíz: plural y género se caen, para comparar sin modelo. */
export function raizDe(palabra: string): string {
  let raiz = palabra;
  if (raiz.length > 4 && raiz.endsWith("es")) raiz = raiz.slice(0, -2);
  else if (raiz.length > 3 && raiz.endsWith("s")) raiz = raiz.slice(0, -1);
  if (raiz.length > 3 && /[aeiou]+$/.test(raiz)) raiz = raiz.replace(/[aeiou]+$/, "");
  return raiz;
}

/** Las palabras salientes de un texto: raíces que no son conectora ni demasiado cortas. */
export function palabrasDe(texto: string): string[] {
  return textoPlano(texto)
    .split(" ")
    .filter((palabra) => palabra.length > 2 && !PALABRAS_DE.has(palabra))
    .map(raizDe)
    .filter((raiz) => raiz.length > 0);
}

/** Cuánto de B está en A: palabras de B cubiertas por A, entre el total de B. */
export function cobertura(deA: string[], lasDeB: string[]): number {
  if (lasDeB.length === 0) return 0;
  const setDeB = new Set(lasDeB);
  const acertadas = new Set(deA.filter((palabra) => setDeB.has(palabra)));
  return acertadas.size / lasDeB.length;
}

/**
 * ¿La línea dice lo que se afirma? Dos vías, ambas verificables: la afirmación está dentro
 * de la línea tal cual (cita literal), o casi toda la afirmación aparece en la línea
 * (misma idea con relleno de más). Sin modelo: cobertura de palabras.
 */
export function laLineaDice(linea: string, afirmacion: string): boolean {
  const afirmacionLimpia = afirmacion.trim();
  if (afirmacionLimpia.length === 0) return false;
  const planoLinea = textoPlano(linea);
  const planoAfirmacion = textoPlano(afirmacionLimpia);
  if (planoAfirmacion.length > 0 && planoLinea.includes(planoAfirmacion)) return true;
  const laminaLinea = palabrasDe(linea);
  const laminaAfirmacion = palabrasDe(afirmacionLimpia);
  if (laminaAfirmacion.length === 0) return false;
  // Por cobertura: la línea dice todo lo afirmado, con palabras de más.
  const coberturaAfirmacion = cobertura(laminaLinea, laminaAfirmacion);
  if (coberturaAfirmacion >= UMBRAL_COBERTURA) return true;
  // O toca la parte gorda de la línea, con palabras de más.
  return cobertura(laminaAfirmacion, laminaLinea) >= UMBRAL_COBERTURA;
}

const MAXIMO_CITA = 180;

function citaLaLinea(numero: number, contenido: string): string {
  const texto = contenido.trim();
  const acotado = texto.length > MAXIMO_CITA ? `${texto.slice(0, MAXIMO_CITA)}…` : texto;
  return `línea ${numero}: «${acotado}»`;
}

/* ------------------------------------------------------------------ */
/* Citas: comprobar contra el sistema de ficheros del paquete          */
/* ------------------------------------------------------------------ */

type CitaComprobada = JuicioEvidencia & {
  /** Números de línea (contando desde 1) que sostienen la afirmación. */
  lineasSostenidas: number[];
};

function comprobarCita(sistema: Sistema, cita: CitaEvidencia): CitaComprobada {
  const encontrada = buscaRuta(sistema, cita.ruta);
  if (!encontrada.ok) {
    const problema =
      encontrada.problema === "fuera-del-paquete"
        ? `la ruta no está en el paquete: ${cita.ruta}`
        : `la ruta no existe en el paquete: ${cita.ruta}`;
    return { cita, estado: "no-existe", detalle: problema, lineasSostenidas: [] };
  }
  if (encontrada.tipo !== "fichero") {
    return {
      cita,
      estado: "no-sostiene",
      detalle: `la ruta es un directorio, no un fichero: ${encontrada.ruta}`,
      lineasSostenidas: [],
    };
  }
  const lineas = lineasDe(sistema.ficheros.get(encontrada.ruta)!);
  // Números (desde 1) de las líneas que de verdad dicen lo que se afirma.
  const sostenidas: number[] = [];
  lineas.forEach((linea, indice) => {
    if (laLineaDice(linea, cita.afirmacion)) sostenidas.push(indice + 1);
  });
  if (sostenidas.length === 0) {
    return {
      cita,
      estado: "no-sostiene",
      detalle: `ninguna línea de ${encontrada.ruta} dice eso: «${cita.afirmacion}»`,
      lineasSostenidas: [],
    };
  }
  const dentro = cita.linea === undefined
    ? sostenidas
    : sostenidas.filter(
        (numero) => Math.abs(numero - cita.linea!) <= TOLERANCIA_RENUMERACION,
      );
  if (dentro.length > 0) {
    return {
      cita,
      estado: "sostenida",
      detalle: citaLaLinea(dentro[0], lineas[dentro[0] - 1]),
      lineasSostenidas: dentro,
    };
  }
  // La afirmación está en el fichero, pero no en la línea citada ni cerca.
  return {
    cita,
    estado: "sostenida",
    detalle: `la afirmación está en ${citaLaLinea(sostenidas[0], lineas[sostenidas[0] - 1])}, no en la línea ${cita.linea}`,
    lineasSostenidas: sostenidas,
  };
}

/* ------------------------------------------------------------------ */
/* Evidencia esperada: puntos «ruta:cadena»                            */
/* ------------------------------------------------------------------ */

type PuntoEsperado = { punto: string; ruta: string; cadena: string | null };

/** Divide un punto de `respuestaEsperada.evidencia`: `ruta:cadena` o `ruta`. */
export function puntoEsperado(texto: string): PuntoEsperado {
  const corte = texto.indexOf(":");
  if (corte < 0) return { punto: texto, ruta: texto.trim(), cadena: null };
  return {
    punto: texto,
    ruta: texto.slice(0, corte).trim(),
    cadena: texto.slice(corte + 1).trim() || null,
  };
}

function laLineaContiene(cadena: string, linea: string): boolean {
  const planoCadena = textoPlano(cadena);
  if (planoCadena.length === 0) return false;
  return textoPlano(linea).includes(planoCadena);
}

/** ¿Alguna de las citas sostenidas prueban este punto esperado? Rutas iguales y, con cadena, línea. */
function puntoCubierto(sistema: Sistema, punto: PuntoEsperado, citas: CitaComprobada[]): boolean {
  const rutaEsperada = laRuta(punto.ruta);
  return citas.some((comprobada) => {
    if (comprobada.estado !== "sostenida") return false;
    const rutaCitada = laRuta(comprobada.cita.ruta);
    if (rutaCitada !== rutaEsperada) return false;
    if (punto.cadena === null) return true;
    const encontrada = buscaRuta(sistema, rutaEsperada);
    if (!encontrada.ok || encontrada.tipo !== "fichero") return false;
    const lineas = lineasDe(sistema.ficheros.get(encontrada.ruta)!);
    for (const numero of comprobada.lineasSostenidas) {
      const linea = lineas[numero - 1];
      if (linea !== undefined && laLineaContiene(punto.cadena, linea)) return true;
    }
    return false;
  });
}

/** La ruta de un punto o de una cita, en forma absoluta sin dobles barras. */
function laRuta(texto: string): string {
  const limpia = texto.trim().length === 0 ? "/" : texto.trim();
  return (limpia.startsWith("/") ? limpia : `/${limpia}`).replace(/\/{2,}/g, "/");
}

/* ------------------------------------------------------------------ */
/* La comparación completa                                             */
/* ------------------------------------------------------------------ */

const CAMPOS = ["causa", "impacto", "correccion", "comoDetectarlo"] as const;

/**
 * Evalúa un análisis contra un paquete. Pura: mismo paquete y mismo análisis dan el mismo
 * resultado, sin red. `quePaso` se compara con `causa` (0.5.C — 0.5.D).
 */
export function evaluar(paquete: IncidentSpec, analizo: AnalizoIncidente): EvaluacionIncidente {
  const sistema = creaSistema(paquete.ficheros);
  const citas = analizo.evidencia.map((cita) => comprobarCita(sistema, cita));
  const haySostenida = citas.some((comprobada) => comprobada.estado === "sostenida");

  const campos: EvaluacionIncidente["campos"] = {
    causa: juzgarCampo(paquete.respuestaEsperada.causa, analizo.quePaso, haySostenida),
    impacto: juzgarCampo(paquete.respuestaEsperada.impacto, analizo.impacto, haySostenida),
    correccion: juzgarCampo(
      paquete.respuestaEsperada.correccion,
      analizo.correccion,
      haySostenida,
    ),
    comoDetectarlo: juzgarCampo(
      paquete.respuestaEsperada.comoDetectarlo,
      analizo.comoDetectarlo,
      haySostenida,
    ),
  };

  const puntosEsperados = paquete.respuestaEsperada.evidencia.map(puntoEsperado);
  const pasadoPorAlto = puntosEsperados
    .filter((punto) => !puntoCubierto(sistema, punto, citas))
    .map((punto) => punto.punto);

  const evidencia: JuicioEvidencia[] = citas.map((comprobada) => ({
    cita: comprobada.cita,
    estado: comprobada.estado,
    detalle: comprobada.detalle,
  }));

  return { campos, evidencia, pasadoPorAlto };
}

function juzgarCampo(esperado: string, escrito: string, haySostenida: boolean): JuicioCampo {
  const palabrasEscritas = palabrasDe(escrito);
  if (palabrasEscritas.length === 0) return "pasado-por-alto";
  const palabrasEsperadas = palabrasDe(esperado);
  if (palabrasEsperadas.length === 0) return "pasado-por-alto";
  const coincide = cobertura(palabrasEscritas, palabrasEsperadas) >= UMBRAL_COBERTURA;
  if (!coincide) return "pasado-por-alto";
  return haySostenida ? "acertado" : "deducido-sin-evidencia";
}
