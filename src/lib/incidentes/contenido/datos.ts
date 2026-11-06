import type { DefinicionIncidente } from "../tipos.ts";
import { contratosDeModulo, type Modulo } from "../../modulos/tipos.ts";

/**
 * Paquetes de incidente con fallo de datos y de honestidad del mensaje (0.5.A): la limpieza
 * nula, la migración a medias, el permiso de más y el registro que dice otra cosa. Todo el
 * material es sintético: código escrito para Cifra, sin sistemas reales ni credenciales.
 */

const valorNulo: DefinicionIncidente = {
  id: "perfil-500-madrugada",
  titulo: "El perfil que devuelve 500 de madrugada",
  nivel: 3,
  familia: "valor-nulo",
  notaFamilia:
    "Valores nulos: un dato que falta y una línea que lo mira sin preguntar si llegó. El fallo " +
    "no está donde salta, sino en el paso anterior que se lo trajo.",
  sintoma:
    "Desde la limpieza nocturna, la pantalla de perfil devuelve 500 para un grupo de cuentas. " +
    "El resto de la web va bien.",
  ficheros: {
    "app/perfil.js": [
      "export async function cargaPerfil(base, id) {",
      "  const usuario = await base.usuarioPorId(id);",
      "  return {",
      "    nombre: usuario.nombre,",
      "    ciudad: usuario.direccion.ciudad,",
      "  };",
      "}",
    ].join("\n"),
    "jobs/limpieza.sql": [
      "-- limpieza semanal de datos sin validar (programada a las 03:00)",
      "delete from direcciones where validada = false;",
      "delete from usuarios where alta_confirmada = false;",
    ].join("\n"),
    "logs/app.log": [
      "03:00:00 INFO limpieza: arranca la tarea nocturna",
      "03:00:21 INFO limpieza: direcciones sin validar borradas: 182",
      "03:07:12 ERROR TypeError: no se puede leer la propiedad 'ciudad' de null (app/perfil.js:5)",
      "03:07:40 ERROR TypeError: no se puede leer la propiedad 'ciudad' de null (app/perfil.js:5)",
      "03:09:02 ERROR TypeError: no se puede leer la propiedad 'ciudad' de null (app/perfil.js:5)",
    ].join("\n"),
    "metrics.txt": [
      "peticiones de perfil por minuto: 3 (normal)",
      "peticiones de perfil con error 500:",
      "  03:05 → 0",
      "  03:07 → 6",
      "  03:08 → 19",
      "  03:10 → 22",
    ].join("\n"),
  },
  respuestaEsperada: {
    causa:
      "la limpieza de medianoche borra direcciones sin validar y el perfil lee la ciudad de una " +
      "dirección que ya no existe",
    evidencia: [
      "logs/app.log:ERROR TypeError: no se puede leer la propiedad 'ciudad' de null",
      "jobs/limpieza.sql:delete from direcciones where validada = false",
      "metrics.txt:03:07 → 6",
    ],
    impacto:
      "la pantalla de perfil devuelve 500 para cada cuenta cuya dirección no pasó la validación",
    correccion:
      "mirar si la dirección existe antes de leer la ciudad y responder un valor por defecto",
    comoDetectarlo: "una prueba con un usuario cuyo registro no lleva dirección",
  },
  conceptos: ["condicion", "prueba", "variable"],
  analizoEstandar: {
    idPaquete: "perfil-500-madrugada",
    quePaso:
      "la limpieza de medianoche borra direcciones sin validar y el perfil lee la ciudad de una " +
      "dirección que ya no existe",
    evidencia: [
      {
        ruta: "app/perfil.js",
        afirmacion: "ciudad: usuario.direccion.ciudad,",
      },
      {
        ruta: "jobs/limpieza.sql",
        afirmacion: "delete from direcciones where validada = false;",
      },
      {
        ruta: "logs/app.log",
        afirmacion:
          "03:07:12 ERROR TypeError: no se puede leer la propiedad 'ciudad' de null (app/perfil.js:5)",
      },
      { ruta: "metrics.txt", afirmacion: "03:07 → 6" },
    ],
    impacto:
      "la pantalla de perfil devuelve 500 para cada cuenta cuya dirección no pasó la validación",
    correccion:
      "mirar si la dirección existe antes de leer la ciudad y responder un valor por defecto",
    comoDetectarlo: "una prueba con un usuario cuyo registro no lleva dirección",
  },
};

const estadoCorrupto: DefinicionIncidente = {
  id: "migracion-moneda-a-medias",
  titulo: "La migración de moneda que quedó a medias",
  nivel: 8,
  familia: "estado-corrupto",
  notaFamilia:
    "Estados intermedios corruptos: un cambio largo que se corta por el camino y deja el sistema " +
    "a medias. Nadie lo tumba de golpe; envenena los totales poco a poco.",
  sintoma:
    "Desde la migración de moneda, parte de las facturas muestran el total multiplicado por cien " +
    "y otras no. El recuento de pedidos cuadra.",
  ficheros: {
    "esquema/v2.sql": [
      "alter table pedidos añade columna moneda_nueva texto;",
      "-- el formato pasa de importes con coma ('31,5') a céntimos ('3150');",
      "-- la columna antigua sigue hasta terminar la migración.",
    ].join("\n"),
    "jobs/migrar.js": [
      "const filas = await base.pedidosSinMonedaNueva();",
      "const lote = 500;",
      "for (let i = 0; i < filas.length; i += lote) {",
      "  await base.aplicaLote(filas.slice(i, i + lote));",
      "}",
      "registra.info('migración de moneda aplicada');",
    ].join("\n"),
    "logs/migracion.log": [
      "01:12:00 INFO migración: columna moneda_nueva añadida",
      "01:12:03 INFO migración: lote 1 aplicado (500 filas)",
      "01:12:07 INFO migración: lote 2 aplicado (500 filas)",
      "01:12:11 WARN migración: aborto por tiempo: 4120 de 9000 filas convertidas",
      "01:12:11 INFO migración: lote 3 programado para las 04:00",
    ].join("\n"),
    "app/total.js": [
      "export function totalDe(pedido) {",
      "  const importe = pedido.moneda_nueva ?? pedido.total_viejo;",
      "  const centimos = Number(importe.replace(',', '.')) * 100;",
      "  return centimos;",
      "}",
    ].join("\n"),
    "metrics.txt": [
      "pedidos convertidos: 4120",
      "pedidos sin convertir: 4880",
      "importes del día con total multiplicado por cien: 61",
    ].join("\n"),
  },
  respuestaEsperada: {
    causa:
      "la migración de moneda quedó cortada a medias y el total multiplica por cien el importe " +
      "sin mirar el formato: los pedidos aún sin convertir salen bien y los ya convertidos en " +
      "céntimos salen inflados por otra multiplicación",
    evidencia: [
      "logs/migracion.log:aborto por tiempo: 4120 de 9000 filas convertidas",
      "app/total.js:const importe = pedido.moneda_nueva ?? pedido.total_viejo",
      "metrics.txt:pedidos sin convertir: 4880",
    ],
    impacto:
      "las facturas de los pedidos ya convertidos salen con el total multiplicado por cien",
    correccion:
      "terminar la migración por lotes hasta agotar las filas pendientes y comprobar el formato " +
      "de cada importe antes de multiplicar",
    comoDetectarlo:
      "un recuento antes de dar la migración por terminada: filas con la columna nueva y filas con la vieja",
  },
  conceptos: ["invariante", "memoria", "prueba"],
  analizoEstandar: {
    idPaquete: "migracion-moneda-a-medias",
    quePaso:
      "la migración de moneda quedó cortada a medias y el total multiplica por cien el importe " +
      "sin mirar el formato: los pedidos aún sin convertir salen bien y los ya convertidos en " +
      "céntimos salen inflados por otra multiplicación",
    evidencia: [
      {
        ruta: "logs/migracion.log",
        afirmacion: "01:12:11 WARN migración: aborto por tiempo: 4120 de 9000 filas convertidas",
      },
      {
        ruta: "app/total.js",
        afirmacion: "const importe = pedido.moneda_nueva ?? pedido.total_viejo;",
      },
      { ruta: "metrics.txt", afirmacion: "pedidos sin convertir: 4880" },
    ],
    impacto:
      "las facturas de los pedidos ya convertidos salen con el total multiplicado por cien",
    correccion:
      "terminar la migración por lotes hasta agotar las filas pendientes y comprobar el formato " +
      "de cada importe antes de multiplicar",
    comoDetectarlo:
      "un recuento antes de dar la migración por terminada: filas con la columna nueva y filas con la vieja",
  },
};

const permisoDeMas: DefinicionIncidente = {
  id: "informes-borrados-noche",
  titulo: "El borrado de informes que nadie pidió",
  nivel: 4,
  familia: "permiso-de-mas",
  notaFamilia:
    "Permisos de más: una cuenta que puede hacer algo que no necesita. El día que otra equivocación " +
    "pasa por ahí, el permiso de más convierte un error menor en una pérdida.",
  sintoma:
    "Los informes del día 28 no están: la bandeja de informes lleva desde la noche una ficha de " +
    "borrado donde tenía que haber un reporte.",
  ficheros: {
    "config/ciclos.txt": [
      "# ciclo de copias nocturnas",
      "origenCopias: bandeja-copias",
      "destinoCopias: bandeja-informes",
      "limpieza: borra ficheros con más de 3 días en el destino",
    ].join("\n"),
    "config/permisos.txt": [
      "cuenta copias: bandeja-informes (leer, escribir, borrar)",
      "cuenta informes: bandeja-informes (leer)",
      "cuenta cobros: bandeja-cobros (leer, escribir)",
    ].join("\n"),
    "ciclos/noche.js": [
      "export function cicloDeNoche() {",
      "  const bandeja = config.destinoCopias;",
      "  const ficheros = listaBandeja(bandeja);",
      "  for (const f of ficheros) {",
      "    if (f.dias > 3) borraFichero(bandeja, f.nombre);",
      "  }",
      "  return ficheros.length;",
      "}",
    ].join("\n"),
    "logs/noche.log": [
      "03:00:10 INFO ciclo-noche: arranca bajo la cuenta copias",
      "03:00:11 INFO ciclo-noche: limpieza del destino bandeja-informes",
      "03:00:11 WARN borrado bandeja-informes/2026-10-28.parquet (dias: 4)",
    ].join("\n"),
  },
  respuestaEsperada: {
    causa:
      "el ciclo de copias quedó apuntando por error a la bandeja de informes y, con el permiso de " +
      "borrar que la cuenta de copias no necesitaba, limpió los ficheros del domingo como si fueran viejos",
    evidencia: [
      "config/ciclos.txt:destinoCopias: bandeja-informes",
      "config/permisos.txt:cuenta copias: bandeja-informes (leer, escribir, borrar)",
      "logs/noche.log:borrado bandeja-informes/2026-10-28.parquet",
    ],
    impacto:
      "los informes del día 28 no se pueden descargar y el trabajo de ese día quedó suelto",
    correccion:
      "devolver el destino del ciclo a la bandeja de copias y quitarle el permiso de borrar a la cuenta",
    comoDetectarlo:
      "una auditoría de permisos por bandeja y un aviso cuando una cuenta borra un fichero que no produce ella",
  },
  conceptos: ["prueba", "mensaje"],
  analizoEstandar: {
    idPaquete: "informes-borrados-noche",
    quePaso:
      "el ciclo de copias quedó apuntando por error a la bandeja de informes y, con el permiso de " +
      "borrar que la cuenta de copias no necesitaba, limpió los ficheros del domingo como si fueran viejos",
    evidencia: [
      { ruta: "config/ciclos.txt", afirmacion: "destinoCopias: bandeja-informes" },
      {
        ruta: "config/permisos.txt",
        afirmacion: "cuenta copias: bandeja-informes (leer, escribir, borrar)",
      },
      {
        ruta: "logs/noche.log",
        afirmacion: "03:00:11 WARN borrado bandeja-informes/2026-10-28.parquet (dias: 4)",
      },
    ],
    impacto:
      "los informes del día 28 no se pueden descargar y el trabajo de ese día quedó suelto",
    correccion:
      "devolver el destino del ciclo a la bandeja de copias y quitarle el permiso de borrar a la cuenta",
    comoDetectarlo:
      "una auditoría de permisos por bandeja y un aviso cuando una cuenta borra un fichero que no produce ella",
  },
};

const discrepanciaMensaje: DefinicionIncidente = {
  id: "avisos-enviados-que-no-salen",
  titulo: "El registro dice enviados, la cola dice pendientes",
  nivel: 5,
  familia: "discrepancia-mensaje",
  notaFamilia:
    "Discrepancias entre lo que el mensaje dice y lo que ocurrió: un registro que declara una " +
    "consecuencia en vez de un suceso. El fallo es de honestidad, no de maquinaria.",
  sintoma:
    "El registro dice que los avisos del día se envían, pero los clientes los llevan dos días sin recibir.",
  ficheros: {
    "jobs/envia.js": [
      "export async function mandaTramo(base, tramo) {",
      "  const avisos = await base.avisosDe(tramo);",
      "  const despachados = await cola.despacha(avisos);",
      "  registra.info(`avisos de ${tramo} enviados`);",
      "  return despachados.length;",
      "}",
    ].join("\n"),
    "app/cola.js": [
      "export async function despacha(avisos) {",
      "  if (!viva()) {",
      "    registra.info('la cola no responde: intento sin efecto');",
      "    return [];",
      "  }",
      "  return reparto(avisos);",
      "}",
    ].join("\n"),
    "logs/tarea.log": [
      "03:00:02 INFO envío de avisos: tramo madrugada",
      "03:00:02 INFO avisos de madrugada enviados",
      "03:00:09 INFO avisos de mañana enviados",
      "03:00:09 INFO la cola no responde: intento sin efecto",
      "03:05:00 WARN cola: 512 avisos quedan pendientes",
    ].join("\n"),
    "metrics.txt": [
      "avisos salientes de la cola: 0",
      "avisos dados por enviados según el registro: 512",
      "avisos pendientes: 512",
    ].join("\n"),
  },
  respuestaEsperada: {
    causa:
      "el registro escribe enviado sin mirar lo que devuelve el despacho: cuando la cola no " +
      "responde, despacha vuelve con la lista vacía y el aviso sigue pendiente con su mensaje puesto",
    evidencia: [
      "jobs/envia.js:registra.info(`avisos de ${tramo} enviados`)",
      "app/cola.js:la cola no responde: intento sin efecto",
      "metrics.txt:avisos salientes de la cola: 0",
    ],
    impacto:
      "quinientos doce avisos quedaron sin salir y el registro dice lo contrario, así que el fallo " +
      "no lo vio nadie hasta preguntar a un cliente",
    correccion:
      "mirar lo que devuelve el despacho y escribir en el registro lo que pasó de verdad, " +
      "contando los avisos que salieron y los que quedan",
    comoDetectarlo:
      "comparar cada noche lo que cuenta la cola con lo que dice el registro del envío",
  },
  conceptos: ["mensaje", "prueba", "compilador"],
  analizoEstandar: {
    idPaquete: "avisos-enviados-que-no-salen",
    quePaso:
      "el registro escribe enviado sin mirar lo que devuelve el despacho: cuando la cola no " +
      "responde, despacha vuelve con la lista vacía y el aviso sigue pendiente con su mensaje puesto",
    evidencia: [
      {
        ruta: "jobs/envia.js",
        afirmacion: "registra.info(`avisos de ${tramo} enviados`);",
      },
      {
        ruta: "app/cola.js",
        afirmacion: "la cola no responde: intento sin efecto",
      },
      { ruta: "metrics.txt", afirmacion: "avisos salientes de la cola: 0" },
    ],
    impacto:
      "quinientos doce avisos quedaron sin salir y el registro dice lo contrario, así que el fallo " +
      "no lo vio nadie hasta preguntar a un cliente",
    correccion:
      "mirar lo que devuelve el despacho y escribir en el registro lo que pasó de verdad, " +
      "contando los avisos que salieron y los que quedan",
    comoDetectarlo:
      "comparar cada noche lo que cuenta la cola con lo que dice el registro del envío",
  },
};

export const paquetesDeDatos = [valorNulo, estadoCorrupto, permisoDeMas, discrepanciaMensaje];

export const moduloIncidentesDatos = {
  manifiesto: {
    id: "incidentes-datos",
    tipo: "incidente",
    aporta: [
      "familia:valor-nulo",
      "familia:estado-corrupto",
      "familia:permiso-de-mas",
      "familia:discrepancia-mensaje",
    ],
    versionContrato: contratosDeModulo.incidente.version,
    necesita: ["contrato:4.6"],
  },
  contenido: paquetesDeDatos,
} as const satisfies Modulo<DefinicionIncidente[]>;
