/**
 * Las pruebas de la evaluación estructurada (0.5.D): el análisis de ejemplo correcto se evalúa
 * como acertado; una causa plausible pero sin evidencia queda «deducido sin evidencia»; citar
 * una línea que no dice lo que se afirma se detecta; y lo que ninguna cita sostenida cubre
 * queda pasado por alto. Todo es una regla local y verificable, sin red.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluar, laLineaDice, palabrasDe, puntoEsperado, textoPlano } from "./evaluar.ts";
import type { AnalizoIncidente, IncidentSpec } from "./tipos.ts";

const paquete: IncidentSpec = {
  id: "ejemplo-evaluacion",
  titulo: "Evaluación de prueba",
  nivel: 3,
  familia: "nombre-inexistente",
  sintoma: "una petición llega sin encontrar al usuario",
  ficheros: {
    "logs/app.log": "10:01:03 ERROR falta el índice de usuarios\n",
    "app/servicio.js": [
      "export function atiende(pedido) {",
      "  const usuarios = dameTodos();",
      "  return usuarios[pedido.indice - 1];",
      "}",
    ].join("\n"),
  },
  respuestaEsperada: {
    causa: "un índice de usuario que no existe en la lista",
    evidencia: [
      "logs/app.log:ERROR falta el índice de usuarios",
      "app/servicio.js:const usuarios = dameTodos();",
    ],
    impacto: "un endpoint entero falla para ese usuario",
    correccion: "validar el índice antes de usarlo",
    comoDetectarlo: "una prueba con el valor límite del índice",
  },
  conceptos: [],
};

const analizoCorrecto: AnalizoIncidente = {
  idPaquete: "ejemplo-evaluacion",
  quePaso: "un índice de usuario que no existe en la lista",
  evidencia: [
    { ruta: "logs/app.log", linea: 1, afirmacion: "ERROR falta el índice de usuarios" },
    {
      ruta: "app/servicio.js",
      linea: 2,
      afirmacion: "const usuarios = dameTodos();",
    },
  ],
  impacto: "un endpoint entero falla para ese usuario",
  correccion: "validar el índice antes de usarlo",
  comoDetectarlo: "una prueba con el valor límite del índice",
};

test("el análisis de ejemplo correcto de un paquete se evalúa como acertado", () => {
  const juicio = evaluar(paquete, analizoCorrecto);
  for (const campo of ["causa", "impacto", "correccion", "comoDetectarlo"] as const) {
    assert.equal(juicio.campos[campo], "acertado", campo);
  }
  for (const evidencia of juicio.evidencia) {
    assert.equal(evidencia.estado, "sostenida", evidencia.detalle);
  }
  assert.deepEqual(juicio.pasadoPorAlto, []);
});

test("la misma idea con otras palabras sigue acertada si la evidencia la sostiene", () => {
  const juicio = evaluar(paquete, {
    ...analizoCorrecto,
    quePaso: "la persona busca un usuario que no existe: el índice se sale de la lista",
    impacto: "toda la petición falla para ese usuario y este endpoint no responde",
  });
  assert.equal(juicio.campos.causa, "acertado");
  assert.equal(juicio.campos.impacto, "acertado");
});

test("una causa plausible pero sin evidencia queda deducido sin evidencia", () => {
  const sinCitas: AnalizoIncidente = {
    ...analizoCorrecto,
    evidencia: [],
  };
  const juicio = evaluar(paquete, sinCitas);
  assert.equal(juicio.campos.causa, "deducido-sin-evidencia");
  assert.equal(juicio.campos.impacto, "deducido-sin-evidencia");
});

test("una causa que suena bien pero no es la esperada queda pasado por alto", () => {
  const juicio = evaluar(paquete, {
    ...analizoCorrecto,
    quePaso: "la base de datos se saturó por una consulta lenta",
  });
  assert.equal(juicio.campos.causa, "pasado-por-alto");
});

test("un campo vacío queda pasado por alto, nunca diferencia un error por el silencio", () => {
  const juicio = evaluar(paquete, {
    ...analizoCorrecto,
    correccion: "",
  });
  assert.equal(juicio.campos.correccion, "pasado-por-alto");
});

test("citar una ruta que no existe se marca, y una que es directorio no sostiene nada", () => {
  const juicio = evaluar(paquete, {
    ...analizoCorrecto,
    evidencia: [
      { ruta: "logs/inexistente.log", afirmacion: "falta el índice de usuarios" },
      { ruta: "logs", afirmacion: "falta el índice de usuarios" },
    ],
  });
  assert.deepEqual(
    juicio.evidencia.map((j) => j.estado),
    ["no-existe", "no-sostiene"],
  );
  // y sin citas sostenidas, los campos encajantes quedan deducidos
  assert.equal(juicio.campos.causa, "deducido-sin-evidencia");
});

test("citar una línea que no dice lo que se afirma se detecta", () => {
  const juicio = evaluar(paquete, {
    ...analizoCorrecto,
    evidencia: [
      { ruta: "logs/app.log", linea: 1, afirmacion: "el disco se llenó y la cola cayó" },
    ],
  });
  assert.equal(juicio.evidencia[0].estado, "no-sostiene");
  assert.deepEqual(juicio.pasadoPorAlto.length, 2);
});

test("la cita fuera de la línea pero dentro de la tolerancia sigue sostenida", () => {
  const ficheros = { "notas.txt": "arriba\n10:01:03 ERROR falta el índice de usuarios\n" };
  const juicio = evaluar(
    { ...paquete, ficheros, respuestaEsperada: { ...paquete.respuestaEsperada, evidencia: ["notas.txt"] } },
    {
      ...analizoCorrecto,
      evidencia: [{ ruta: "notas.txt", linea: 4, afirmacion: "ERROR falta el índice de usuarios" }],
    },
  );
  assert.equal(juicio.evidencia[0].estado, "sostenida");
});

test("un punto esperado que ninguna cita sostenida cubre queda pasado por alto", () => {
  const juicio = evaluar(paquete, {
    ...analizoCorrecto,
    evidencia: [
      { ruta: "logs/app.log", linea: 1, afirmacion: "ERROR falta el índice de usuarios" },
    ],
  });
  assert.deepEqual(juicio.pasadoPorAlto, ["app/servicio.js:const usuarios = dameTodos();"]);
});

test("la comparación es determinista: el mismo análisis dos veces da el mismo juicio", () => {
  assert.deepEqual(evaluar(paquete, analizoCorrecto), evaluar(paquete, analizoCorrecto));
});

test("las utilidades de palabras son verificables", () => {
  assert.equal(textoPlano("Íñigo Éndoú"), "inigo endou");
  assert.deepEqual(palabrasDe("los índices de usuarios"), ["indic", "usuar"]);
  assert.equal(palabrasDe("de la y no en").length, 0);
  // línea con la idea y línea con otra cosa
  assert.equal(laLineaDice("const usuarios = dameTodos();", "usuarios = dameTodos()"), true);
  assert.equal(laLineaDice("const usuarios = dameTodos();", "la cola se vació"), false);
});

test("el punto esperado se separa en ruta y cadena, también con horas en la cadena", () => {
  const punto = puntoEsperado("logs/app.log:10:01:03 ERROR");
  assert.equal(punto.ruta, "logs/app.log");
  assert.equal(punto.cadena, "10:01:03 ERROR");
  const solo = puntoEsperado("logs/app.log");
  assert.equal(solo.ruta, "logs/app.log");
  assert.equal(solo.cadena, null);
});
