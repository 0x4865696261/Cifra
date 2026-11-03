/**
 * Las pruebas de la terminal simulada (0.5): cada comando permitido se prueba; un comando
 * fuera de la lista nunca se ejecuta; las rutas `../` no salen del sistema de ficheros
 * virtual, y todo lo que se ejecuta entra en el historial.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { creaSistema, type Sistema } from "./sistema.ts";
import { ejecutarComando, terminalVacia, TOPE_CARACTERES } from "./terminal.ts";

const FICHEROS = {
  "logs/app.log": [
    "# fecha nivel mensaje",
    "10:00:02 INFO arranque normal",
    "10:00:15 WARN reconexión de la cola",
    "10:01:03 ERROR falta el índice de usuarios",
    "10:01:04 ERROR falta el índice de usuarios",
    "10:01:05 WARN reconexión de la cola",
    "10:02:00 INFO peticiones 44/100",
    "", // línea vacía al final, como un fichero real
  ].join("\n"),
  "app/servicio.js": [
    "import { cola } from './cola.js';",
    "",
    "export async function atiende(pedido) {",
    "  const usuarios = await cola.dameTodos();",
    "  return usuarios[pedido.indice - 1];",
    "}",
    "",
  ].join("\n"),
  "app/config.json": '{ "cola": "grande", "indice": false }\n',
  "logs/viejos/viejo.log": "09:00:00 ERROR viejo pero parecido\n",
  "logs/repetidos.log": ["ERROR cola caída", "ERROR cola caída", "INFO ok", "ERROR cola caída", ""].join("\n"),
  "doc.md": "## cómo arranca\n\n`npm start`\n",
};

function sistemaPrueba(): Sistema {
  return creaSistema(FICHEROS);
}

function salidaDe(estado: ReturnType<typeof terminalVacia>, indice = -1): string[] {
  return estado.historial.at(indice)?.lineas ?? [];
}

test("ls lista la raíz con las carpetas marcadas", () => {
  const estado = ejecutarComando("ls", sistemaPrueba(), terminalVacia());
  assert.deepEqual(estado.historial.length, 1);
  assert.deepEqual(salidaDe(estado), ["app/", "doc.md", "logs/"]);
});

test("ls dentro de una carpeta y ls de varios argumentos con encabezado", () => {
  const estado = ejecutarComando("ls app logs/viejos", sistemaPrueba(), terminalVacia());
  assert.deepEqual(salidaDe(estado), [
    "/app:",
    "config.json",
    "servicio.js",
    "",
    "/logs/viejos:",
    "viejo.log",
  ]);
});

test("cat suelta el fichero entero y cat a dos ficheros concatena", () => {
  const sistema = sistemaPrueba();
  const uno = ejecutarComando("cat app/servicio.js", sistema, terminalVacia());
  assert.deepEqual(salidaDe(uno), [
    "import { cola } from './cola.js';",
    "",
    "export async function atiende(pedido) {",
    "  const usuarios = await cola.dameTodos();",
    "  return usuarios[pedido.indice - 1];",
    "}",
    "",
  ]);
  const dos = ejecutarComando("cat app/config.json doc.md", sistema, terminalVacia());
  assert.deepEqual(salidaDe(dos).slice(0, 1), ['{ "cola": "grande", "indice": false }']);
  assert.ok(salidaDe(dos).includes("`npm start`"));
});

test("cat sobre una carpeta avisa y no rompe", () => {
  const estado = ejecutarComando("cat app", sistemaPrueba(), terminalVacia());
  assert.equal(salidaDe(estado)[0], "es un directorio, no un fichero: /app");
});

test("head y tail cortan por la cabeza y por el final, con y sin -n", () => {
  const sistema = sistemaPrueba();
  const cabeza = ejecutarComando("head logs/app.log", sistema, terminalVacia());
  assert.equal(salidaDe(cabeza).length, 8);
  assert.deepEqual(salidaDe(cabeza)[0], "# fecha nivel mensaje");
  const acotada = ejecutarComando("head -n 2 logs/app.log", sistema, terminalVacia());
  assert.deepEqual(salidaDe(acotada), ["# fecha nivel mensaje", "10:00:02 INFO arranque normal"]);
  const cola = ejecutarComando("tail -n 3 logs/app.log", sistema, terminalVacia());
  assert.deepEqual(salidaDe(cola), ["10:01:05 WARN reconexión de la cola", "10:02:00 INFO peticiones 44/100", ""]);
});

test("grep numera con -n y marca el fichero si son varios", () => {
  const sistema = sistemaPrueba();
  const uno = ejecutarComando("grep -n ERROR logs/app.log", sistema, terminalVacia());
  assert.deepEqual(salidaDe(uno), ["4:10:01:03 ERROR falta el índice de usuarios", "5:10:01:04 ERROR falta el índice de usuarios"]);
  const dos = ejecutarComando("grep ERROR logs/app.log logs/viejos/viejo.log", sistema, terminalVacia());
  assert.deepEqual(salidaDe(dos), ["/logs/app.log:10:01:03 ERROR falta el índice de usuarios", "/logs/app.log:10:01:04 ERROR falta el índice de usuarios", "/logs/viejos/viejo.log:09:00:00 ERROR viejo pero parecido"]);
});

test("grep -i no distingue mayúsculas y un patrón inválido cae a texto literal", () => {
  const sistema = sistemaPrueba();
  const minusculas = ejecutarComando("grep -i error logs/app.log", sistema, terminalVacia());
  assert.deepEqual(salidaDe(minusculas).length, 2);
  const literal = ejecutarComando("grep a[b logs/viejos/viejo.log", sistema, terminalVacia());
  assert.deepEqual(salidaDe(literal), ["(nada coincide)"]);
});

test("wc cuenta líneas, palabras y caracteres, y respeta los indicadores", () => {
  const sistema = sistemaPrueba();
  const todo = ejecutarComando("wc logs/app.log", sistema, terminalVacia());
  assert.deepEqual(salidaDe(todo), ["lín 8, pal 38, car 242 → /logs/app.log"]);
  const lineas = ejecutarComando("wc -l logs/app.log", sistema, terminalVacia());
  assert.deepEqual(salidaDe(lineas), ["lín 8 → /logs/app.log"]);
});

test("sort ordena y -r lo da la vuelta; uniq junta los consecutivos iguales, -c los cuenta", () => {
  const sistema = sistemaPrueba();
  const ordenado = ejecutarComando("sort logs/app.log", sistema, terminalVacia());
  const primera = salidaDe(ordenado)[0];
  assert.equal(primera, "");
  const invertido = ejecutarComando("sort -r logs/app.log", sistema, terminalVacia());
  assert.notEqual(salidaDe(invertido)[0], salidaDe(ordenado)[0]);
  const unidos = ejecutarComando("sort logs/repetidos.log | uniq -c", sistema, terminalVacia());
  const repetido = salidaDe(unidos).find((linea) => linea.includes("cola caída"));
  assert.ok(repetido?.startsWith("  3"), String(repetido));
});

test("diff muestra lo que cambia entre dos ficheros", () => {
  const sistema = creaSistema({
    "v1.txt": "a\nb\nc\n",
    "v2.txt": "a\nx\nc\n",
  });
  const estado = ejecutarComando("diff v1.txt v2.txt", sistema, terminalVacia());
  assert.deepEqual(salidaDe(estado), ["2c2", "< b", "---", "> x"]);
});

test("find recorre todo y filtra con -name", () => {
  const sistema = sistemaPrueba();
  const todo = ejecutarComando("find", sistema, terminalVacia());
  for (const esperada of ["/app", "/app/servicio.js", "/logs/app.log", "/doc.md"]) {
    assert.ok(salidaDe(todo).includes(esperada), esperada);
  }
  const scripts = ejecutarComando("find -name *.js", sistema, terminalVacia());
  assert.deepEqual(salidaDe(scripts), ["/app/servicio.js"]);
});

test("cut saca columnas por un símbolo, campo contando desde 1", () => {
  const sistema = creaSistema({ "tabla.csv": "hora,nivel,mensaje\n10:01,ERROR,falta índice\n" });
  const estado = ejecutarComando("cut -d , -f 2 tabla.csv", sistema, terminalVacia());
  assert.deepEqual(salidaDe(estado), ["nivel", "ERROR", ""]);
});

test("un comando fuera de la lista cerrada nunca se ejecuta", () => {
  const sistema = sistemaPrueba();
  const borrado = ejecutarComando("rm -rf /app", sistema, terminalVacia());
  assert.deepEqual(salidaDe(borrado)[0], "comando no disponible: rm");
  // y el sistema queda igual: la línea está ahí, nada la tocó
  const estado = ejecutarComando("cat app/servicio.js", sistema, borrado);
  assert.ok(salidaDe(estado, -1).join("\n").includes("dameTodos"));
});

test("tuberías entre comandos de la lista: grep | wc -l y sort | tail", () => {
  const sistema = sistemaPrueba();
  const contadas = ejecutarComando("grep ERROR logs/app.log | wc -l", sistema, terminalVacia());
  assert.equal(salidaDe(contadas)[0].includes("lín 2"), true, salidaDe(contadas).join(" | "));
  const ultimas = ejecutarComando("cat logs/app.log | sort -r | tail -n 2", sistema, terminalVacia());
  assert.ok(salidaDe(ultimas).at(-1) !== undefined);
});

test("rutas con ../ no salen del sistema de ficheros virtual", () => {
  const sistema = sistemaPrueba();
  for (const pregunta of [
    "cat ../../etc/passwd",
    "cat /../../etc/passwd",
    "grep .. logs/app.log",
    "ls ..",
  ]) {
    const estado = ejecutarComando(pregunta, sistema, terminalVacia());
    assert.ok(estado.historial.length > 0, pregunta);
    for (const linea of salidaDe(estado)) {
      assert.ok(!linea.includes("root:"), `${pregunta} → ${linea}`);
    }
  }
  // /etc/passwd no está en el paquete: la respuesta es «no existe», nada más.
  const estado = ejecutarComando("cat ../../etc/passwd", sistema, terminalVacia());
  assert.match(salidaDe(estado)[0], /no existe en el paquete|fuera del sistema/);
});

test("rutas con formas imposibles caen fuera del sistema de ficheros", () => {
  const estado = ejecutarComando("cat <meta charset>", sistemaPrueba(), terminalVacia());
  assert.equal(salidaDe(estado)[0].startsWith("fuera del sistema de ficheros"), true);
});

test("una salida gigante se corta y lo dice", () => {
  const sistema = creaSistema({ "gigante.txt": Array.from({ length: 50_000 }, (_, i) => `linea ${i}`).join("\n") });
  const estado = ejecutarComando("cat gigante.txt", sistema, terminalVacia());
  assert.ok(salidaDe(estado).at(-1) === "… (salida cortada)");
  assert.ok(salidaDe(estado).length < 50_000);
  void TOPE_CARACTERES;
});

test("cada comando ejecutado queda en el historial, con su texto exacto", () => {
  const sistema = sistemaPrueba();
  let estado = ejecutarComando("ls logs", sistema, terminalVacia());
  estado = ejecutarComando("grep INFO logs/app.log", sistema, estado);
  assert.deepEqual(estado.historial.map((entrada) => entrada.comando), ["ls logs", "grep INFO logs/app.log"]);
  assert.equal(estado.historial[0].ok, true);
});

// util del test de tuberías (refiere la salida si falla para verla entera)
function saliaDe(estado: ReturnType<typeof terminalVacia>): unknown {
  return estado.historial.at(-1)?.lineas;
}
