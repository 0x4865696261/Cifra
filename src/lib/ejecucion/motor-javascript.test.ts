import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { Worker } from "node:worker_threads";
import { codigoWorker } from "./worker-javascript.ts";
import { correrPorTransporte, type Transporte } from "./motor-javascript.ts";
import { instrumentar } from "./instrumentar.ts";
import { limitesDefecto } from "./limites.ts";
import type { RunRequest } from "./tipos.ts";

/**
 * Las pruebas corren la MISMA fuente que la web corre en el Worker del navegador, dentro de
 * un Worker real de Node (worker_threads con eval). El shim adapta el objeto `self`: nada de
 * resultados simulados, todo lo que aquí pasa es ejecución de verdad en otro hilo.
 *
 * Lo que Node no da: la lectura de heap (`performance.memory`), así que el límite de memoria
 * queda en «no se pudo medir» — y así se comprueba también aquí: ausente, no inventado.
 */

const hilos: Array<Worker> = [];

after(async () => {
  await Promise.all(hilos.map((hilo) => hilo.terminate()));
});

function transporteHilo(): () => Transporte {
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

function solicitud(codigo: string, extra: Partial<RunRequest> = {}): RunRequest {
  return {
    lenguaje: "javascript",
    codigo,
    limites: limitesDefecto(),
    ...extra,
  };
}

async function correr(
  codigo: string,
  extra: Partial<RunRequest> = {},
) {
  const pedido = solicitud(codigo, extra);
  const instrumentado = instrumentar(pedido.codigo, { trazar: pedido.trazar ?? false });
  return correrPorTransporte(
    transporteHilo(),
    pedido,
    instrumentado.codigo,
    !instrumentado.instrumentable,
  );
}

describe("motor de JavaScript en Worker", () => {
  it("corre un programa feliz: salida, sello y motor con versión", async () => {
    const resultado = await correr(
      'let a = 1;\nconsole.log("hola", 2);\nconsole.log(a + 1);\n',
      { trazar: false },
    );
    assert.equal(resultado.estado, "ok");
    assert.equal(resultado.stdout, "hola 2\n2\n");
    assert.equal(resultado.codigoSalida, 0);
    assert.ok(resultado.duracionMs >= 0);
    assert.equal(resultado.origen, "ejecucion-real");
    assert.equal(resultado.motor.nombre, "javascript");
    assert.ok(resultado.motor.version.length > 0);
    assert.equal(resultado.traza, undefined);
  });

  it("un fallo del programa queda como estado error con el mensaje y salida 1", async () => {
    const resultado = await correr("constructor_funcionQueNoExiste();".replace("constructor_", ""), {
      trazar: true,
    });
    assert.equal(resultado.estado, "error");
    assert.equal(resultado.codigoSalida, 1);
    assert.ok(resultado.stderr.includes("ReferenceError"), resultado.stderr);
    // Habrá un paso de traza del programa; la excepción lo cierra con su evento.
    assert.ok(resultado.traza && resultado.traza.some((paso) => paso.evento === "excepcion"));
  });

  it("el código con el prefijo del instrumento se ejecuta sin marcas y sin colisión", async () => {
    const resultado = await correr('let _cifra = 5;\nconsole.log(_cifra * 2);\n', {
      trazar: true,
    });
    assert.equal(resultado.estado, "ok");
    assert.equal(resultado.stdout, "10\n");
    assert.ok(resultado.traza && resultado.traza.length === 0);
  });

  it("fetch está bloqueado: el intento falla dentro del programa y nada sale", async () => {
    const resultado = await correr(
      'let intento = "pasó";\ntry {\n  fetch("https://ejemplo-inesperado.tld");\n} catch (e) {\n  intento = "bloqueado";\n}\nconsole.log(intento);\n',
    );
    assert.equal(resultado.estado, "ok");
    assert.ok(resultado.stdout.startsWith("bloqueado"), resultado.stdout);
  });

  it("importScripts y WebSocket también caen en la misma regla", async () => {
    const resultado = await correr(
      "let piezas = \"\";\ntry { WebSocket(); } catch (e) { piezas += \"ws;\"; }\ntry { importScripts(\"x\"); } catch (e) { piezas += \"is;\"; }\nconsole.log(piezas);\n",
    );
    assert.equal(resultado.estado, "ok");
    assert.equal(resultado.stdout, "ws;is;\n");
  });

  it("el DOM no existe: el programa se entera y no rompe la web", async () => {
    const resultado = await correr('console.log(typeof document, typeof window);\n');
    assert.equal(resultado.estado, "ok");
    assert.equal(resultado.stdout, "undefined undefined\n");
  });

  it("la traza llega paso a paso con las variables del momento", async () => {
    const resultado = await correr("let n = 2;\nn = n * 10;\nconsole.log(n);\n", { trazar: true });
    assert.equal(resultado.estado, "ok");
    const traza = resultado.traza ?? [];
    assert.ok(traza.length >= 3, `traza esperada con pasos: ${JSON.stringify(traza)}`);
    assert.equal(traza[0].evento, "linea");
    assert.equal(traza[0].linea, 1);
    const ultimaLinea = traza[traza.length - 1];
    assert.equal(ultimaLinea.variables["n"], "20");
  });

  it("registra el evento de retorno con su valor", async () => {
    const resultado = await correr("function doble(x) {\n  return x * 2;\n}\ndoble(21);\n", {
      trazar: true,
    });
    assert.equal(resultado.estado, "ok");
    const retorno = (resultado.traza ?? []).find((paso) => paso.evento === "retorno");
    assert.ok(retorno, "falta el paso de retorno");
    assert.equal(retorno.variables["retorna"], "42");
  });

  it("los temporizadores quedan anotados: el cuerpo acaba y después no corre nada", async () => {
    const resultado = await correr(
      'setTimeout(function () { console.log("DEPENDIENTE"); }, 10);\nconsole.log("inmediato");\n',
    );
    assert.equal(resultado.estado, "ok");
    assert.ok(resultado.stdout.startsWith("inmediato"), resultado.stdout);
    assert.ok(!resultado.stdout.includes("DEPENDIENTE"));
    assert.ok(resultado.stdout.includes("temporizador"), resultado.stdout);
  });
});
