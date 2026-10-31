import type { RunRequest, RunResult, TestResult, TestSpec } from "./tipos.ts";
import { instrumentar } from "./instrumentar.ts";
import { correrPorTransporte, noSoportado, type Transporte, transporteWorker } from "./motor-javascript.ts";
import { codigoWorker } from "./worker-javascript.ts";

/**
 * Ejecutor de pruebas (0.3.D, tarea 4).
 *
 * Recibe un `RunRequest` con `pruebas` y devuelve un `RunResult` con un `TestResult` por cada
 * una. La comparación vive en un solo sitio (`sonIguales`): igualdad estricta por defecto, con
 * la `tolerancia?` de `TestSpec` para números con decimales.
 *
 * - `salida` compara lo que el programa escribió con `esperado`.
 * - `retorno` y `propiedad` evalúan la expresión final del programa: el worker corre `eval` y
 *   manda el valor de finalización (`propiedad` exige que sea booleano).
 *
 * Cada prueba corre aislada de las demás: su propia corrida, su propio Worker y su propio corte
 * por tiempo. El fallo, el bucle sin fin o la salida enorme de una no tumba al resto. El
 * veredicto del reto sale de aquí: `todasPasadas` es la única puerta para dar un reto por
 * superado. Lo que se muestra de cada prueba (`visible: false`) es decisión de la interfaz.
 */

type ResultadoConValor = RunResult & { valorDevuelto?: string; tipoValor?: string };

/** Convierte el `esperado` (número, booleano, texto) al texto con el que se compara. */
export function textoDe(valor: unknown): string {
  if (typeof valor === "string") return valor;
  if (typeof valor === "number" || typeof valor === "boolean") return String(valor);
  if (valor === null) return "null";
  if (valor === undefined) return "undefined";
  try {
    const serializado = JSON.stringify(valor);
    return serializado === undefined ? String(valor) : serializado;
  } catch {
    return String(valor);
  }
}

/** El único sitio donde se decide si dos resultados coinciden (0.3.D). */
export function sonIguales(obtenido: string, esperado: string, tolerancia?: number): boolean {
  if (obtenido === esperado) return true;
  if (tolerancia === undefined || tolerancia === null) return false;
  const numeroObtenido = Number(obtenido.trim());
  const numeroEsperado = Number(esperado.trim());
  if (!Number.isFinite(numeroObtenido) || !Number.isFinite(numeroEsperado)) return false;
  return Math.abs(numeroObtenido - numeroEsperado) <= tolerancia;
}

const noPasoMotor: RunResult["motor"] = { nombre: "javascript", version: "n/d" };

export async function correrPruebasJavaScript(solicitud: RunRequest): Promise<RunResult> {
  const navegadorSinWorker =
    typeof Worker === "undefined" || typeof URL?.createObjectURL !== "function";
  if (navegadorSinWorker) {
    return noSoportado(
      "Las pruebas se ejecutan en un Worker del navegador: aquí no está disponible.",
    );
  }
  const url = URL.createObjectURL(new Blob([codigoWorker()], { type: "text/javascript" }));
  try {
    return await correrPruebasPorTransporte(transporteWorker(url), solicitud);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function correrPruebasPorTransporte(
  crearTransporte: () => Transporte,
  solicitud: RunRequest,
): Promise<RunResult> {
  const inicio = performance.now();
  const pruebas = solicitud.pruebas ?? [];
  const instrumentado = instrumentar(solicitud.codigo, { trazar: false });
  const codigoEnviado = instrumentado.codigo;
  const sinInstrumento = !instrumentado.instrumentable;

  const resultados: TestResult[] = [];
  let estadoGlobal: RunResult["estado"] = "ok";
  let stdoutVisto = "";
  let stderrVisto = "";
  let motor: RunResult["motor"] = noPasoMotor;

  for (const prueba of pruebas) {
    // Una corrida por prueba: la de `salida` captures la salida; `retorno` y `propiedad`
    // piden al worker el valor de finalización de la expresión final (con el código original:
    // no hace falta instrumento cuando no hay traza y menos choques con un programa que usa
    // el prefijo).
    const capturaValor = prueba.tipo !== "salida";
    const intento = (await correrPorTransporte(
      crearTransporte,
      solicitud,
      capturaValor ? solicitud.codigo : codigoEnviado,
      !capturaValor && sinInstrumento,
      capturaValor,
    )) as ResultadoConValor;

    if (resultados.length === 0) {
      stdoutVisto = intento.stdout;
      stderrVisto = intento.stderr;
    }
    motor = intento.motor;
    if (intento.estado !== "ok" && estadoGlobal === "ok") estadoGlobal = intento.estado;
    resultados.push(juzgar(prueba, intento));
  }

  // El conjunto manda: el veredicto sale de las pruebas, no de un solo intento. `estado`
  // refleja la ejecución del programa; las pruebas cuentan cómo fue cada comparación.
  return {
    estado: estadoGlobal,
    stdout: stdoutVisto,
    stderr: stderrVisto,
    codigoSalida: estadoGlobal === "ok" ? 0 : 1,
    duracionMs: Math.round(performance.now() - inicio),
    pruebas: resultados,
    motor,
    origen: "ejecucion-real",
  };
}

/** Un veredicto vale cuando la lista existe, tiene pruebas y todas pasaron. */
export function todasPasadas(resultado: RunResult): boolean {
  const lista = resultado.pruebas;
  if (!lista || lista.length === 0) return false;
  return lista.every((prueba) => prueba.pasada);
}

function juzgar(prueba: TestSpec, intento: ResultadoConValor): TestResult {
  const esperadoTexto = textoDe(prueba.esperado);

  // La corrida no acabó en ok (error, corte de tiempo, salida enorme...): la prueba cae con
  // lo que se supo ver y el motivo, y ninguna parte del sistema puede inventarla como pasada.
  if (intento.estado !== "ok") {
    return {
      id: prueba.id,
      pasada: false,
      obtenido: prueba.tipo === "salida" ? intento.stdout : intento.valorDevuelto,
      esperado: esperadoTexto,
      error: `la ejecución acabó en estado "${intento.estado}"` + (intento.stderr ? `: ${intento.stderr}` : ""),
    };
  }

  switch (prueba.tipo) {
    case "salida": {
      const obtenido = intento.stdout;
      return {
        id: prueba.id,
        pasada: sonIguales(obtenido, esperadoTexto, prueba.tolerancia),
        obtenido,
        esperado: esperadoTexto,
      };
    }
    case "propiedad": {
      const obtenido = intento.valorDevuelto ?? "undefined";
      if (intento.tipoValor !== "boolean") {
        return {
          id: prueba.id,
          pasada: false,
          obtenido,
          esperado: esperadoTexto,
          error: `la expresión final acabó en ${intento.tipoValor ?? "n/d"}, no en booleano`,
        };
      }
      return {
        id: prueba.id,
        pasada: sonIguales(obtenido, esperadoTexto, prueba.tolerancia),
        obtenido,
        esperado: esperadoTexto,
      };
    }
    default: {
      const obtenido = intento.valorDevuelto ?? "undefined";
      return {
        id: prueba.id,
        pasada: sonIguales(obtenido, esperadoTexto, prueba.tolerancia),
        obtenido,
        esperado: esperadoTexto,
      };
    }
  }
}
