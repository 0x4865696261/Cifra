/**
 * Límites de ejecución por defecto (0.3.B). Viven en un único fichero: nada de números
 * sueltos por el código. La interfaz, los motores y las pruebas comprueban estos mismos valores.
 */

export const limitesEjecucion = {
  tiempoMs: 5000,
  memoriaMB: 128,
  salidaKB: 64,
  pasosTraza: 2000,
} as const;

/** Recorte de cada valor de variable en la traza, en caracteres (0.3.B). */
export const topeValorTraza = 200;

export function limitesDefecto(): {
  tiempoMs: number;
  memoriaMB: number;
  salidaKB: number;
  pasosTraza: number;
} {
  return { ...limitesEjecucion };
}
