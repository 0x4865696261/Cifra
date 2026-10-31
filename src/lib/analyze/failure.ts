import type { LanguageId } from "./structure.ts";

/**
 * Análisis local del mensaje de error, sin modelo: contrato 4.2 de NOVEDADES_AI.md.
 * Todo lo que sale de aquí es consecuencia de una regla aplicada sobre texto, así que
 * si ninguna regla encaja el tipo es «desconocido» en lugar de forzarse.
 */

export type Procedencia =
  | "comprobado-ejecucion"
  | "comprobado-regla"
  | "deducido"
  | "opinion";

export type Afirmacion = { texto: string; procedencia: Procedencia };

export type TipoError =
  | "sintaxis"
  | "nombre-inexistente"
  | "tipo"
  | "valor-nulo"
  | "limite-coleccion"
  | "aritmetica"
  | "prestamo-propiedad"
  | "metodo-inexistente"
  | "importacion"
  | "desconocido";

export type FailureReport = {
  lenguaje: string;
  mensaje: {
    crudo: string;
    tipo: TipoError;
    lineasNombradas: number[];
    identificadoresCitados: string[];
  };
  fragmento: { n: number; texto: string; marcada: boolean }[];
  guia?: {
    leerElMensaje: Afirmacion[];
    localizarElSitio: Afirmacion[];
    hipotesis: { texto: string; coste: 1 | 2 | 3; comoComprobarla: string }[];
    entradaQueFallaHoy: string;
    entradaQueDebeSeguirFuncionando: string;
    comoHabriaSaltadoAntes: string;
  };
};

type ReglaTipo = { tipo: TipoError; encaja: RegExp };

const reglasPorLenguaje: Partial<Record<LanguageId, ReglaTipo[]>> = {
  javascript: [
    { tipo: "valor-nulo", encaja: /cannot read propert(y|ies) of (undefined|null)/i },
    { tipo: "nombre-inexistente", encaja: /\bis not defined\b/i },
    { tipo: "metodo-inexistente", encaja: /\bis not a function\b/i },
    { tipo: "sintaxis", encaja: /\bunexpected token\b|\bsyntaxerror\b/i },
  ],
  python: [
    { tipo: "valor-nulo", encaja: /attributeerror:\s*'?nonetype'?/i },
    { tipo: "nombre-inexistente", encaja: /\bnameerror\b/i },
    { tipo: "limite-coleccion", encaja: /\bindexerror\b|\bkeyerror\b/i },
    { tipo: "tipo", encaja: /\btypeerror\b/i },
    { tipo: "aritmetica", encaja: /\bzerodivisionerror\b/i },
    { tipo: "sintaxis", encaja: /\bindentationerror\b|\bsyntaxerror\b/i },
    { tipo: "importacion", encaja: /\bmodulenotfounderror\b|\bimporterror\b/i },
  ],
  rust: [
    { tipo: "nombre-inexistente", encaja: /\bE0425\b/ },
    { tipo: "tipo", encaja: /\bE0308\b/ },
    { tipo: "prestamo-propiedad", encaja: /\bE0382\b|\bE0499\b|\bE0502\b/ },
    { tipo: "metodo-inexistente", encaja: /\bE0599\b/ },
    { tipo: "limite-coleccion", encaja: /index out of bounds/i },
    { tipo: "valor-nulo", encaja: /called `?Option::unwrap\(\)` on a `?None`? value/i },
  ],
};

const LINEA_LIBRE = /(?:l[ií]nea|line)\s+(\d{1,5})/gi;
const LINEA_EN_TRACEBACK = /, line (\d{1,5})/g;
const LINEA_Y_COLUMNA = /:(\d{1,5}):\d{1,5}/g;
const IDENTIFICADOR = /["'`]([^"'`\n]{1,40})["'`]/g;
const MAX_LINEAS = 12;
const MAX_IDENTIFICADORES = 6;

export function analyzeFailure(
  codigo: string,
  mensaje: string,
  lenguaje: string,
): FailureReport {
  return {
    lenguaje,
    mensaje: {
      crudo: mensaje,
      tipo: tipoDeError(mensaje, lenguaje),
      lineasNombradas: collectLines(mensaje),
      identificadoresCitados: collectIdentifiers(mensaje),
    },
    fragmento: fragmentoDesdeCodigo(codigo, collectLines(mensaje)),
  };
}

function tipoDeError(mensaje: string, lenguaje: string): TipoError {
  const reglas = reglasPorLenguaje[lenguaje as LanguageId] ?? [];
  for (const regla of reglas) {
    if (regla.encaja.test(mensaje)) return regla.tipo;
  }
  return "desconocido";
}

function collectLines(mensaje: string): number[] {
  const encontradas = new Set<number>();
  for (const patron of [LINEA_LIBRE, LINEA_EN_TRACEBACK, LINEA_Y_COLUMNA]) {
    patron.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = patron.exec(mensaje))) {
      const valor = Number(match[1]);
      if (Number.isInteger(valor) && valor >= 1 && valor <= 5000) encontradas.add(valor);
    }
  }
  return [...encontradas].sort((a, b) => a - b).slice(0, MAX_LINEAS);
}

function collectIdentifiers(mensaje: string): string[] {
  const encontrados = new Set<string>();
  IDENTIFICADOR.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = IDENTIFICADOR.exec(mensaje))) {
    const valor = match[1].trim();
    if (valor && !/^\d+$/.test(valor)) {
      encontrados.add(valor);
      if (encontrados.size >= MAX_IDENTIFICADORES) break;
    }
  }
  return [...encontrados];
}

function fragmentoDesdeCodigo(
  codigo: string,
  lineasNombradas: number[],
): FailureReport["fragmento"] {
  const marcadas = new Set(lineasNombradas);
  return codigo.split(/\r?\n/).map((texto, index) => ({
    n: index + 1,
    texto,
    marcada: marcadas.has(index + 1),
  }));
}
