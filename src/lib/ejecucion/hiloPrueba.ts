import { Worker } from "node:worker_threads";
import { codigoWorker } from "./worker-javascript.ts";
import type { Transporte } from "./motor-javascript.ts";

/**
 * Arnés de pruebas para los ejecutores (motor de JavaScript y ejecutor de pruebas).
 *
 * Corre la MISMA fuente que la web corre en el Worker del navegador, dentro de un Worker real
 * de Node (worker_threads con eval). El shim adapta el objeto `self`: nada de resultados
 * simulados, todo lo que aquí pasa es ejecución de verdad en otro hilo.
 *
 * Lo que Node no da: la lectura de heap (`performance.memory`) — el límite de memoria queda
 * en «no se pudo medir» y así se comprueba también aquí: ausente, no inventado.
 */

const hilos: Array<Worker> = [];

/** Corta los hilos que queden vivos: el proceso de pruebas sale limpio al terminar cada fichero. */
export async function liberarHilos(): Promise<void> {
  await Promise.all(hilos.map((hilo) => hilo.terminate()));
}

export function transporteHilo(): () => Transporte {
  return () => {
    const fuente = `const { parentPort } = require("worker_threads");
var self = {
  postMessage: function (m) { parentPort.postMessage(m); },
  setTimeout: function () { return 0; },
  setInterval: function () { return 0; },
  clearTimeout: function () {},
  clearInterval: function () {}
};
parentPort.on("message", function (mensaje) {
  try {
    self.onmessage(mensaje);
  } catch (error) {
    parentPort.postMessage({ tipo: "cifra-fallo", aviso: String(error && error.stack || error) });
  }
});
${codigoWorker()}`;
    const worker = new Worker(fuente, { eval: true });
    worker.unref(); // el hilo no mantiene la prueba viva: la corta el propio motor
    hilos.push(worker);
    return {
      enviar: (mensaje) => worker.postMessage(mensaje),
      terminar: () => worker.terminate(),
      alResultado: (observador) => {
        worker.on("message", (mensaje) => observador(mensaje));
      },
      alFallo: (observador) => {
        worker.on("error", (error) => observador(String(error)));
      },
    };
  };
}
