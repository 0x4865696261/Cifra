/**
 * Límites de entrada del estudio del fallo (0.2.A), fijados en la 0.2.1.
 * Viven aquí para que el servidor valide y la interfaz avise con el mismo número.
 */

export const limitesEntrada = {
  codigo: 20000,
  mensaje: 8000,
  pregunta: 600,
} as const;

/** Tope de tokens de respuesta del modelo por petición (0.2.E). */
export const topeSalidaTokens = 1400;

export function excedeLimite(texto: string, limite: number): boolean {
  return texto.length > limite;
}
