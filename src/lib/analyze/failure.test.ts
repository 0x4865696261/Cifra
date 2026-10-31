import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeFailure } from "./failure.ts";

describe("analyzeFailure: tabla de tipos", () => {
  it("JavaScript: Cannot read properties of undefined/null es valor-nulo", () => {
    const report = analyzeFailure(
      "const a = null;\nconsole.log(a.length);",
      "TypeError: Cannot read properties of null (reading 'length')",
      "javascript",
    );
    assert.equal(report.mensaje.tipo, "valor-nulo");
  });

  it("JavaScript: x is not defined es nombre-inexistente", () => {
    const report = analyzeFailure(
      "console.log(radio);",
      "ReferenceError: radio is not defined",
      "javascript",
    );
    assert.equal(report.mensaje.tipo, "nombre-inexistente");
  });

  it("JavaScript: x is not a function es metodo-inexistente", () => {
    const report = analyzeFailure(
      "const n = 3;\nn.calcular();",
      "TypeError: n.calcular is not a function",
      "javascript",
    );
    assert.equal(report.mensaje.tipo, "metodo-inexistente");
  });

  it("JavaScript: Unexpected token y SyntaxError son sintaxis", () => {
    const token = analyzeFailure(
      "if (a { }",
      "SyntaxError: Unexpected token '{'",
      "javascript",
    );
    const sintaxis = analyzeFailure(
      "const x = ;",
      "SyntaxError: Unexpected end of input",
      "javascript",
    );
    assert.equal(token.mensaje.tipo, "sintaxis");
    assert.equal(sintaxis.mensaje.tipo, "sintaxis");
  });

  it("Python: NameError es nombre-inexistente", () => {
    const report = analyzeFailure(
      "print(cantidad)",
      "NameError: name 'cantidad' is not defined",
      "python",
    );
    assert.equal(report.mensaje.tipo, "nombre-inexistente");
  });

  it("Python: IndexError y KeyError son limite-coleccion", () => {
    const index = analyzeFailure(
      "v = [1, 2]\nprint(v[5])",
      "IndexError: list index out of range",
      "python",
    );
    const key = analyzeFailure(
      "catalogo = {}",
      "KeyError: 'minimo'",
      "python",
    );
    assert.equal(index.mensaje.tipo, "limite-coleccion");
    assert.equal(key.mensaje.tipo, "limite-coleccion");
  });

  it("Python: TypeError es tipo", () => {
    const report = analyzeFailure(
      "total = '3' + 4",
      "TypeError: can only concatenate str (not \"int\") to str",
      "python",
    );
    assert.equal(report.mensaje.tipo, "tipo");
  });

  it("Python: AttributeError sobre NoneType es valor-nulo", () => {
    const report = analyzeFailure(
      "nombre = None\nnombre.upper()",
      "AttributeError: 'NoneType' object has no attribute 'upper'",
      "python",
    );
    assert.equal(report.mensaje.tipo, "valor-nulo");
  });

  it("Python: ZeroDivisionError es aritmetica", () => {
    const report = analyzeFailure(
      "media = suma / total",
      "ZeroDivisionError: division by zero",
      "python",
    );
    assert.equal(report.mensaje.tipo, "aritmetica");
  });

  it("Python: IndentationError y SyntaxError son sintaxis", () => {
    const indentation = analyzeFailure(
      "def f():\nx = 1",
      "IndentationError: expected an indented block",
      "python",
    );
    const syntax = analyzeFailure(
      "def f(:\n    pass",
      "SyntaxError: invalid syntax",
      "python",
    );
    assert.equal(indentation.mensaje.tipo, "sintaxis");
    assert.equal(syntax.mensaje.tipo, "sintaxis");
  });

  it("Python: ModuleNotFoundError e ImportError son importacion", () => {
    const modulo = analyzeFailure(
      "import estadistica",
      "ModuleNotFoundError: No module named 'estadistica'",
      "python",
    );
    const importacion = analyzeFailure(
      "from math import raiz",
      "ImportError: cannot import name 'raiz' from 'math'",
      "python",
    );
    assert.equal(modulo.mensaje.tipo, "importacion");
    assert.equal(importacion.mensaje.tipo, "importacion");
  });

  it("Rust: E0425 es nombre-inexistente", () => {
    const report = analyzeFailure(
      "fn main() { let r = radio; }",
      "error[E0425]: cannot find value `radio` in this scope",
      "rust",
    );
    assert.equal(report.mensaje.tipo, "nombre-inexistente");
  });

  it("Rust: E0308 es tipo", () => {
    const report = analyzeFailure(
      "fn main() { let n: i32 = \"x\"; }",
      "error[E0308]: mismatched types\n --> src/main.rs:2:21",
      "rust",
    );
    assert.equal(report.mensaje.tipo, "tipo");
  });

  it("Rust: E0382, E0499 y E0502 son prestamo-propiedad", () => {
    const movido = analyzeFailure(
      "fn main() {}",
      "error[E0382]: use of moved value `p`",
      "rust",
    );
    const dosPrestamos = analyzeFailure(
      "fn main() {}",
      "error[E0499]: cannot borrow `v` as mutable more than once at a time",
      "rust",
    );
    const prestamoYMutable = analyzeFailure(
      "fn main() {}",
      "error[E0502]: cannot borrow `s` as immutable because it is also borrowed as mutable",
      "rust",
    );
    assert.equal(movido.mensaje.tipo, "prestamo-propiedad");
    assert.equal(dosPrestamos.mensaje.tipo, "prestamo-propiedad");
    assert.equal(prestamoYMutable.mensaje.tipo, "prestamo-propiedad");
  });

  it("Rust: E0599 es metodo-inexistente", () => {
    const report = analyzeFailure(
      "fn main() {}",
      "error[E0599]: no method named `empujar` found for struct `Vec<i32>`",
      "rust",
    );
    assert.equal(report.mensaje.tipo, "metodo-inexistente");
  });

  it("Rust: index out of bounds en pánico es limite-coleccion", () => {
    const report = analyzeFailure(
      "fn main() { let v = vec![1]; println!(\"{}\", v[3]); }",
      "thread 'main' panicked at src/main.rs:2:31:\nindex out of bounds: the len is 1 but the index is 3",
      "rust",
    );
    assert.equal(report.mensaje.tipo, "limite-coleccion");
  });

  it("Rust: unwrap sobre None es valor-nulo", () => {
    const report = analyzeFailure(
      "fn main() { let n = Option::None; n.unwrap(); }",
      "thread 'main' panicked at src/main.rs:2:10:\ncalled `Option::unwrap()` on a `None` value",
      "rust",
    );
    assert.equal(report.mensaje.tipo, "valor-nulo");
  });

  it("un mensaje que no encaja en ninguna regla queda como desconocido", () => {
    const report = analyzeFailure(
      "hacer algo",
      "Algo rarísimo ha pasado y no hay más pistas.",
      "javascript",
    );
    assert.equal(report.mensaje.tipo, "desconocido");
  });

  it("un lenguaje sin reglas no fuerza un tipo", () => {
    const report = analyzeFailure(
      "SELECT * FROM usuarios;",
      "ERROR: syntax error at or near \"CHO\"",
      "sql",
    );
    assert.equal(report.mensaje.tipo, "desconocido");
  });
});

describe("analyzeFailure: líneas nombradas", () => {
  const codigo = Array.from({ length: 30 }, (_, i) => `// línea ${i + 1}`).join("\n");

  it("extrae el formato «línea 12»", () => {
    const report = analyzeFailure(codigo, "Fallo en línea 12", "python");
    assert.deepEqual(report.mensaje.lineasNombradas, [12]);
  });

  it("extrae el formato «, line 12» de un traceback", () => {
    const report = analyzeFailure(
      codigo,
      'Traceback (most recent call last):\n  File "ejemplo/f.py", line 12, in <module>\nKeyError: \'x\'',
      "python",
    );
    assert.deepEqual(report.mensaje.lineasNombradas, [12]);
  });

  it("extrae el formato «:12:5» de una ubicación con columna", () => {
    const report = analyzeFailure(
      codigo,
      " --> src/main.rs:12:5",
      "rust",
    );
    assert.deepEqual(report.mensaje.lineasNombradas, [12]);
  });

  it("extrae varios números y los ordena sin repetir", () => {
    const report = analyzeFailure(
      codigo,
      "Fallo en línea 12 y en línea 5; revisa también 12",
      "python",
    );
    assert.deepEqual(report.mensaje.lineasNombradas, [5, 12]);
  });
});

describe("analyzeFailure: fragmento", () => {
  it("numera el código y marca las líneas nombradas", () => {
    const report = analyzeFailure(
      "const a = 1;\nconst b = [2];\nconsole.log(b.length);",
      "at ejemplo.js:2:1",
      "javascript",
    );
    assert.equal(report.fragmento.length, 3);
    assert.deepEqual(
      report.fragmento.map((linea) => linea.n),
      [1, 2, 3],
    );
    assert.equal(report.fragmento[0].marcada, false);
    assert.equal(report.fragmento[1].marcada, true);
    assert.equal(report.fragmento[1].texto, "const b = [2];");
  });

  it("una línea nombrada que no existe en el código no se inventa ni rompe nada", () => {
    const report = analyzeFailure(
      "const a = 1;",
      "Fallo en línea 40",
      "javascript",
    );
    assert.equal(report.fragmento.length, 1);
    assert.equal(
      report.fragmento.some((linea) => linea.n === 40),
      false,
    );
  });
});

describe("analyzeFailure: identificadores citados", () => {
  it("recoge los nombres entre comillas del mensaje y deja fuera los números", () => {
    const report = analyzeFailure(
      "media(lista)",
      "KeyError: 'minimo' en \"ejemplo.py\", línea '3'",
      "python",
    );
    assert.ok(report.mensaje.identificadoresCitados.includes("minimo"));
    assert.ok(report.mensaje.identificadoresCitados.includes("ejemplo.py"));
    assert.equal(report.mensaje.identificadoresCitados.includes("3"), false);
  });

  it("reconoce los identificadores de un mensaje de Rust con acentos graves", () => {
    const report = analyzeFailure(
      "fn main() { let r = radio; }",
      "error[E0425]: cannot find value `radio` in this scope",
      "rust",
    );
    assert.ok(report.mensaje.identificadoresCitados.includes("radio"));
  });
});
