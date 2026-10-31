import type { GuiaDeDepuracion } from "./debug-parse.ts";
import { versionSkills } from "../skills/registry.ts";

/**
 * Caché del estudio del fallo (0.2.E): misma petición, misma respuesta, sin
 * otra llamada al proveedor. La huella incluye la versión de las skills para
 * que un cambio en su texto invalide lo guardado.
 */

export type EntradaDeGuia = {
  level: string;
  language: string;
  code: string;
  errorMessage: string;
  question: string;
  codeFacts: string[];
  messageFacts: string[];
  provider: string;
  model: string;
};

const MAX_GUARDADAS = 32;
const cache = new Map<string, GuiaDeDepuracion>();

/** Todo lo que distingue una petición de otra; la versión de las skills va con ellas. */
export function objetoDeHuella(entrada: EntradaDeGuia): Record<string, unknown> {
  return { versionSkills, ...entrada };
}

export async function huellaDeGuia(entrada: EntradaDeGuia): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(objetoDeHuella(entrada)));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function guiaEnCache(huella: string): GuiaDeDepuracion | null {
  return cache.get(huella) ?? null;
}

export function guardarGuiaEnCache(huella: string, guia: GuiaDeDepuracion): void {
  cache.set(huella, guia);
  if (cache.size > MAX_GUARDADAS) {
    const masVieja = cache.keys().next().value;
    if (masVieja) cache.delete(masVieja);
  }
}
