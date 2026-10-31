import type { TraceStep } from "./tipos.ts";
import { topeValorTraza } from "./limites.ts";

/**
 * El valor de una variable en la traza es texto: la traza es material pedagógico,
 * no una copia del objeto en vivo. Lo que no se puede serializar se dice, no se inventa.
 */
export function recortarValor(valor: unknown, tope: number = topeValorTraza): string {
  let texto: string;
  if (valor === null) texto = "null";
  else if (valor === undefined) texto = "undefined";
  else if (typeof valor === "function") texto = `ƒ ${valor.name || "anónima"}`;
  else if (typeof valor === "object") {
    try {
      const serializado = JSON.stringify(valor);
      texto = serializado ?? "[no serializable]";
    } catch {
      texto = "[no serializable]";
    }
  } else texto = String(valor);

  if (texto.length > tope) return `${texto.slice(0, tope)}…`;
  return texto;
}

/** Recorta la lista de pasos al tope acordado y señala si quedó truncada (0.3.B/E). */
export function recortarTraza(
  pasos: TraceStep[],
  topePasos: number,
): { pasos: TraceStep[]; truncada: boolean } {
  if (pasos.length <= topePasos) return { pasos, truncada: false };
  return { pasos: pasos.slice(0, topePasos), truncada: true };
}
