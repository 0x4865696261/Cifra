import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyze } from "./structure.ts";
import { selectSkills } from "../skills/select.ts";
import { parseExplanation } from "../ai/parse.ts";

describe("analyze", () => {
  it("ve un bucle dentro de otro en Python", () => {
    const result = analyze(
      `def parejas(nombres):
    resultado = []
    for i in range(len(nombres)):
        for j in range(len(nombres)):
            resultado.append((nombres[i], nombres[j]))
    return resultado
`,
      "python",
    );
    assert.equal(result.nestedLoops, true);
    assert.match(result.facts.map((fact) => fact.text).join(" "), /dentro/);
  });

  it("marca una llamada dentro del propio cuerpo", () => {
    const result = analyze(
      `def subir(n):
    if n == 0:
        return 0
    return n + subir(n - 1)
`,
      "python",
    );
    assert.equal(result.recursion, true);
  });

  it("encuentra la función y el bucle en JavaScript", () => {
    const result = analyze(
      `function media(numeros) {
  let suma = 0;
  for (const n of numeros) {
    suma += n;
  }
  return suma / numeros.length;
}
`,
      "javascript",
    );
    const text = result.facts.map((fact) => fact.text).join(" ");
    assert.match(text, /media/);
    assert.match(text, /bucle/i);
    assert.equal(result.nestedLoops, false);
  });
});

describe("selectSkills", () => {
  it("añade depuración cuando la pregunta habla de un fallo", () => {
    const picks = selectSkills({
      kind: "codigo",
      level: "practica",
      language: "javascript",
      question: "¿Qué pasa si la lista está vacía y cómo vería el error?",
      nestedLoops: false,
      recursion: false,
    });
    assert.ok(picks.some((pick) => pick.id === "depuracion"));
    assert.ok(picks.some((pick) => pick.id === "pedagogia" && pick.locked));
  });

  it("en un puente matemático bloquea pedagogía, matemáticas y algoritmos", () => {
    const picks = selectSkills({
      kind: "matematicas",
      level: "empezando",
      language: "python",
      question: "",
      nestedLoops: false,
      recursion: false,
    });
    for (const id of ["pedagogia", "matematicas", "algoritmos"]) {
      assert.equal(picks.find((pick) => pick.id === id)?.locked, true);
    }
  });
});

describe("parseExplanation", () => {
  it("acepta JSON con valla", () => {
    const parsed = parseExplanation(
      '```json\n{"summary":"Suma.","walkthrough":[],"decisions":[],"skipped":"","checked":["hay un bucle"],"inferred":[],"askNext":"¿Y si está vacía?"}\n```',
    );
    assert.equal(parsed?.summary, "Suma.");
    assert.deepEqual(parsed?.checked, ["hay un bucle"]);
  });

  it("rechaza texto que no es una explicación", () => {
    assert.equal(parseExplanation("no es json"), null);
  });
});
