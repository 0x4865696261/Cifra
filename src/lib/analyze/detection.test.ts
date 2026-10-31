import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectLanguage } from "./detection.ts";

describe("detectLanguage", () => {
  it("apunta a python con señales del código y del mensaje", () => {
    const deteccion = detectLanguage(
      "def media(numeros):\n    return sum(numeros) / len(numeros)\n\nprint(media([]))",
      'Traceback (most recent call last):\n  File "media.py", line 5, in <module>\nZeroDivisionError: division by zero',
    );
    assert.deepEqual(deteccion, { sugerencia: "python", segura: true });
  });

  it("apunta a javascript cuando las señales lo sostienen", () => {
    const deteccion = detectLanguage(
      "const media = (numeros) => {\n  return numeros.reduce((a, n) => a + n, 0) / numeros.length;\n};\nconsole.log(media([]));",
      "at media (ejemplo/media.js:3:24)\n    at ejemplo/media.js:5:13",
    );
    assert.deepEqual(deteccion, { sugerencia: "javascript", segura: true });
  });

  it("apunta a rust con el código de error del compilador", () => {
    const deteccion = detectLanguage(
      'fn main() {\n    let v = vec![1];\n    println!("{}", v[3]);\n}',
      "thread 'main' panicked at src/main.rs:3:22:\nindex out of bounds: the len is 1 but the index is 3",
    );
    assert.deepEqual(deteccion, { sugerencia: "rust", segura: true });
  });

  it("declara que no se puede asegurar cuando las señales empatan", () => {
    const deteccion = detectLanguage(
      "",
      "line 12: algo no cuadra",
    );
    assert.deepEqual(deteccion, { sugerencia: null, segura: false });
  });

  it("reconoce el lenguaje más probable pero lo marca como no seguro si el margen es fino", () => {
    const deteccion = detectLanguage(
      "print('hola')",
      "",
    );
    assert.equal(deteccion.sugerencia, "python");
    assert.equal(deteccion.segura, false);
  });

  it("no sugiere nada sin señales", () => {
    const deteccion = detectLanguage("", "");
    assert.deepEqual(deteccion, { sugerencia: null, segura: false });
  });
});
