/**
 * El contrato del modelo en los retos (0.4.C/D), separado de las funciones de servidor para que
 * las pruebas lo corran sin red. La regla que manda aquí: el veredicto NO es del modelo. La
 * respuesta del modelo que valida `parseGuiaVeredicto` no lleva ningún campo que declare el
 * resultado, y toda respuesta que intente juzgar —un campo «veredicto», «aprobado», «superado»
 * o similar— se rechaza entera: no hay guía inventada.
 */

export type ProcedenciaComentario = "prueba" | "opinion";

export type ComentarioVeredicto = { texto: string; procedencia: ProcedenciaComentario };

export type GuiaVeredicto = {
  /** Qué salió, en 1 a 4 frases, contando lo que la ejecución ya dijo. */
  resumen: string;
  /** Qué cumple y qué no, cada comentario marcado: `prueba` (sale del resultado) u `opinion`. */
  constata: ComentarioVeredicto[];
  /** Si no pasó: qué mirar. Cadena vacía cuando pasó. */
  siNoPasa: string;
};

export type ResultadoExplicado =
  | { ok: true; guia: GuiaVeredicto; superado: boolean; resultadoDe: "pruebas" }
  | { ok: false; error: string; raw?: string };

/** Palabras reservadas del veredicto: si el modelo las usa, está juzgando, y eso no le toca. */
const JUICIOS_PROHIBIDOS = [
  "veredicto",
  "verdict",
  "resultado",
  "result",
  "aprobado",
  "suspenso",
  "suspendido",
  "superado",
  "supera",
  "pasaAll",
  "passed",
  "nota",
  "score",
  "rating",
];

export function parseGuiaVeredicto(raw: string): GuiaVeredicto | null {
  const valor = jsonDe(raw);
  if (!valor) return null;
  // El rechazo va antes de leer la forma: una respuesta que juzga no es una guía, sea válida
  // o no. Con eso ninguna respuesta del modelo puede darle valor a un veredicto.
  for (const juicio of JUICIOS_PROHIBIDOS) {
    if (Object.keys(valor).some((key) => key.toLowerCase().includes(juicio))) return null;
  }

  const resumen = asString(valor.resumen);
  if (!resumen) return null;

  const constata = asList(valor.constata).map((item) => {
    const texto = asString(item.texto);
    const procedencia = item.procedencia === "prueba" ? "prueba" : "opinion";
    if (!texto) return null;
    return { texto, procedencia } as ComentarioVeredicto;
  });
  if (constata.length === 0 || constata.some((item) => item === null)) return null;

  return {
    resumen,
    constata: constata.map((item) => item as ComentarioVeredicto).slice(0, 6),
    siNoPasa: asString(valor.siNoPasa),
  };
}

/**
 * El segundo contrato: la defensa (0.4.D). Las preguntas las pone el reto (de
 * `preguntasDefensa`, no las inventa el modelo); el modelo solo dice de cada respuesta si
 * demuestra que quien escribe entiende su propio código.
 */
export type JuicioDefensa = { entendido: boolean; comentario: string };

export type ResultadoDefensa =
  | { ok: true; juicios: JuicioDefensa[]; defendido: boolean }
  | { ok: false; error: string; raw?: string };

export function parseDefensa(raw: string, cuantasPreguntas: number): JuicioDefensa[] | null {
  const valor = jsonDe(raw);
  if (!valor) return null;
  for (const juicio of JUICIOS_PROHIBIDOS) {
    if (Object.keys(valor).some((key) => key.toLowerCase().includes(juicio))) return null;
  }
  const entradas = asList(valor.juicios);
  if (entradas.length !== cuantasPreguntas) return null;
  const juicios = entradas.map((item) => {
    const comentario = asString(item.comentario);
    if (!comentario) return null;
    return { entendido: item.entendido === true, comentario } as JuicioDefensa;
  });
  if (juicios.some((item) => item === null)) return null;
  return juicios.map((item) => item as JuicioDefensa);
}

/**
 * La única vía por la que un reto queda superado: el booleano entra hecho (`todasPasadas`
 * del `RunResult` real) y solo se deja pasar; el modelo no tiene campo para tocarlo.
 */
export function explicarVeredictoLocal(superadoPorPruebas: boolean, raw: string): ResultadoExplicado {
  const guia = parseGuiaVeredicto(raw);
  if (!guia) {
    return {
      ok: false,
      error: "El modelo contestó, pero no en la forma esperada, o intentó declarar el veredicto, que no le corresponde.",
      raw: raw.slice(0, 1500),
    };
  }
  return { ok: true, guia, superado: superadoPorPruebas, resultadoDe: "pruebas" };
}

/**
 * El texto de las pruebas para el prompt: lo que la ejecución real dijo, sin adornos, prueba
 * por prueba. Es lo que el modelo puede marcar como `prueba`; todo lo demás es `opinion`.
 */
export type PruebaParaGuia = {
  id: string;
  nombre: string;
  pasada: boolean;
  obtenido?: unknown;
  error?: string;
};

export function lineasDePruebas(pruebas: PruebaParaGuia[]): string[] {
  return pruebas.map((prueba) => {
    if (prueba.pasada) return `- «${prueba.nombre}» (id ${prueba.id}): pasó.`;
    const obtenido = prueba.obtenido === undefined ? "" : ` Lo que salió: ${textoCorto(prueba.obtenido)}.`;
    return `- «${prueba.nombre}» (id ${prueba.id}): no pasó.${obtenido}${prueba.error ? ` Dijo: ${textoCorto(prueba.error)}` : ""}`;
  });
}

function textoCorto(valor: unknown): string {
  const texto = typeof valor === "string" ? valor : JSON.stringify(valor);
  if (texto === undefined) return "valor no imprimible";
  return texto.length > 300 ? `${texto.slice(0, 300)}…` : texto;
}

function jsonDe(raw: string): Record<string, unknown> | null {
  const fenced = raw.trim().match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? raw.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const value: unknown = JSON.parse(candidate.slice(start, end + 1));
    if (!value || typeof value !== "object") return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
}
