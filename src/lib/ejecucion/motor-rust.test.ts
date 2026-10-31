import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { ejecutarRustLocal, fuentesProyectoRust } from "./motor-rust.ts";
import { limitesDefecto } from "./limites.ts";
import type { RunRequest } from "./tipos.ts";

/**
 * El modo local de Rust corre solo donde hay toolchain y donde el desarrollador lo encendió
 * con CIFRA_RUST_LOCAL=1. Sin llave, el resultado es `no-soportado`: eso es lo que se prueba.
 * Donde hay cargo disponible (la máquina del desarrollador), la prueba real compila y corre;
 * si no lo hay, se marca como saltada — nunca se simula un resultado.
 */

const llaveGuardada = process.env.CIFRA_RUST_LOCAL;
const hayCargo =
  spawnSync("cargo", ["--version"], { encoding: "utf8" }).status === 0;

function pedido(extra: Partial<RunRequest> = {}): RunRequest {
  return {
    lenguaje: "rust",
    codigo: 'fn main() {\n    println!("hola desde Rust");\n}\n',
    limites: limitesDefecto(),
    ...extra,
  };
}

after(() => {
  if (llaveGuardada === undefined) delete process.env.CIFRA_RUST_LOCAL;
  else process.env.CIFRA_RUST_LOCAL = llaveGuardada;
});

describe("el motor local de Rust sin encender", () => {
  it("devuelve no-soportado cuando nadie encendió la llave de desarrollo", async () => {
    delete process.env.CIFRA_RUST_LOCAL;
    const resultado = await ejecutarRustLocal(pedido());
    assert.equal(resultado.estado, "no-soportado");
    assert.equal(resultado.origen, "ejecucion-real");
    assert.equal(resultado.motor.nombre, "rust");
    assert.ok(resultado.stderr.includes("CIFRA_RUST_LOCAL"), resultado.stderr);
  });

  it("el aviso dice el porqué: el aislamiento local es débil y solo el desarrollador lo usa", async () => {
    delete process.env.CIFRA_RUST_LOCAL;
    const resultado = await ejecutarRustLocal(pedido());
    assert.ok(resultado.stderr.includes("desarrollador"), resultado.stderr);
    assert.ok(resultado.stderr.includes("apagada"), resultado.stderr);
  });
});

describe("el motor local de Rust con la llave encendida y toolchain", () => {
  it(
    "compila y corre un programa feliz con su salida y su sello",
    { skip: hayCargo ? false : "no hay cargo en esta máquina" },
    async () => {
      process.env.CIFRA_RUST_LOCAL = "1";
      const resultado = await ejecutarRustLocal(pedido());
      assert.equal(resultado.estado, "ok");
      assert.equal(resultado.stdout, "hola desde Rust\n");
      assert.equal(resultado.origen, "ejecucion-real");
      assert.equal(resultado.motor.nombre, "rust");
      assert.equal(resultado.memoriaMBUsada, undefined);
      assert.equal(resultado.traza, undefined);
    },
  );

  it(
    "un programa que no compila queda en error con lo que dijo el compilador",
    { skip: hayCargo ? false : "no hay cargo en esta máquina" },
    async () => {
      process.env.CIFRA_RUST_LOCAL = "1";
      const resultado = await ejecutarRustLocal(pedido({ codigo: "fn main() { sin_cerrar\n" }));
      assert.equal(resultado.estado, "error");
      assert.ok(resultado.stderr.length > 0, resultado.stderr);
      assert.ok(resultado.stderr.toLowerCase().includes("error"), resultado.stderr);
    },
  );
});
