import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cambiarPlan,
  exportarProgreso,
  guardarPruebaNivel,
  importarProgreso,
  marcarSuperado,
  progresoInicial,
  umbralProfesional,
  versionProgreso,
} from "./progreso.ts";

describe("umbralProfesional", () => {
  it("es el valor decidido en novedades_ai.md (§8): nivel 5 de 10", () => {
    assert.equal(umbralProfesional, 5);
    assert.equal(versionProgreso, 1);
  });
});

describe("marcarSuperado", () => {
  it("un reto superado queda guardado con su nivel y su fecha", () => {
    const { progreso } = marcarSuperado(progresoInicial(), "bucles-dos", 2, false);
    const entrada = progreso.retos["bucles-dos"];
    assert.equal(entrada.estado, "superado");
    assert.equal(entrada.nivel, 2);
    assert.ok(!Number.isNaN(Date.parse(entrada.fecha)));
  });

  it("un «superado» nunca se degrada a «superado sin comprender»", () => {
    const { progreso: primera } = marcarSuperado(progresoInicial(), "bucles-dos", 2, false);
    const { progreso: segunda } = marcarSuperado(primera, "bucles-dos", 2, true);
    assert.equal(segunda.retos["bucles-dos"].estado, "superado");
  });

  it("una defensa bien respondida asciende «superado sin comprender» a «superado»", () => {
    const { progreso: primera } = marcarSuperado(progresoInicial(), "bucles-dos", 2, true);
    assert.equal(primera.retos["bucles-dos"].estado, "superado-sin-comprender");
    const { progreso: segunda } = marcarSuperado(primera, "bucles-dos", 2, false);
    assert.equal(segunda.retos["bucles-dos"].estado, "superado");
  });

  it("desbloquea el profesional exactamente al superar el umbral, no antes", () => {
    let progreso = progresoInicial();
    for (let nivel = 1; nivel < umbralProfesional; nivel++) {
      const resultado = marcarSuperado(progreso, `reto-nivel-${nivel}`, nivel, false);
      assert.equal(resultado.profesionalDesbloqueado, false, `nivel ${nivel} no debe abrirlo`);
      progreso = resultado.progreso;
    }
    const resultado = marcarSuperado(progreso, `reto-nivel-${umbralProfesional}`, umbralProfesional, false);
    assert.equal(resultado.profesionalDesbloqueado, true);
  });

  it("no desbloquea dos veces el mismo estado", () => {
    const primera = marcarSuperado(progresoInicial(), "bucles-cinco", 5, false);
    assert.equal(primera.profesionalDesbloqueado, true);
    const segunda = marcarSuperado(primera.progreso, "bucles-ocho", 8, false);
    assert.equal(segunda.profesionalDesbloqueado, false);
  });
});

describe("guardarPruebaNivel", () => {
  it("desbloquea con el nivel estimado del umbral o más", () => {
    const { progreso, profesionalDesbloqueado } = guardarPruebaNivel(
      progresoInicial(),
      ["prueba-tramo-4"],
      umbralProfesional,
    );
    assert.equal(profesionalDesbloqueado, true);
    assert.equal(progreso.pruebaNivel?.nivelEstimado, umbralProfesional);
  });

  it("con un nivel estimado por debajo del umbral no desbloquea", () => {
    const { profesionalDesbloqueado } = guardarPruebaNivel(
      progresoInicial(),
      ["prueba-tramo-3"],
      umbralProfesional - 1,
    );
    assert.equal(profesionalDesbloqueado, false);
  });
});

describe("cambiarPlan", () => {
  it("elegir el profesional sin desbloqueo se rechaza sin mover nada", () => {
    const resultado = cambiarPlan(progresoInicial(), "profesional");
    assert.ok(resultado.error);
    assert.equal(resultado.progreso.plan, null);
  });

  it("con el desbloqueo, cambiar el plan no toca el progreso de los retos", () => {
    const { progreso: conReto } = marcarSuperado(progresoInicial(), "bucles-dos", 5, false);
    const { progreso, error } = cambiarPlan(conReto, "profesional");
    assert.ok(!error);
    assert.equal(progreso.plan, "profesional");
    assert.ok(progreso.retos["bucles-dos"], "el progreso de retos se pierde al cambiar de plan");
  });

  it("volver a «desde cero» siempre vale", () => {
    const { progreso: abierto } = marcarSuperado(progresoInicial(), "bucles-cinco", 5, false);
    const { progreso: conProfesional } = cambiarPlan(abierto, "profesional");
    const { progreso: deVuelta, error } = cambiarPlan(conProfesional, "desde-cero");
    assert.ok(!error);
    assert.equal(deVuelta.plan, "desde-cero");
  });
});

describe("exportarProgreso / importarProgreso", () => {
  const construirProgreso = () => {
    const { progreso: conReto } = marcarSuperado(progresoInicial(), "bucles-dos", 2, false);
    const { progreso: conOtro } = marcarSuperado(conReto, "cadenas-ocho", 8, true);
    const { progreso } = guardarPruebaNivel(conOtro, ["prueba-1", "prueba-2"], 3);
    return { ...progreso, plan: "desde-cero" as const, conceptosRepaso: ["bucle"] };
  };

  it("exporta e importa sin pérdida", () => {
    const original = construirProgreso();
    const texto = exportarProgreso(original);
    const importado = importarProgreso(texto);
    assert.equal(importado.ok, true);
    if (importado.ok) assert.deepEqual(importado.progreso, original);
  });

  it("rechaza JSON roto y ficheros de otra forma sin cargar nada", () => {
    assert.equal(importarProgreso("no es json").ok, false);
    assert.equal(importarProgreso(JSON.stringify({ hola: 1 })).ok, false);
    assert.equal(importarProgreso("null").ok, false);
  });

  it("rechaza un progreso de otra versión en lugar de inventarse la lectura", () => {
    const original = construirProgreso() as unknown as Record<string, unknown>;
    assert.equal(importarProgreso(JSON.stringify({ ...original, version: 99 })).ok, false);
  });

  it("una entrada de reto insólita en la importación estricta tumba el fichero entero", () => {
    const original = construirProgreso() as unknown as Record<string, unknown>;
    const retos = { ...(original.retos as Record<string, unknown>), roto: { estado: "ganado" } };
    assert.equal(importarProgreso(JSON.stringify({ ...original, retos })).ok, false);
  });
});
