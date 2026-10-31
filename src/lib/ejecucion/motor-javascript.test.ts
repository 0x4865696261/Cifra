import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { correrPorTransporte } from "./motor-javascript.ts";
import { instrumentar } from "./instrumentar.ts";
import { limitesDefecto } from "./limites.ts";
import { liberarHilos, transporteHilo } from "./hiloPrueba.ts";
import type { RunRequest } from "./tipos.ts";

/**
 * Las pruebas del motor usan el arnés común (hiloPrueba.ts): la misma fuente que la web corre
 * en el Worker del navegador, evaluada en un Worker real de Node. Nada de resultados simulados.
 */

after(() => liberarHilos());

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

describe("los límites cortan el programa de JavaScript", () => {
  it("un bucle sin fin termina por tiempo y el proceso queda entero", async () => {
    const resultado = await correr(
      "let vueltas = 0;\nwhile (true) {\n  vueltas = vueltas + 1;\n}\n",
      { limites: { ...limitesDefecto(), tiempoMs: 300 } },
    );
    assert.equal(resultado.estado, "tiempo");
    assert.ok(resultado.stderr.includes("300 ms"), resultado.stderr);
    assert.equal(resultado.stdout, "");
    assert.ok(resultado.duracionMs >= 300, `corte anticipado: ${resultado.duracionMs} ms`);
    assert.ok(resultado.duracionMs < 5000, `el corte tardó demasiado: ${resultado.duracionMs} ms`);
    assert.equal(resultado.origen, "ejecucion-real");
  });

  it("un programa que imprime sin parar acaba en salida-excedida y con la salida recortada", async () => {
    const resultado = await correr(
      'while (true) {\n  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");\n}\n',
      { limites: { ...limitesDefecto(), salidaKB: 4 } },
    );
    assert.equal(resultado.estado, "salida-excedida");
    assert.equal(resultado.codigoSalida, 1);
    assert.ok(resultado.stderr.includes("4 KB"), resultado.stderr);
    assert.ok(resultado.stdout.length <= 4 * 1024, `salida sin recortar: ${resultado.stdout.length}`);
    assert.ok(resultado.stdout.length > 0, "no se conservó nada de la salida previa");
  });

  it("el programa que reserva memoria sin parar se corta y no se inventa un límite de heap", async () => {
    const resultado = await correr(
      "let bolsa = [];\nwhile (true) {\n  bolsa.push(bolsa.length);\n}\n",
      { limites: { ...limitesDefecto(), tiempoMs: 300 } },
    );
    // En Node no hay performance.memory: el corte real es por tiempo y memoriaMBUsada se
    // queda ausente (0.3.B: no se simula). En Chrome con heap medible, el mismo programa
    // acabaría en estado "memoria" si el delta supera el tope.
    assert.ok(resultado.estado === "tiempo" || resultado.estado === "memoria", resultado.estado);
    assert.equal(resultado.memoriaMBUsada, undefined);
    assert.equal(resultado.origen, "ejecucion-real");
  });

  it("la traza que pasa del tope de pasos queda marcada como truncada", async () => {
    const resultado = await correr(
      "let suma = 0;\nfor (let i = 0; i < 100; i++) {\n  suma = suma + i;\n}\nconsole.log(suma);\n",
      { trazar: true, limites: { ...limitesDefecto(), pasosTraza: 50 } },
    );
    assert.equal(resultado.estado, "ok");
    assert.equal(resultado.stdout, "4950\n");
    assert.equal(resultado.trazaTruncada, true);
    assert.ok(resultado.traza && resultado.traza.length === 50, `pasos: ${resultado.traza?.length}`);
  });
});

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
