/**
 * Las pruebas del progreso de incidentes (0.5.H): abra, entregue y recuerde; lo que no encaja
 * con la forma guardada no se usa, y la exportación vuelve sin pérdida.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  exportarProgresoIncidentes,
  guardarEntrega,
  importarProgresoIncidentes,
  marcarAbierto,
  progresoIncidentesInicial,
  sinVolverAMirar,
  CAMPOS_TOTALES,
  versionProgresoIncidentes,
  type ResumenEvaluacion,
} from "./progreso.ts";

const resumenBueno: ResumenEvaluacion = {
  acertados: 3,
  deducidos: 1,
  altos: 0,
  sostenidas: 2,
  citas: 3,
  puntosAlto: 1,
  puntosTotales: 3,
};

test("la forma guardada es la versión 1 con cuatro campos evaluados", () => {
  assert.equal(versionProgresoIncidentes, 1);
  assert.equal(CAMPOS_TOTALES, 4);
});

test("abrir un paquete lo apunta como atacado, con su nivel y su fecha", () => {
  const progreso = marcarAbierto(progresoIncidentesInicial(), "cola-lenta", 4);
  const entrada = progreso.paquetes["cola-lenta"];
  assert.equal(entrada.estado, "abierto");
  assert.equal(entrada.nivel, 4);
  assert.ok(!Number.isNaN(Date.parse(entrada.cuando)));
});

test("abrir de nuevo no borra la fecha de la primera vez ni degrada una entrega", () => {
  const abierto = marcarAbierto(progresoIncidentesInicial(), "clave-en-logs", 6);
  const entregado = guardarEntrega(abierto, "clave-en-logs", 6, resumenBueno).progreso;
  const reabierto = marcarAbierto(entregado, "clave-en-logs", 6);
  assert.equal(reabierto.paquetes["clave-en-logs"].estado, "entregado");
  assert.equal(reabierto.paquetes["clave-en-logs"].cuando, entregado.paquetes["clave-en-logs"].cuando);
});

test("la entrega asciende el paquete a entregado con el resumen y la fecha nueva", () => {
  const abierto = marcarAbierto(progresoIncidentesInicial(), "cola-lenta", 4);
  const { progreso, entradoAntes } = guardarEntrega(abierto, "cola-lenta", 4, resumenBueno);
  assert.equal(entradoAntes, false);
  const entrada = progreso.paquetes["cola-lenta"];
  assert.equal(entrada.estado, "entregado");
  assert.deepEqual(entrada.resumen, resumenBueno);
});

test("una segunda entrega dice que ya había entrado antes y actualiza el resumen", () => {
  const primera = guardarEntrega(progresoIncidentesInicial(), "cola-lenta", 4, resumenBueno);
  const { progreso, entradoAntes } = guardarEntrega(
    primera.progreso,
    "cola-lenta",
    4,
    { ...resumenBueno, acertados: 4, deducidos: 0 },
  );
  assert.equal(entradoAntes, true);
  assert.deepEqual(progreso.paquetes["cola-lenta"].resumen, {
    ...resumenBueno,
    acertados: 4,
    deducidos: 0,
  });
});

test("sin volver a mirar: los abiertos que nunca llegaron a entregarse, en orden", () => {
  const primero = marcarAbierto(progresoIncidentesInicial(), "segundo-paquete", 2);
  const segundo = marcarAbierto(primero, "primer-paquete", 7);
  const tercero = guardarEntrega(segundo, "primer-paquete", 7, resumenBueno).progreso;
  assert.deepEqual(sinVolverAMirar(tercero), ["segundo-paquete"]);
});

test("exportar e importar sin pérdida, y lo insólito tumba el fichero entero", () => {
  const original = guardarEntrega(
    marcarAbierto(progresoIncidentesInicial(), "clave-en-logs", 6),
    "clave-en-logs",
    6,
    resumenBueno,
  ).progreso;
  const importado = importarProgresoIncidentes(exportarProgresoIncidentes(original));
  assert.equal(importado.ok, true);
  if (importado.ok) assert.deepEqual(importado.progreso, original);

  assert.equal(importarProgresoIncidentes("no es json").ok, false);
  assert.equal(importarProgresoIncidentes(JSON.stringify({ hola: 1 })).ok, false);
  assert.equal(importarProgresoIncidentes("null").ok, false);

  const otraVersion = { ...original, version: 99 };
  assert.equal(importarProgresoIncidentes(JSON.stringify(otraVersion)).ok, false);

  const rotten = {
    ...original,
    paquetes: { ...original.paquetes, roto: { estado: "ganado" } },
  };
  assert.equal(importarProgresoIncidentes(JSON.stringify(rotten)).ok, false);

  const resumenFalso = {
    ...original,
    paquetes: {
      ...original.paquetes,
      "clave-en-logs": {
        ...original.paquetes["clave-en-logs"],
        resumen: { ...resumenBueno, acertados: 9 },
      },
    },
  };
  assert.equal(importarProgresoIncidentes(JSON.stringify(resumenFalso)).ok, false);
});
