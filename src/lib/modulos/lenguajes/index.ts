import type { MotorLenguaje, RunRequest, RunResult } from "../../ejecucion/tipos.ts";
import { cargarModulos } from "../registro.ts";
import type { Modulo, RechazoModulo } from "../tipos.ts";
import { c } from "./c.ts";
import { cpp } from "./cpp.ts";
import { csharp } from "./csharp.ts";
import { css } from "./css.ts";
import { go } from "./go.ts";
import { html } from "./html.ts";
import { java } from "./java.ts";
import { javascript } from "./javascript.ts";
import { php } from "./php.ts";
import { python } from "./python.ts";
import { ruby } from "./ruby.ts";
import { rust } from "./rust.ts";
import { sql } from "./sql.ts";
import { typescript } from "./typescript.ts";
import type { EnsayoLenguaje, Familia, Lenguaje, NotaLenguaje, ReglaTipo } from "./tipos.ts";

export type {
  EnsayoLenguaje,
  Familia,
  Lenguaje,
  NotaLenguaje,
  ReglaTipo,
  SenalesLenguaje,
} from "./tipos.ts";

/**
 * Catálogo de la 0.6: un lenguaje es un fichero con su manifiesto y sus datos.
 * El orden de esta lista es el orden de la interfaz (selector, notas, ensayos).
 */
export const catalogoLenguajes = [
  python,
  javascript,
  typescript,
  rust,
  go,
  c,
  cpp,
  java,
  csharp,
  ruby,
  php,
  sql,
  html,
  css,
] as const;

/** Unión literal derivada del catálogo: `LanguageId` ya no se escribe a mano. */
export type LanguageId = (typeof catalogoLenguajes)[number]["contenido"]["id"];

/** Señal de detección ya atribuida a un lenguaje del lote. */
export type Senal = { readonly re: RegExp; readonly lenguaje: LanguageId };

/** Lo que sale de juntar un lote de módulos, sin ningún filtro propio. */
export type AgregadoLenguajes = {
  readonly ids: readonly string[];
  readonly etiquetas: Readonly<Record<string, string>>;
  readonly familias: Readonly<Record<string, Familia>>;
  readonly senalesCodigo: readonly { readonly re: RegExp; readonly lenguaje: string }[];
  readonly senalesMensaje: readonly { readonly re: RegExp; readonly lenguaje: string }[];
  readonly reglas: Readonly<Record<string, readonly ReglaTipo[]>>;
  readonly notas: readonly NotaLenguaje[];
  readonly ensayos: readonly EnsayoLenguaje[];
  readonly motores: Readonly<Record<string, MotorLenguaje>>;
};

/** Agrega en el orden del lote lo que cada módulo aporta. Pura: no mira el catálogo. */
export function agregarLenguajes(modulos: readonly Modulo<Lenguaje>[]): AgregadoLenguajes {
  const ids: string[] = [];
  const etiquetas: Record<string, string> = {};
  const familias: Record<string, Familia> = {};
  const senalesCodigo: { re: RegExp; lenguaje: string }[] = [];
  const senalesMensaje: { re: RegExp; lenguaje: string }[] = [];
  const reglas: Record<string, readonly ReglaTipo[]> = {};
  const notas: NotaLenguaje[] = [];
  const ensayos: EnsayoLenguaje[] = [];
  const motores: Record<string, MotorLenguaje> = {};

  for (const modulo of modulos) {
    const { id, label, familia, senales, reglasError, nota, ensayo, motor } = modulo.contenido;
    ids.push(id);
    etiquetas[id] = label;
    familias[id] = familia;
    for (const re of senales?.codigo ?? []) senalesCodigo.push({ re, lenguaje: id });
    for (const re of senales?.mensaje ?? []) senalesMensaje.push({ re, lenguaje: id });
    if (reglasError) reglas[id] = reglasError;
    if (nota) notas.push({ id, label, code: nota.code, changed: [...nota.changed] });
    if (ensayo) ensayos.push({ ...ensayo, body: [...ensayo.body] });
    if (motor) motores[id] = motor;
  }

  return {
    ids,
    etiquetas,
    familias,
    senalesCodigo,
    senalesMensaje,
    reglas,
    notas,
    ensayos,
    motores,
  };
}

const carga = cargarModulos<Lenguaje>(catalogoLenguajes);

/** Lo que el registro dejó fuera del catálogo; una prueba afirma que no hay nada. */
export const lenguajesRechazados: readonly RechazoModulo[] = carga.rechazados;

const agregado = agregarLenguajes(carga.cargados);

export const languageIds = agregado.ids as readonly LanguageId[];
export const languageLabels = agregado.etiquetas as Record<LanguageId, string>;
export const senalesCodigo = agregado.senalesCodigo as readonly Senal[];
export const senalesMensaje = agregado.senalesMensaje as readonly Senal[];

/** Notas de la página de lenguajes, en orden de catálogo. */
export const notasDeLenguajes: NotaLenguaje[] = [...agregado.notas];
/** Ensayos, en orden de catálogo. */
export const ensayosDeLenguajes: EnsayoLenguaje[] = [...agregado.ensayos];

export function isLanguageId(value: string): value is LanguageId {
  return (languageIds as readonly string[]).includes(value);
}

/** La familia del analizador (0.2.A) de ese lenguaje. */
export function familiaDe(id: LanguageId): Familia {
  return agregado.familias[id];
}

/** Reglas del contrato 4.2 de ese lenguaje; vacío si su módulo no trae. */
export function reglasDeError(lenguaje: string): readonly ReglaTipo[] {
  return agregado.reglas[lenguaje] ?? [];
}

/** El motor que el módulo de ese lenguaje aporta; `undefined` si no trae uno. */
export function motorDe(id: string): MotorLenguaje | undefined {
  return agregado.motores[id];
}

/** Lenguajes con motor, en orden de catálogo: los que entran en el selector del estudio. */
export function lenguajesConMotor(): readonly LanguageId[] {
  return languageIds.filter((id) => agregado.motores[id] !== undefined);
}

/**
 * Despacho del contrato 4.4 (0.6): el motor que su módulo registra; un id sin
 * motor no se ejecuta, vuelve `no-soportado` con el motivo, nunca algo simulado.
 */
export async function ejecutarLenguaje(solicitud: RunRequest): Promise<RunResult> {
  const motor = motorDe(solicitud.lenguaje);
  if (!motor) {
    return {
      estado: "no-soportado",
      stdout: "",
      stderr: `«${solicitud.lenguaje}» no tiene motor de ejecución en esta versión.`,
      duracionMs: 0,
      motor: { nombre: solicitud.lenguaje, version: "n/d" },
      origen: "ejecucion-real",
    };
  }
  return motor.ejecutar(solicitud);
}
