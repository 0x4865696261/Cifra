import assert from "node:assert/strict";
import { test } from "node:test";
import { crearCuotaIa } from "./cuota.ts";

test("los rechazos por IP no consumen el presupuesto compartido", () => {
  const admitir = crearCuotaIa(() => 0);
  for (let i = 0; i < 8; i++) assert.equal(admitir("una-ip"), true);
  for (let i = 0; i < 50; i++) assert.equal(admitir("una-ip"), false);
  for (let i = 0; i < 22; i++) assert.equal(admitir(`otra-${i}`), true);
  assert.equal(admitir("fuera-de-cuota"), false);
});

test("las llamadas caducan al pasar diez minutos", () => {
  let instante = 0;
  const admitir = crearCuotaIa(() => instante);
  for (let i = 0; i < 8; i++) assert.equal(admitir("una-ip"), true);
  instante = 599_999;
  assert.equal(admitir("una-ip"), false);
  instante = 600_000;
  assert.equal(admitir("una-ip"), true);
});
