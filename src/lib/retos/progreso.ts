/**
 * El progreso de los retos (0.4.E): se guarda en este navegador y en ningún otro sitio.
 *
 * Sin cuentas. Lo que se guarda: el plan elegido, qué retos están superados (y cuáles quedaron
 * como «superado sin comprender»), el resultado de la prueba de nivel y los conceptos marcados
 * para repasar. Se puede exportar como fichero y volver a importarlo sin pérdida.
 *
 * El desbloqueo del plan profesional (0.4.A) vive AQUÍ, en un único lugar: se supera el umbral
 * cuando un reto de nivel ≥ `umbralProfesional` queda superado, o cuando la prueba de nivel
 * estima un nivel igual o mayor. La IA no puede cambiarlo: no recibe este dato ni lo devuelve.
 */

import type { Plan } from "./tipos";

export const umbralProfesional = 5;
export const versionProgreso = 1;

const CLAVE = "cifra.retos";

export type EntradaReto = {
  estado: "superado" | "superado-sin-comprender";
  nivel: number;
  fecha: string; // ISO de la primera vez que se superó
};

export type PruebaNivel = {
  resueltos: string[]; // ids de los tramos superados, en el orden que se intentaron
  nivelEstimado: number; // 0 mientras no se haya terminado
  fecha: string;
};

export type Progreso = {
  version: typeof versionProgreso;
  plan: Plan | null;
  retos: Record<string, EntradaReto>;
  pruebaNivel: PruebaNivel | null;
  profesionalDesbloqueado: boolean;
  conceptosRepaso: string[];
};

export function progresoInicial(): Progreso {
  return {
    version: versionProgreso,
    plan: null,
    retos: {},
    pruebaNivel: null,
    profesionalDesbloqueado: false,
    conceptosRepaso: [],
  };
}

/** Carga validada desde este navegador: lo que no encaja con la forma guardada no se usa. */
export function cargarProgreso(): Progreso {
  if (typeof localStorage === "undefined") return progresoInicial();
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return progresoInicial();
    const deserializado = deserializarProgreso(JSON.parse(crudo) as unknown);
    return deserializado ? deserializado : progresoInicial();
  } catch {
    return progresoInicial();
  }
}

export function guardarProgreso(progreso: Progreso): { ok: boolean; error?: string } {
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

/**
 * Marca un reto como superado (0.4.C: el veredicto sale del ejecutor de pruebas, no de aquí).
 * «Superado sin comprender» solo nace en la primera superación fallida en la defensa; la
 * defensa superada más tarde lo asciende a «superado». El «superado» nunca se degrada.
 */
export function marcarSuperado(
  progreso: Progreso,
  id: string,
  nivel: number,
  sinComprender: boolean,
): { progreso: Progreso; profesionalDesbloqueado: boolean } {
  const siguiente: Progreso = { ...progreso, retos: { ...progreso.retos } };
  const previa = siguiente.retos[id];
  if (!previa) {
    siguiente.retos[id] = {
      estado: sinComprender ? "superado-sin-comprender" : "superado",
      nivel,
      fecha: new Date().toISOString(),
    };
  } else if (previa.estado === "superado-sin-comprender" && !sinComprender) {
    siguiente.retos[id] = { ...previa, estado: "superado" };
  }
  if (nivel >= umbralProfesional && !siguiente.profesionalDesbloqueado) {
    siguiente.profesionalDesbloqueado = true;
    return { progreso: siguiente, profesionalDesbloqueado: true };
  }
  return { progreso: siguiente, profesionalDesbloqueado: false };
}

/**
 * Guarda el resultado de la prueba de nivel (0.4.A) y desbloquea el profesional si el nivel
 * estimado alcanza el umbral. `sinComprender` nunca aplica aquí: la prueba no lleva defensa.
 */
export function guardarPruebaNivel(
  progreso: Progreso,
  resueltos: string[],
  nivelEstimado: number,
): { progreso: Progreso; profesionalDesbloqueado: boolean } {
  const siguiente: Progreso = {
    ...progreso,
    pruebaNivel: {
      resueltos: [...resueltos],
      nivelEstimado,
      fecha: progreso.pruebaNivel?.fecha ?? new Date().toISOString(),
    },
  };
  let desbloqueado = false;
  if (nivelEstimado >= umbralProfesional && !siguiente.profesionalDesbloqueado) {
    siguiente.profesionalDesbloqueado = true;
    desbloqueado = true;
  }
  return { progreso: siguiente, profesionalDesbloqueado: desbloqueado };
}

/**
 * Cambia el plan (0.4.A: la elección es reversible y no toca el progreso). Elegir el
 * profesional exige estar desbloqueado: así nadie entra al camino profesional sin haber
 * pasado la prueba de nivel ni alcanzado el umbral.
 */
export function cambiarPlan(progreso: Progreso, plan: Plan): { progreso: Progreso; error?: string } {
  if (plan === "profesional" && !progreso.profesionalDesbloqueado) {
    return {
      progreso,
      error:
        `El plan profesional se abre al superar un reto de nivel ${umbralProfesional} o al terminar ` +
        `la prueba de nivel con nivel estimado ${umbralProfesional} o más. Todavía no está abierto.`,
    };
  }
  return { progreso: { ...progreso, plan } };
}

/** El texto que la persona descarga como fichero. El formato propio es el de `Progreso`. */
export function exportarProgreso(progreso: Progreso): string {
  return JSON.stringify(progreso, null, 2);
}

/** Importación estricta: solo se acepta lo que tiene la forma exacta que exportamos. */
export function importarProgreso(texto: string): { ok: true; progreso: Progreso } | { ok: false; error: string } {
  let valor: unknown;
  try {
    valor = JSON.parse(texto);
  } catch {
    return { ok: false, error: "El fichero no es JSON legible." };
  }
  const progreso = deserializarProgreso(valor, { exigente: true });
  if (!progreso) {    return { ok: false, error: "El fichero no tiene la forma de un progreso exportado por Cifra." };
  }
  return { ok: true, progreso };
}

function deserializarProgreso(
  valor: unknown,
  { exigente = false }: { exigente?: boolean } = {},
): Progreso | null {
  if (!valor || typeof valor !== "object") return null;
  const registro = valor as Record<string, unknown>;
  if (registro.version !== versionProgreso) return null;

  if (
    registro.plan !== null &&
    registro.plan !== "desde-cero" &&
    registro.plan !== "profesional"
  ) {
    return null;
  }
  if (typeof registro.profesionalDesbloqueado !== "boolean") return null;
  if (!Array.isArray(registro.conceptosRepaso)) return null;
  if (!registro.conceptosRepaso.every((item) => typeof item === "string")) return null;

  if (!registro.retos || typeof registro.retos !== "object" || Array.isArray(registro.retos)) {
    return null;
  }

  const retos: Record<string, EntradaReto> = {};
  for (const [id, entrada] of Object.entries(registro.retos as Record<string, unknown>)) {
    const valida = deserializarEntrada(entrada);
    if (valida) retos[id] = valida;
    else if (exigente) return null;
  }

  let pruebaNivel: PruebaNivel | null = null;
  if (registro.pruebaNivel !== null && registro.pruebaNivel !== undefined) {
    const cruda = registro.pruebaNivel;
    if (
      typeof cruda === "object" &&
      cruda !== null &&
      Array.isArray((cruda as Record<string, unknown>).resueltos) &&
      ((cruda as Record<string, unknown>).resueltos as unknown[]).every(
        (item) => typeof item === "string",
      ) &&
      esFechaISO((cruda as Record<string, unknown>).fecha)
    ) {
      pruebaNivel = {
        resueltos: [...((cruda as Record<string, unknown>).resueltos as string[])],
        nivelEstimado: asignarNivelEstimado((cruda as Record<string, unknown>).nivelEstimado),
        fecha: (cruda as Record<string, unknown>).fecha as string,
      };
    } else {
      return null;
    }
  }

  return {
    version: versionProgreso,
    plan: registro.plan as Progreso["plan"],
    retos,
    pruebaNivel,
    profesionalDesbloqueado: registro.profesionalDesbloqueado,
    conceptosRepaso: registro.conceptosRepaso as string[],
  };
}

function deserializarEntrada(valor: unknown): EntradaReto | null {
  if (!valor || typeof valor !== "object") return null;
  const cruda = valor as Record<string, unknown>;
  if (cruda.estado !== "superado" && cruda.estado !== "superado-sin-comprender") return null;
  if (!esFechaISO(cruda.fecha)) return null;
  return { estado: cruda.estado, nivel: asignarNivel(cruda.nivel), fecha: cruda.fecha };
}

function esFechaISO(valor: unknown): valor is string {
  if (typeof valor !== "string") return false;
  return !Number.isNaN(Date.parse(valor));
}

function asignarNivel(valor: unknown): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1 || numero > 10) return 1;
  return numero;
}

function asignarNivelEstimado(valor: unknown): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 0 || numero > 10) return 0;
  return numero;
}

export function nivelEstimadoDe(progreso: Progreso): number {
  return progreso.pruebaNivel?.nivelEstimado ?? 0;
}
