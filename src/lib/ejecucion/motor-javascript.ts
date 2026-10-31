import type { Limites, RunRequest, RunResult } from "./tipos.ts";
import { instrumentar } from "./instrumentar.ts";
import { codigoWorker } from "./worker-javascript.ts";
import { topeValorTraza } from "./limites.ts";

/**
 * Ejecutor de JavaScript en Worker (0.3.C, tarea 2).
 *
 * El código de la persona se instrumenta aquí, en el hilo de la web, y corre dentro de un
 * Worker creado desde un Blob: sin DOM, sin red (el Worker bloquea fetch, XHR, WebSocket,
 * importScripts antes de ejecutar nada). La web termina el Worker a la fuerza cuando se pasa
 * el tiempo límite; el corte por salida lo aplica el propio Worker al capturar `console`. El
 * corte por memoria se comprueba con el delta de heap cuando el motor lo ofrece (0.3.B); si
 * no se puede medir, el resultado lo dice en lugar de fingir un límite.
 *
 * `correrPorTransporte` es la única vía de resultado: el transporte concreto es el Worker del
 * navegador en la web y, en las pruebas de Node, un Worker real de `worker_threads` que
 * evalúa la misma fuente del `worker-javascript.ts`. Ninguna prueba inventa resultados.
 */

export type Transporte = {
  enviar(mensaje: unknown): void;
  terminar(): void;
  alResultado(observador: (mensaje: unknown) => void): void;
  alFallo(observador: (aviso: string) => void): void;
};

/** Margen que se añade al límite de tiempo para dar al Worker un turno de despedida. */
export const margenCorteMs = 250;

export async function ejecutarJavaScript(solicitud: RunRequest): Promise<RunResult> {
  const navegadorSinWorker =
    typeof Worker === "undefined" || typeof URL?.createObjectURL !== "function";
  if (navegadorSinWorker) {
    return noSoportado(
      "La ejecución de JavaScript se hace en un Worker del navegador: aquí no está disponible.",
    );
  }
  const instrumentado = instrumentar(solicitud.codigo, { trazar: solicitud.trazar ?? false });
  const url = URL.createObjectURL(new Blob([codigoWorker()], { type: "text/javascript" }));
  try {
    return await correrPorTransporte(transporteWorker(url), solicitud, instrumentado.codigo, !instrumentado.instrumentable);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Puente síncrono con el transporte: envía, espera, corta por tiempo y convierte a RunResult. */
export function correrPorTransporte(
  crearTransporte: () => Transporte,
  solicitud: RunRequest,
  codigoAEnviar: string,
  sinInstrumento = false,
): Promise<RunResult> {
  return new Promise((resolver) => {
    const limite = solicitud.limites;
    const transporte = crearTransporte();
    const inicio = performance.now();
    let acabado = false;

    const acabar = (resultado: RunResult) => {
      if (acabado) return;
      acabado = true;
      clearTimeout(temporizador);
      resolver(resultado);
    };

    const temporizador = setTimeout(() => {
      transporte.terminar();
      acabar(cortePorTiempo(Math.round(performance.now() - inicio), limite));
    }, limite.tiempoMs + margenCorteMs);

    transporte.alResultado((mensaje) => {
      if (!esResultado(mensaje)) return;
      const delWorker = mensaje.resultado;
      acabar({
        ...delWorker,
        duracionMs: Math.round(performance.now() - inicio),
        motor: delWorker.motor ?? motorLocal(),
        origen: "ejecucion-real",
      });
    });

    transporte.alFallo((aviso) => {
      acabar(conFallo(aviso, Math.round(performance.now() - inicio)));
    });

    transporte.enviar({
      tipo: "cifra-ejecutar",
      topeValorTraza,
      sinInstrumento,
      solicitud: { ...solicitud, codigo: codigoAEnviar },
    });
  });
}

/** El transporte real: un Worker del navegador desde un Blob. */
export function transporteWorker(url: string): () => Transporte {
  return () => {
    const worker = new Worker(url);
    return {
      enviar: (mensaje) => worker.postMessage(mensaje),
      terminar: () => worker.terminate(),
      alResultado: (observador) => {
        worker.onmessage = (evento) =>
          observador((evento as MessageEvent<unknown>).data);
      },
      alFallo: (observador) => {
        worker.onerror = (evento) => {
          evento.preventDefault();
          observador(evento.message || "el Worker falló sin mensaje");
        };
      },
    };
  };
}

export function cortePorTiempo(duracionMs: number, limites: Limites): RunResult {
  return {
    estado: "tiempo",
    stdout: "",
    stderr: `El programa no terminó en ${limites.tiempoMs} ms (0.3.B) y la web lo cortó.`,
    duracionMs,
    motor: motorLocal(),
    origen: "ejecucion-real",
  };
}

export function conFallo(aviso: string, duracionMs: number): RunResult {
  return {
    estado: "error",
    stdout: "",
    stderr: aviso,
    duracionMs,
    motor: motorLocal(),
    origen: "ejecucion-real",
  };
}

export function noSoportado(aviso: string): RunResult {
  return {
    estado: "no-soportado",
    stdout: "",
    stderr: aviso,
    duracionMs: 0,
    motor: { nombre: "javascript", version: "n/d" },
    origen: "ejecucion-real",
  };
}

function motorLocal(): { nombre: string; version: string } {
  const version =
    typeof navigator !== "undefined" && navigator.userAgent ? navigator.userAgent : "desconocida";
  return { nombre: "javascript", version };
}

type MensajeResultado = {
  tipo: "cifra-resultado";
  resultado: Omit<RunResult, "origen"> & { origen?: string };
};

function esResultado(mensaje: unknown): mensaje is MensajeResultado {
  return (
    typeof mensaje === "object" &&
    mensaje !== null &&
    (mensaje as { tipo?: unknown }).tipo === "cifra-resultado" &&
    typeof (mensaje as { resultado?: unknown }).resultado === "object" &&
    (mensaje as { resultado?: unknown }).resultado !== null
  );
}
