import type { RunRequest, RunResult } from "./tipos.ts";
import { correrPorTransporte, noSoportado, transporteWorker } from "./motor-javascript.ts";
import { codigoWorkerPyodide } from "./worker-pyodide.ts";

/**
 * Ejecutor de Python con Pyodide (0.3.C, tarea 5).
 *
 * El worker se crea igual que el de JavaScript (Blob + transporte compartido), pero carga
 * Pyodide por CDN en la primera ejecución. La lista de paquetes queda cerrada a la biblioteca
 * estándar: el worker no llama a `loadPackagesFromImports`, así que cualquier `import` que no
 * sea stdlib falla con ModuleNotFoundError — que es lo que hay que enseñar, no un escenario
 * fingido.
 *
 * Decisiones honestas que este módulo hereda del contrato 4.4:
 * - el corte por tiempo lo aplica la web terminando el worker (0.3.B: estado `tiempo`);
 * - el corte por salida lo aplica el propio worker al capturar stdout/stderr;
 * - la memoria de este runtime no se mide: `memoriaMBUsada` queda ausente, no se simula;
 * - la carga del CDN cuenta dentro del tope de tiempo de la primera ejecución: es tiempo real
 *   que la web gastó y el usuario debe saberlo.
 */

export async function ejecutarPython(solicitud: RunRequest): Promise<RunResult> {
  if (solicitud.lenguaje !== "python") {
    return noSoportado("El motor de Python solo ejecuta solicitudes de language-python.");
  }
  const navegadorSinWorker =
    typeof Worker === "undefined" || typeof URL?.createObjectURL !== "function";
  if (navegadorSinWorker) {
    return noSoportado(
      "Pyodide se carga dentro de un Worker del navegador: aquí no está disponible.",
    );
  }
  const url = URL.createObjectURL(new Blob([codigoWorkerPyodide()], { type: "text/javascript" }));
  try {
    // El código Python viaja tal cual: el instrumento de traza es de JavaScript y aquí no aplica.
    return await correrPorTransporte(transporteWorker(url), solicitud, solicitud.codigo, true, false);
  } finally {
    URL.revokeObjectURL(url);
  }
}
