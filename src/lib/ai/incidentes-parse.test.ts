/**
 * Las pruebas del contrato del modelo en los incidentes (0.5.D/E): la redacción es forma
 * válida o nada; el modelo no puede meter juicio ni cambiar un estado; y las líneas que se
 * le enseñan son exactamente la comparación, sin `respuestaEsperada` dentro.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lineasDeComparacion,
  parseRedaccion,
  redactarComparacionLocal,
  TOPE_PARRAFOS,
  TOPE_TEXTO_PARAFO,
  type RedaccionComparacion,
} from "./incidentes-parse.ts";
import type { AnalizoIncidente, EvaluacionIncidente, IncidentSpec } from "@/lib/incidentes/tipos";

const evaluacion: EvaluacionIncidente = {
  campos: {
    causa: "acertado",
    impacto: "deducido-sin-evidencia",
    correccion: "pasado-por-alto",
    comoDetectarlo: "acertado",
  },
  evidencia: [
    {
      cita: { ruta: "logs/app.log", linea: 1, afirmacion: "falta el índice" },
      estado: "sostenida",
      detalle: "línea 1: «10:01:03 ERROR falta el índice»",
    },
    {
      cita: { ruta: "app/viejo.js", afirmacion: "la cola se vació" },
      estado: "no-existe",
      detalle: "la ruta no existe en el paquete: app/viejo.js",
    },
  ],
  pasadoPorAlto: ["app/servicio.js:const usuarios = dameTodos()"],
};

function redaccionValida(): RedaccionComparacion {
  return {
    parrafos: [
      {
        texto: "Tu causa queda sostenida por el registro: la comparación la marca como acertada.",
        procedencia: "comprobado-regla",
      },
      {
        texto: "A mi juicio el título del incidente puede decir menos jerga, si tuvieras que salir a contarlo.",
        procedencia: "opinion",
      },
    ],
  };
}

test("una redacción correcta pasa y conserva procedencia y orden", () => {
  const cruda = redaccionValida();
  const parseada = parseRedaccion(JSON.stringify(cruda));
  assert.notEqual(parseada, null);
  assert.deepEqual(parseada, cruda);
});

test("un bloque vallado (```json) y ruido alrededor no la tumban", () => {
  const cruda = redaccionValida();
  const conRuido = `Puedes ignorar esto. Adjunto:\n\`\`\`json\n${JSON.stringify(cruda)}\n\`\`\`\nUn saludo.`;
  const parseada = parseRedaccion(conRuido);
  assert.notEqual(parseada, null);
  if (parseada) assert.equal(parseada.parrafos.length, 2);
});

test("sin key parrafos, con vacío o con más párrafos de la cuenta: se rechaza", () => {
  const cruda = redaccionValida();
  assert.equal(parseRedaccion(JSON.stringify({ redaccion: cruda.parrafos })), null);
  assert.equal(parseRedaccion(JSON.stringify({ parrafos: [] })), null);
  const demasiados = {
    parrafos: Array.from({ length: TOPE_PARRAFOS + 1 }, () => cruda.parrafos[0]),
  };
  assert.equal(parseRedaccion(JSON.stringify(demasiados)), null);
});

test("un texto vacío, demasiado largo o sin objeto por párrafo se rechaza", () => {
  assert.equal(parseRedaccion(JSON.stringify({ parrafos: [{ texto: "  ", procedencia: "opinion" }] })), null);
  assert.equal(
    parseRedaccion(JSON.stringify({ parrafos: [{ texto: "v".repeat(TOPE_TEXTO_PARAFO + 1), procedencia: "opinion" }] })),
    null,
  );
  assert.equal(parseRedaccion(JSON.stringify({ parrafos: ["un párrafo en texto"] })), null);
});

test("una procedencia que no sea comprobado-regla u opinion se rechaza entera", () => {
  const lavada = {
    parrafos: [{ texto: "lo que diga", procedencia: "comprobado-ejecucion" }],
  };
  assert.equal(parseRedaccion(JSON.stringify(lavada)), null);
  const sinSello = {
    parrafos: [{ texto: "lo que diga" }],
  };
  assert.equal(parseRedaccion(JSON.stringify(sinSello)), null);
});

test("una respuesta del modelo que trae su propio veredicto no es una redacción válida", () => {
  const cruda = redaccionValida();
  const conJuicio = { ...cruda, calificacion: 7 };
  assert.equal(parseRedaccion(JSON.stringify(conJuicio)), null);
  const verdict = { parrafos: cruda.parrafos, Veredicto: "el análisis es válido" };
  assert.equal(parseRedaccion(JSON.stringify(verdict)), null);
  const conRespuesta = { parrafos: cruda.parrafos, "respuesta esperada": { causa: "..." } };
  assert.equal(parseRedaccion(JSON.stringify(conRespuesta)), null);
});

test("JSON roto o sin objeto devuelve null, nunca media respuesta", () => {
  assert.equal(parseRedaccion("no es json"), null);
  assert.equal(parseRedaccion("null"), null);
  assert.equal(parseRedaccion("{ parrafos: ["), null);
});

test("la vía de servidor expone error útil, no media respuesta del modelo", () => {
  const resultado = redactarComparacionLocal("no es json");
  assert.equal(resultado.ok, false);
  if (!resultado.ok) {
    assert.ok(resultado.error.length > 0);
    assert.equal(resultado.error.includes("no en la forma esperada"), true);
  }
  const buenas = redactarComparacionLocal(JSON.stringify(redaccionValida()));
  assert.equal(buenas.ok, true);
  if (buenas.ok) assert.equal(buenas.redaccion.parrafos.length, 2);
});

test("las líneas para el modelo son la comparación: estados, citas y puntos pasados por alto", () => {
  const lineas = lineasDeComparacion(evaluacion, {
    quePaso: "una causa con su evidencia",
    impacto: "un impacto sin nada detrás",
    correccion: "",
    comoDetectarlo: "una prueba que lo pisaba",
  });
  const unidas = lineas.join("\n");
  assert.equal(unidas.includes("campo qué pasó: acertado (sostenido por evidencia)"), true);
  assert.equal(unidas.includes("campo impacto: deducido sin evidencia"), true);
  assert.equal(unidas.includes("campo corrección: pasado por alto"), true);
  assert.equal(unidas.includes("Quedó vacío."), true);
  assert.equal(unidas.includes("cita de logs/app.log línea 1: sostenida"), true);
  assert.equal(unidas.includes("cita de app/viejo.js: no existe en el paquete"), true);
  assert.equal(unidas.includes("- llamado y sin cubrir: app/servicio.js:const usuarios = dameTodos()"), true);
});
