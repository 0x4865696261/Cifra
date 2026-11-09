import assert from "node:assert/strict";
import { test } from "node:test";
import { comprobarCifra, MAXIMO_CODIGO_CIFRA } from "./compiler.ts";

test("acepta funciones, listas y valores acotados", () => {
  assert.deepEqual(
    comprobarCifra(`
function precio(valor: number | null): number {
  if (valor === null) { return 0; }
  return valor;
}
const lista: number[] = [5, 10];
const total = precio(lista.length);
`),
    [],
  );
});

test("señala sintaxis, nombres y tipos con ubicación", () => {
  assert.equal(comprobarCifra("const = 4;")[0]?.regla, "Sintaxis");
  const [nombre] = comprobarCifra("const n = 1;\nconst total = otro;");
  assert.equal(nombre?.regla, "Nombre desconocido");
  assert.equal(nombre?.linea, 2);
  assert.equal(nombre?.columna, 15);
  assert.equal(comprobarCifra('const total: number = "mucho";')[0]?.regla, "Tipos compatibles");
});

test("comprueba valores ausentes y ramas sin retorno", () => {
  assert.equal(
    comprobarCifra("function f(n: number | null): number { return n + 1; }")[0]?.regla,
    "Valor presente",
  );
  assert.equal(
    comprobarCifra("function f(ok: boolean): number { if (ok) { return 1; } }")[0]?.regla,
    "Retorno completo",
  );
  assert.notEqual(
    comprobarCifra("const lista: number[] = []; const n: number = lista[0];").length,
    0,
  );
});

test("rechaza fuentes vacías, excesivas, construcciones externas y directivas", () => {
  for (const codigo of [
    "// Solo un comentario",
    " ".repeat(MAXIMO_CODIGO_CIFRA + 1),
    'import fs from "node:fs";',
    "const n = 1 as any;",
    "while (true) {}",
    '// @ts-ignore\nconst n: number = "texto";',
    '/// <reference path="otra.ts" />\nconst n = 1;',
    "function f(x) { return x; }",
  ]) {
    assert.notEqual(comprobarCifra(codigo).length, 0, codigo);
  }
});
