import type { TestSpec } from "../ejecucion/tipos.ts";

export const proyectoPedidos = {
  id: "pedidos-de-tienda",
  titulo: "Pedidos de una tienda",
  entrada: "src/pedido.js",
  archivos: [
    {
      ruta: "src/pedido.js",
      codigo: `const { envio } = require("./envio.js");

function resolver({ productos, destino }) {
  const subtotal = productos.reduce((total, producto) => total + producto.precio, 0);
  return subtotal;
}

module.exports = { resolver };
`,
    },
    {
      ruta: "src/envio.js",
      codigo: `function envio(subtotal, destino) {
  return 0;
}

module.exports = { envio };
`,
    },
  ],
};

export const pruebasPedidos: TestSpec[] = [
  {
    id: "local",
    nombre: "Envío local de un pedido pequeño",
    entrada: { productos: [{ precio: 12 }, { precio: 8 }], destino: "local" },
    esperado: 23,
    tipo: "retorno",
    visible: true,
  },
  {
    id: "gratis",
    nombre: "Envío local gratis desde 50 €",
    entrada: { productos: [{ precio: 35 }, { precio: 15 }], destino: "local" },
    esperado: 50,
    tipo: "retorno",
    visible: true,
  },
  {
    id: "remoto",
    nombre: "Envío remoto con tarifa fija",
    entrada: { productos: [{ precio: 52 }], destino: "remoto" },
    esperado: 60,
    tipo: "retorno",
    visible: true,
  },
  {
    id: "vacio",
    nombre: "Un carrito vacío no tiene gastos de envío",
    entrada: { productos: [], destino: "remoto" },
    esperado: 0,
    tipo: "retorno",
    visible: true,
  },
];
