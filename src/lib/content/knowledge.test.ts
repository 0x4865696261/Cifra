import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { definiciones } from "../retos/retos.ts";
import { definicionesIncidentes } from "../incidentes/paquetes.ts";
import { mathTopics } from "./math.ts";
import { concepts, recommendNextConcept, threads, validateKnowledgeGraph } from "./concepts.ts";

describe("la red de conocimiento de la 0.7", () => {
  it("expone relaciones tipificadas y todas apuntan a conceptos existentes", () => {
    const slugs = new Set(concepts.map(({ slug }) => slug));
    const validTypes = new Set(["adelante", "atras", "paralelo"]);

    for (const concept of concepts) {
      assert.ok(concept.relaciones.length > 0, `${concept.slug} está huérfano`);
      for (const relation of concept.relaciones) {
        assert.ok(slugs.has(relation.slug), `${concept.slug} apunta a un concepto ausente`);
        assert.ok(validTypes.has(relation.tipo), `${concept.slug} tiene una relación sin tipo`);
      }
    }
  });

  it("incluye los hilos nuevos de arquitectura, distribuidos, datos, redes, seguridad y pruebas", () => {
    const ids = new Set(threads.map(({ id }) => id));
    for (const id of [
      "arquitectura",
      "distribuidos",
      "bases-de-datos",
      "redes",
      "seguridad",
      "pruebas",
    ]) {
      assert.ok(ids.has(id), `falta el hilo ${id}`);
    }
  });

  it("conecta todos los puentes matemáticos con algoritmo y lenguaje", () => {
    for (const topic of mathTopics) {
      const targets = new Set(topic.relaciones.map(({ slug }) => slug));
      assert.ok(targets.has("algoritmo"), `${topic.slug} no enlaza con algoritmo`);
      assert.ok(targets.has("lenguaje-programacion"), `${topic.slug} no enlaza con lenguaje`);
    }
  });

  it("enlaza cada reto y paquete con conceptos existentes", () => {
    const slugs = new Set(concepts.map(({ slug }) => slug));

    for (const reto of definiciones) {
      assert.ok(reto.conceptos.length > 0, `${reto.id} no tiene conceptos enlazados`);
      for (const slug of reto.conceptos) assert.ok(slugs.has(slug), `${reto.id} apunta a ${slug}`);
    }

    for (const paquete of definicionesIncidentes) {
      assert.ok(paquete.conceptos.length > 0, `${paquete.id} no tiene conceptos enlazados`);
      for (const slug of paquete.conceptos)
        assert.ok(slugs.has(slug), `${paquete.id} apunta a ${slug}`);
    }
  });

  it("ofrece una comprobación automática sin conceptos huérfanos", () => {
    assert.deepEqual(validateKnowledgeGraph(), []);
  });

  it("recomienda según el plan, el progreso y los conceptos difíciles", () => {
    const desdeCero = recommendNextConcept([], [], "desde-cero");
    assert.equal(desdeCero?.concept.slug, "variable");

    const yaSe = recommendNextConcept([], [], "ya-se");
    assert.equal(yaSe?.concept.slug, "memoria");

    const sigueHilo = recommendNextConcept(["variable", "arreglo"], [], "desde-cero");
    assert.equal(sigueHilo?.concept.slug, "diccionario");

    const repaso = recommendNextConcept(["variable"], ["variable"], "desde-cero");
    assert.equal(repaso?.concept.slug, "variable");
    assert.equal(repaso?.motivo, "repaso");
  });
});
