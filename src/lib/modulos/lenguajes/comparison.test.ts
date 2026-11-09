import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ensayosDeLenguajes, languageIds, notasDeLenguajes } from "./index.ts";

describe("comparador de lenguajes", () => {
  it("compara el mismo problema en cada lenguaje de código del catálogo", () => {
    const idsComparables = languageIds.filter((id) => id !== "html" && id !== "css");
    const notas = new Map(notasDeLenguajes.map((nota) => [nota.id, nota]));

    for (const id of idsComparables) {
      const nota = notas.get(id);
      assert.ok(nota, `falta el conteo de palabras en ${id}`);
      assert.ok(nota.code.includes("frecuencias"), `${id} no resuelve el mismo problema`);
      assert.ok(nota.changed.length > 0, `${id} no explica qué cambia en la traducción`);
    }

    assert.equal(notas.size, idsComparables.length);
  });

  it("conserva ensayos para propiedad, memoria, tipos y concurrencia", () => {
    const ids = new Set(ensayosDeLenguajes.map((ensayo) => ensayo.id));
    for (const id of ["propiedad", "memoria", "tipos", "concurrencia"]) {
      assert.ok(ids.has(id), `falta el ensayo ${id}`);
    }
  });
});
