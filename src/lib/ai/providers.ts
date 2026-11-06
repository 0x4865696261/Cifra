/**
 * Proveedores de modelo. El catálogo y los adaptadores viven en
 * `adaptadores/`: un fichero por proveedor más un índice con la lista. La clave
 * nunca se guarda en el servidor: llega en la petición, se usa para esa llamada
 * y se olvida. Sin clave del usuario, el servidor puede aportar la suya de
 * plataforma.
 */

import { adaptadorDe, type ProviderId } from "./adaptadores/index.ts";
import { FalloProveedor, postJson } from "./adaptadores/transporte.ts";
import type { ModelAdapter } from "./adaptadores/tipos.ts";
import type { PlanDeRespuesta } from "./plan.ts";

export { isProviderId, providerInfo, providers, type ProviderId } from "./adaptadores/index.ts";
export { FalloProveedor, type ErrorDeProveedor, type TipoFallo } from "./adaptadores/transporte.ts";
export type { ModelAdapter, PeticionProveedor } from "./adaptadores/tipos.ts";

/** Las claves van en una cabecera; espacios, saltos o comillas son involuntarios. */
export function cleanApiKey(key: string): string {
  return key.replace(/[\s"'`]/g, "");
}

/** Forma de la clave: las comunes para todos y, si el proveedor trae las suyas, también. */
export function keyLooksValid(proveedor: ProviderId, key: string): boolean {
  if (key.length < 16 || key.length > 400) return false;
  if (/[\s"'`]/.test(key)) return false;
  const adaptador = adaptadorDe(proveedor);
  if (!adaptador) return false;
  return adaptador.clave?.(key) ?? true;
}

export type OpcionesLlamada = {
  /** El id del módulo adaptador que atiende esta llamada. */
  proveedor: string;
  /** La clave de esta llamada; viaja en headers y no se guarda. */
  clave: string;
  /** Modelo concreto; vacío o ausente, el por defecto del adaptador. */
  modelo?: string;
};

/**
 * La llamada a través de un adaptador concreto (0.6): el plan convertido en
 * petición, un reintento en 429 y 5xx, la respuesta leída por el adaptador y
 * cualquier fallo traducido con su etiqueta.
 */
export async function llamarCon(
  adaptador: ModelAdapter,
  plan: PlanDeRespuesta,
  opciones: { clave: string; modelo?: string },
): Promise<string> {
  const peticion = adaptador.construirPeticion(plan, {
    modelo: opciones.modelo?.trim() || adaptador.defaultModel,
    clave: opciones.clave,
  });
  try {
    const crudo = await postJson(peticion.url, peticion.headers, peticion.cuerpo);
    return adaptador.leerRespuesta(crudo).texto;
  } catch (error) {
    const fallo = adaptador.traducirError(error);
    throw fallo instanceof Error ? fallo : new FalloProveedor(fallo.tipo, fallo.mensaje);
  }
}

/** Una llamada al modelo con la clave dada. Devuelve el texto bruto de la respuesta. */
export async function callModel(plan: PlanDeRespuesta, opciones: OpcionesLlamada): Promise<string> {
  const adaptador = adaptadorDe(opciones.proveedor);
  if (!adaptador) {
    throw new FalloProveedor(
      "respuesta-invalida",
      `El proveedor «${opciones.proveedor}» no está registrado en esta versión.`,
    );
  }
  return llamarCon(adaptador, plan, opciones);
}
