import type { LenguajeAlgoritmo } from "../ejecucion/catalogo.ts";
import type { Firma, TipoDato } from "./firmas.ts";

const tipos: Partial<Record<LenguajeAlgoritmo, Record<TipoDato, string>>> = {
  typescript: {
    entero: "number",
    texto: "string",
    booleano: "boolean",
    enteros: "number[]",
    textos: "string[]",
  },
  rust: {
    entero: "i32",
    texto: "String",
    booleano: "bool",
    enteros: "Vec<i32>",
    textos: "Vec<String>",
  },
  go: { entero: "int", texto: "string", booleano: "bool", enteros: "[]int", textos: "[]string" },
  c: {
    entero: "int",
    texto: "const char *",
    booleano: "bool",
    enteros: "CifraEnteros",
    textos: "CifraTextos",
  },
  cpp: {
    entero: "int",
    texto: "std::string",
    booleano: "bool",
    enteros: "std::vector<int>",
    textos: "std::vector<std::string>",
  },
  java: {
    entero: "int",
    texto: "String",
    booleano: "boolean",
    enteros: "int[]",
    textos: "String[]",
  },
  csharp: {
    entero: "int",
    texto: "string",
    booleano: "bool",
    enteros: "int[]",
    textos: "string[]",
  },
  php: { entero: "int", texto: "string", booleano: "bool", enteros: "array", textos: "array" },
};

export function plantillaAlgoritmo(lenguaje: LenguajeAlgoritmo, firma: Firma): string {
  const { nombre, parametros, devuelve } = firma;
  const tipo = (dato: TipoDato) => tipos[lenguaje]?.[dato] ?? "";
  const nombres = parametros.map(([id]) => id).join(", ");
  const prefijo = parametros.map(([id, dato]) => `${tipo(dato)} ${id}`).join(", ");
  const sufijo = parametros.map(([id, dato]) => `${id}: ${tipo(dato)}`).join(", ");
  const comentario = "// Escribe tu solución aquí.";
  switch (lenguaje) {
    case "javascript":
      return `function ${nombre}(${nombres}) {\n  ${comentario}\n}\n`;
    case "typescript":
      return `function ${nombre}(${sufijo}): ${tipo(devuelve)} {\n  throw new Error("Completa la función");\n}\n`;
    case "python":
      return `def ${nombre}(${nombres}):\n    raise NotImplementedError("Completa la función")\n`;
    case "ruby":
      return `def ${nombre}(${nombres})\n  raise "Completa la función"\nend\n`;
    case "php":
      return `<?php\nfunction ${nombre}(${prefijo.replace(/ (\w+)(?=,|$)/g, " $$$1")}): ${tipo(devuelve)} {\n  throw new RuntimeException("Completa la función");\n}\n`;
    case "rust":
      return `fn ${nombre}(${sufijo}) -> ${tipo(devuelve)} {\n    todo!("Completa la función")\n}\n`;
    case "go":
      return `package main\n\nfunc ${nombre}(${parametros.map(([id, dato]) => `${id} ${tipo(dato)}`).join(", ")}) ${tipo(devuelve)} {\n    panic("Completa la función")\n}\n`;
    case "c":
      return `#include <stdbool.h>\n#include <stddef.h>\n#include <stdlib.h>\n#include <string.h>\n\ntypedef struct { int *datos; size_t longitud; } CifraEnteros;\ntypedef struct { const char **datos; size_t longitud; } CifraTextos;\n\n${tipo(devuelve)} ${nombre}(${prefijo}) {\n    ${comentario}\n    abort();\n}\n`;
    case "cpp":
      return `#include <string>\n#include <vector>\n#include <stdexcept>\n\n${tipo(devuelve)} ${nombre}(${prefijo}) {\n    throw std::logic_error("Completa la función");\n}\n`;
    case "java":
      return `class Solution {\n    static ${tipo(devuelve)} ${nombre}(${prefijo}) {\n        throw new UnsupportedOperationException("Completa la función");\n    }\n}\n`;
    case "csharp":
      return `using System;\n\nstatic class Solution {\n    public static ${tipo(devuelve)} ${nombre}(${prefijo}) {\n        throw new NotImplementedException("Completa la función");\n    }\n}\n`;
  }
}
