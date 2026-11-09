import assert from "node:assert/strict";
import { after, test } from "node:test";
import { codigoProyecto } from "./proyecto-javascript.ts";
import { correrPruebasPorTransporte, todasPasadas } from "./pruebas.ts";
import { liberarHilos, transporteHilo } from "./hiloPrueba.ts";
import { limitesDefecto } from "./limites.ts";
import { proyectoPedidos, pruebasPedidos } from "../retos/proyecto-pedidos.ts";

after(() => liberarHilos());

const archivos = [
  {
    ruta: "src/pedido.js",
    codigo: `const { envio } = require("./envio.js");
      module.exports.resolver = ({ productos, destino }) => {
        const subtotal = productos.reduce((total, p) => total + p.precio, 0);
        return subtotal + envio(subtotal, destino);
      };`,
  },
  {
    ruta: "src/envio.js",
    codigo: `exports.envio = (total, destino) => {
      if (total === 0) return 0;
      if (destino === "remoto") return 8;
      return total >= 50 ? 0 : 3;
    };`,
  },
];

function comprobar(fuentes: typeof archivos) {
  return correrPruebasPorTransporte(
    transporteHilo(),
    { lenguaje: "javascript", codigo: "", limites: limitesDefecto(), pruebas: pruebasPedidos },
    (prueba) => codigoProyecto(fuentes, proyectoPedidos.entrada, prueba.entrada),
  );
}

test("la entrega depende de los dos archivos y cada prueba recibe su caso", async () => {
  assert.equal(todasPasadas(await comprobar(proyectoPedidos.archivos)), false);
  assert.equal(todasPasadas(await comprobar(archivos)), true);
});

test("el cargador rechaza módulos externos dentro del worker", async () => {
  const resultado = await comprobar([
    { ruta: "src/pedido.js", codigo: 'module.exports = require("node:fs");' },
  ]);
  assert.equal(todasPasadas(resultado), false);
  assert.match(resultado.stderr, /ruta relativa/);
});
