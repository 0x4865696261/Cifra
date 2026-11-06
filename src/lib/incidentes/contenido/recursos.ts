import type { DefinicionIncidente } from "../tipos.ts";
import { contratosDeModulo, type Modulo } from "../../modulos/tipos.ts";

/**
 * Paquetes de incidente con fallo de recursos y de servicio (0.5.A): el secreto expuesto, la
 * consulta que crece, el bloqueo de dos trabajos y el mapa que no suelta nada. Todo el material
 * es sintético: código escrito para Cifra, sin sistemas reales ni credenciales reales.
 */

const secretoExpuesto: DefinicionIncidente = {
  id: "factura-bot-disparada",
  titulo: "La factura del bot que se multiplicó por veinte",
  nivel: 6,
  familia: "secreto-expuesto",
  notaFamilia:
    "Secretos expuestos: una clave que dejó de ser privada por quedar en la historia. El fallo " +
    "no lo comete quien la robó; lo comete el paso que la dejó venir.",
  sintoma:
    "La factura del bot se multiplicó por veinte en dos días y nadie ha lanzado campañas nuevas.",
  ficheros: {
    "app/bot.js": [
      "import { despacha } from './mensajes.js';",
      "",
      "const clave = process.env.CLAVE_BOT ?? 'sk-sintetica-0001-mudo-teclado';",
      "",
      "export function arranca() {",
      "  return despacha(clave);",
      "}",
    ].join("\n"),
    "config/entorno.txt": [
      "CLAVE_BOT: sin valor en producción (se asigna en el despliegue)",
      "última rotación de claves: nunca",
      "escaneo de claves en los commit: no configurado",
    ].join("\n"),
    "repositorio/historial.txt": [
      "a1b2c3d  2026-10-24  sube bot.js y su clave para que arranque solo en el servidor",
      "e4f5g6h  2026-10-25  quita la clave del fichero: el entorno la pone",
      "i7j8k9l  2026-10-26  ajusta el envío del bot por tramos",
    ].join("\n"),
    "logs/factura.txt": [
      "2026-10-27 uso del bot: 2,100 peticiones",
      "2026-10-29 uso del bot: 2,240 peticiones",
      "2026-11-01 uso del bot: 48,900 peticiones, origen desconocido",
      "2026-11-02 uso del bot: 51,200 peticiones, origen desconocido",
    ].join("\n"),
  },
  respuestaEsperada: {
    causa:
      "la clave del bot quedó subida al repositorio con su valor y una cuenta ajena la está " +
      "usando desde entonces: el gasto de otra persona corre por esta cuenta",
    evidencia: [
      "repositorio/historial.txt:sube bot.js y su clave para que arranque solo en el servidor",
      "app/bot.js:?? 'sk-sintetica-0001-mudo-teclado'",
      "logs/factura.txt:48,900 peticiones, origen desconocido",
    ],
    impacto:
      "el gasto de otra persona consume la cuota del bot y la factura corre por esta cuenta",
    correccion:
      "girar la clave, retirarla del repositorio y limpiar el historial donde sigue, porque girarla sin limpiar no cierra nada",
    comoDetectarlo:
      "un escaneo de claves en cada commit y una alerta cuando el uso crece sin lanzamiento detrás",
  },
  conceptos: ["mensaje", "prueba"],
  analizoEstandar: {
    idPaquete: "factura-bot-disparada",
    quePaso:
      "la clave del bot quedó subida al repositorio con su valor y una cuenta ajena la está " +
      "usando desde entonces: el gasto de otra persona corre por esta cuenta",
    evidencia: [
      {
        ruta: "repositorio/historial.txt",
        afirmacion:
          "a1b2c3d  2026-10-24  sube bot.js y su clave para que arranque solo en el servidor",
      },
      {
        ruta: "app/bot.js",
        afirmacion: "const clave = process.env.CLAVE_BOT ?? 'sk-sintetica-0001-mudo-teclado';",
      },
      {
        ruta: "logs/factura.txt",
        afirmacion: "2026-11-01 uso del bot: 48,900 peticiones, origen desconocido",
      },
    ],
    impacto:
      "el gasto de otra persona consume la cuota del bot y la factura corre por esta cuenta",
    correccion:
      "girar la clave, retirarla del repositorio y limpiar el historial donde sigue, porque girarla sin limpiar no cierra nada",
    comoDetectarlo:
      "un escaneo de claves en cada commit y una alerta cuando el uso crece sin lanzamiento detrás",
  },
};

const consultaLenta: DefinicionIncidente = {
  id: "panel-facturas-cada-vez-mas-lento",
  titulo: "El panel de facturas que se alarga de a poco",
  nivel: 5,
  familia: "consulta-lenta",
  notaFamilia:
    "Consultas lentas: el bucle que pregunta de más y la tabla que crece cada día. Nadie nota " +
    "nada hasta que la tabla llega al tamaño del problema.",
  sintoma:
    "El panel de facturas tardaba 200 ms al abrir y hoy llega a casi diez segundos. El resto de la web va como siempre.",
  ficheros: {
    "esquema/pedidos.sql": [
      "create table pedidos (",
      "  id serial primary key,",
      "  cliente_id entero no nulo,",
      "  fecha fecha no nula,",
      "  total numero no nulo",
      ");",
      "create index pedidos_por_cliente on pedidos (cliente_id);",
      "-- sin índice por fecha: el panel agrupa por día",
    ].join("\n"),
    "app/panel.js": [
      "export async function resumenDelMes(base, mes) {",
      "  const dias = await base.diasDelMes(mes);",
      "  const porDia = [];",
      "  for (const dia of dias) {",
      "    const pedidos = await base.pedidosDelDia(dia);",
      "    porDia.push({ dia, total: suma(pedidos) });",
      "  }",
      "  return porDia;",
      "}",
    ].join("\n"),
    "logs/base.log": [
      "10:14:02 WARN consulta lenta: 6,412 ms — recorrido completo de pedidos (51,900 filas)",
      "10:14:09 WARN consulta lenta: 7,015 ms — recorrido completo de pedidos (51,900 filas)",
      "10:14:16 WARN consulta lenta: 6,980 ms — recorrido completo de pedidos (51,900 filas)",
    ].join("\n"),
    "metrics.txt": [
      "p95 del panel de facturas: 210 ms (enero) → 620 ms (marzo) → 9,400 ms (hoy)",
      "filas de la tabla pedidos: 51,900",
      "consultas del panel por carga: 31 (una por día del mes)",
    ].join("\n"),
  },
  respuestaEsperada: {
    causa:
      "el panel pregunta a la base el total de cada día uno a uno y, sin índice por fecha, cada " +
      "consulta lleva un recorrido completo de la tabla de pedidos",
    evidencia: [
      "logs/base.log:recorrido completo de pedidos (51,900 filas)",
      "esquema/pedidos.sql:sin índice por fecha",
      "app/panel.js:await base.pedidosDelDia(dia)",
      "metrics.txt:consultas del panel por carga: 31 (una por día del mes)",
    ],
    impacto:
      "el panel se alarga con cada pedido guardado: la misma carga es más lenta cada día y " +
      "alguien deja de esperarla",
    correccion:
      "crear el índice por fecha y sustituir el bucle por una única consulta agrupada que pida el mes entero",
    comoDetectarlo:
      "un aviso por tiempo de consulta y revisar el plan de las consultas lentas antes de subir cambios",
  },
  conceptos: ["complejidad", "bucle"],
  analizoEstandar: {
    idPaquete: "panel-facturas-cada-vez-mas-lento",
    quePaso:
      "el panel pregunta a la base el total de cada día uno a uno y, sin índice por fecha, cada " +
      "consulta lleva un recorrido completo de la tabla de pedidos",
    evidencia: [
      {
        ruta: "logs/base.log",
        afirmacion:
          "10:14:02 WARN consulta lenta: 6,412 ms — recorrido completo de pedidos (51,900 filas)",
      },
      {
        ruta: "esquema/pedidos.sql",
        afirmacion: "-- sin índice por fecha: el panel agrupa por día",
      },
      {
        ruta: "app/panel.js",
        afirmacion: "const pedidos = await base.pedidosDelDia(dia);",
      },
      {
        ruta: "metrics.txt",
        afirmacion: "consultas del panel por carga: 31 (una por día del mes)",
      },
    ],
    impacto:
      "el panel se alarga con cada pedido guardado: la misma carga es más lenta cada día y " +
      "alguien deja de esperarla",
    correccion:
      "crear el índice por fecha y sustituir el bucle por una única consulta agrupada que pida el mes entero",
    comoDetectarlo:
      "un aviso por tiempo de consulta y revisar el plan de las consultas lentas antes de subir cambios",
  },
};

const bloqueoEspera: DefinicionIncidente = {
  id: "cola-parada-a-las-diez",
  titulo: "La cola que se para cada mañana a las 10:00",
  nivel: 7,
  familia: "bloqueo-espera",
  notaFamilia:
    "Bloqueos y esperas: dos procesos que toman las mismas filas en orden distinto. Cada uno " +
    "queda esperando lo que el otro tiene y ninguno suelta; el tope mata uno y mañana se repite.",
  sintoma:
    "Cada mañana a las 10:00 la cola deja de avanzar unos minutos y, alguna vez, acaba parada " +
    "con el tope de espera sin consumir por detrás.",
  ficheros: {
    "app/transferencia.js": [
      "export async function transferencia(base, envio) {",
      "  await base.tomar('pedidos_simple', envio.id);",
      "  await base.tomar('pedidos_detallado', envio.id);",
      "  return despachar(envio);",
      "}",
    ].join("\n"),
    "app/cuadre.js": [
      "export async function cuadre(base, envio) {",
      "  await base.tomar('pedidos_detallado', envio.id);",
      "  await base.tomar('pedidos_simple', envio.id);",
      "  return cadrar(envio);",
      "}",
    ].join("\n"),
    "jobs/programas.txt": [
      "transferencia: todos los días 10:00",
      "cuadre: todos los días 10:00",
      "orden de filas: el que cada trabajo pide",
      "tope de espera: 600 segundos",
    ].join("\n"),
    "logs/cola.log": [
      "10:00:05 INFO transferencia: tomó pedidos_simple del envío 8831",
      "10:00:05 INFO cuadre: tomó pedidos_detallado del envío 8831",
      "10:00:35 WARN transferencia: espera pedidos_detallado, lo tiene cuadre",
      "10:00:35 WARN cuadre: espera pedidos_simple, lo tiene transferencia",
      "10:10:36 ERROR cola: tope de espera superado: corto el cuadre del envío 8831",
    ].join("\n"),
    "metrics.txt": [
      "misiones de la cola al día: 810 → 824 → 831 (lunes → martes → miércoles)",
      "misiones en la cola detrás del bloqueo: 63 → 74 → 83",
    ].join("\n"),
  },
  respuestaEsperada: {
    causa:
      "transferencia y cuadre toman las mismas filas a la misma hora en orden distinto: cada uno " +
      "espera la fila que tiene el otro y ninguno suelta, así que se quedan bloqueados hasta el tope",
    evidencia: [
      "app/transferencia.js:await base.tomar('pedidos_simple', envio.id)",
      "app/cuadre.js:await base.tomar('pedidos_detallado', envio.id)",
      "logs/cola.log:espera pedidos_detallado, lo tiene cuadre",
    ],
    impacto:
      "los dos trabajos se frenan mutuamente y la cola entera queda sin avanzar hasta que el tope mata uno",
    correccion:
      "tomar las filas siempre en el mismo orden en los dos trabajos y desviar el cuadre a otra hora",
    comoDetectarlo:
      "registrar qué fila toma cada trabajo y lanzar una alerta cuando la espera supera un minuto",
  },
  conceptos: ["concurrencia"],
  analizoEstandar: {
    idPaquete: "cola-parada-a-las-diez",
    quePaso:
      "transferencia y cuadre toman las mismas filas a la misma hora en orden distinto: cada uno " +
      "espera la fila que tiene el otro y ninguno suelta, así que se quedan bloqueados hasta el tope",
    evidencia: [
      {
        ruta: "app/transferencia.js",
        afirmacion: "await base.tomar('pedidos_simple', envio.id);",
      },
      {
        ruta: "app/cuadre.js",
        afirmacion: "await base.tomar('pedidos_detallado', envio.id);",
      },
      {
        ruta: "logs/cola.log",
        afirmacion: "10:00:35 WARN transferencia: espera pedidos_detallado, lo tiene cuadre",
      },
    ],
    impacto:
      "los dos trabajos se frenan mutuamente y la cola entera queda sin avanzar hasta que el tope mata uno",
    correccion:
      "tomar las filas siempre en el mismo orden en los dos trabajos y desviar el cuadre a otra hora",
    comoDetectarlo:
      "registrar qué fila toma cada trabajo y lanzar una alerta cuando la espera supera un minuto",
  },
};

const desbordeRecursos: DefinicionIncidente = {
  id: "servicio-frases-reinicio",
  titulo: "El servicio que se reinicia solo cada dos días",
  nivel: 9,
  familia: "desborde-recursos",
  notaFamilia:
    "Desbordes de recursos: algo que guarda y nunca suelta. La memoria solo sube, y el sistema, " +
    "cuando llega arriba, corta por ella el trabajo que iba por el camino.",
  sintoma:
    "El servicio de frases se reinicia solo cada dos días: la memoria va de 41 MB a 249 MB sin bajar nunca.",
  ficheros: {
    "app/franja.js": [
      "const vistos = new Map();",
      "",
      "export function guardaVistos(clave, resultado) {",
      "  vistos.set(clave, resultado);",
      "  return vistos.size;",
      "}",
    ].join("\n"),
    "config/limites.txt": [
      "memoria del servicio: 256 MB",
      "vistos: sin límite y sin desalojo",
      "reyarrancar solo si el sistema lo pide",
    ].join("\n"),
    "metrics.txt": [
      "memoria del servicio por hora: 41 MB → 90 MB → 151 MB → 249 MB → reinicio",
      "memoria al arrancar de nuevo: 41 MB (la curva repite el mismo camino)",
      "entradas en el mapa vistos: 1,143,877 (y contando)",
    ].join("\n"),
    "logs/salud.log": [
      "día 1 06:00 INFO el servicio arrancó, memoria 41 MB",
      "día 1 20:00 WARN memoria por encima de la mitad del tope",
      "día 2 03:40 ERROR memoria agotada: el sistema mata el servicio",
      "día 2 06:00 INFO el servicio arrancó, memoria 41 MB",
    ].join("\n"),
  },
  respuestaEsperada: {
    causa:
      "el mapa de vistos guarda cada entrada sin límite ni desalojo: la memoria solo sube y " +
      "llega al tope, y el sistema mata el servicio",
    evidencia: [
      "app/franja.js:vistos.set(clave, resultado)",
      "config/limites.txt:vistos: sin límite y sin desalojo",
      "metrics.txt:memoria del servicio por hora: 41 MB → 90 MB → 151 MB → 249 MB → reinicio",
    ],
    impacto:
      "el servicio muere de golpe y las peticiones que iban en vuelo se pierden",
    correccion:
      "poner un tope al mapa y desalojar por antigüedad antes de guardar una entrada nueva",
    comoDetectarlo:
      "vigilar la memoria del servicio entre reinicios: si solo sube y no vuelve a la base, algo no suelta nada",
  },
  conceptos: ["memoria", "complejidad", "arreglo"],
  analizoEstandar: {
    idPaquete: "servicio-frases-reinicio",
    quePaso:
      "el mapa de vistos guarda cada entrada sin límite ni desalojo: la memoria solo sube y " +
      "llega al tope, y el sistema mata el servicio",
    evidencia: [
      { ruta: "app/franja.js", afirmacion: "vistos.set(clave, resultado);" },
      { ruta: "config/limites.txt", afirmacion: "vistos: sin límite y sin desalojo" },
      {
        ruta: "metrics.txt",
        afirmacion: "memoria del servicio por hora: 41 MB → 90 MB → 151 MB → 249 MB → reinicio",
      },
    ],
    impacto:
      "el servicio muere de golpe y las peticiones que iban en vuelo se pierden",
    correccion:
      "poner un tope al mapa y desalojar por antigüedad antes de guardar una entrada nueva",
    comoDetectarlo:
      "vigilar la memoria del servicio entre reinicios: si solo sube y no vuelve a la base, algo no suelta nada",
  },
};

export const paquetesDeRecursos = [
  secretoExpuesto,
  consultaLenta,
  bloqueoEspera,
  desbordeRecursos,
];

export const moduloIncidentesRecursos = {
  manifiesto: {
    id: "incidentes-recursos",
    tipo: "incidente",
    aporta: [
      "familia:secreto-expuesto",
      "familia:consulta-lenta",
      "familia:bloqueo-espera",
      "familia:desborde-recursos",
    ],
    versionContrato: contratosDeModulo.incidente.version,
    necesita: ["contrato:4.6"],
  },
  contenido: paquetesDeRecursos,
} as const satisfies Modulo<DefinicionIncidente[]>;
