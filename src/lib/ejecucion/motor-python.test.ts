import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { ejecutarPython } from "./motor-python.ts";
import { correrPorTransporte } from "./motor-javascript.ts";
import { liberarHilos, transporteHiloPyodide } from "./hiloPrueba.ts";
import { limitesDefecto } from "./limites.ts";
import type { RunRequest } from "./tipos.ts";

/**
 * Las pruebas de Python en Node no bajan el CDN: Pyodide pesa cientos de MB y la web de verdad
 * se lo trae en el navegador del usuario. Lo que sigue comprobándose aquí, con el mismo código
 * del worker corriendo en un hilo de Node, es la honestidad del motor: si Pyodide no puede
 * cargarse, el resultado lo dice como error — nunca una salida inventada.
 */

after(() => liberarHilos());

function solicitud(extra: Partial<RunRequest> = {}): RunRequest {
  return {
    lenguaje: "python",
    codigo: 'print("hola")\n',
    limites: limitesDefecto(),
    ...extra,
  };
}

describe("motor de Python con Pyodide", () => {
  it("cuando el CDN no está accesible, el resultado es un error honesto, no una salida fingida", async () => {
    const resultado = await correrPorTransporte(
      transporteHiloPyodide(),
      solicitud(),
      solicitud().codigo,
      true,
    );
    assert.equal(resultado.estado, "error");
    assert.equal(resultado.codigoSalida, 1);
    assert.equal(resultado.stdout, "");
    assert.ok(resultado.stderr.includes("Pyodide"), resultado.stderr);
    assert.equal(resultado.origen, "ejecucion-real");
    assert.equal(resultado.motor.nombre, "python");
    assert.ok(resultado.motor.version.includes("Pyodide"), resultado.motor.version);
    // La memoria no se mide en este runtime: ausente, no inventada.
    assert.equal(resultado.memoriaMBUsada, undefined);
  });

  it("un código vacío no cuelga la corrida: el mismo error honesto y la vida sigue", async () => {
    const resultado = await correrPorTransporte(
      transporteHiloPyodide(),
      solicitud({ codigo: "" }),
      "",
      true,
    );
    assert.equal(resultado.estado, "error");
    assert.ok(resultado.stderr.length > 0, resultado.stderr);
  });

  it("las solicitudes que no son de Python se rechazan sin fingir motor", async () => {
    const resultado = await ejecutarPython(solicitud({ lenguaje: "javascript" }));
    assert.equal(resultado.estado, "no-soportado");
    assert.equal(resultado.origen, "ejecucion-real");
    assert.ok(resultado.stderr.includes("Python"), resultado.stderr);
  });
});
