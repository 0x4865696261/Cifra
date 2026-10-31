/**
 * El código del Worker de JavaScript (0.3.C) como fuente de texto.
 *
 * Vive como cadena porque el Worker se crea desde un Blob y no puede cargar módulos. Las
 * copias de `traza.ts` y de `limites.ts` están marcadas dentro de la fuente; las pruebas del
 * motor cruzan las dos versiones con los mismos programas.
 *
 * Lo que la fuente asume, no como límite accidental:
 * - la red se bloquea antes de ejecutar cualquier código del usuario;
 * - el DOM no existe en un Worker de navegador: no se añaden puentes;
 * - `console.log`, `warn`, `error`, `info` y `debug` caen en la captura de salida;
 * - los temporizadores quedan anotados y no corren: se anota en la salida que quedó
 *   trabajo sin ejecutar (decisión de la 0.3: el cuerpo se corre síncrono).
 */

export function codigoWorker(): string {
  return String.raw`
function aTexto(valor, tope) {
  // Copia de recortarValor en traza.ts: el worker corre como Blob sin módulos.
  var texto;
  if (valor === null) texto = "null";
  else if (valor === undefined) texto = "undefined";
  else if (typeof valor === "function") texto = "ƒ " + (valor.name || "anónima");
  else if (typeof valor === "object") {
    try {
      var serializado = JSON.stringify(valor);
      texto = serializado === undefined ? "[no serializable]" : serializado;
    } catch (e) {
      texto = "[no serializable]";
    }
  } else {
    texto = String(valor);
  }
  if (tope && texto.length > tope) return texto.slice(0, tope) + "…";
  return texto;
}

function bloquearRed(contexto) {
  // 0.3.C: fetch, XMLHttpRequest, WebSocket, importScripts y el resto de accesos a red se
  // sustituyen por una función que falla. En un Worker del navegador "contexto" es el propio
  // ámbito global; en los hilos de prueba se bloquea también globalThis, donde esos
  // identificadores son propiedades separadas. Un intento de red falla dentro del programa,
  // no fuera: nada sale a la red aunque el código lo pida.
  var nombres = ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts"];
  var sinRed = function () {
    throw new Error("La ejecución de Cifra corre sin acceso a red.");
  };
  var escenarios = [contexto, ambitoGlobal()];
  for (var e = 0; e < escenarios.length; e++) {
    var ambito = escenarios[e];
    if (!ambito) continue;
    for (var i = 0; i < nombres.length; i++) {
      try { ambito[nombres[i]] = sinRed; } catch (err) { /* alguno se lee solo: no es fatal */ }
    }
    try {
      var navegador = ambito.navigator;
      if (navegador) navegador.sendBeacon = sinRed;
    } catch (err) { /* idem */ }
  }
}

function ambitoGlobal() {
  return typeof globalThis === "undefined" ? null : globalThis;
}

function ahora() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function leerMemoria() {
  // Copia del contrato de 0.3: si el motor no ofrece lectura de heap, devuelve null y el
  // resultado lo dice (memoriaMBUsada ausente). No se simula un corte de memoria.
  if (typeof performance === "undefined") return null;
  if (!performance.memory || typeof performance.memory.usedJSHeapSize !== "number") return null;
  return performance.memory.usedJSHeapSize;
}

function motorActual() {
  var version = typeof navigator !== "undefined" && navigator.userAgent
    ? navigator.userAgent
    : "entorno-sin-navigator";
  return { nombre: "javascript", version: version };
}

self.onmessage = function (evento) {
  var mensaje = evento && evento.data ? evento.data : evento;
  if (!mensaje || mensaje.tipo !== "cifra-ejecutar") return;

  var solicitud = mensaje.solicitud;
  var limites = solicitud.limites || {};
  var topeValor = mensaje.topeValorTraza || 200;
  var trazar = !!solicitud.trazar;

  bloquearRed(self);

  var topeSalida = (limites.salidaKB || 0) * 1024;
  var salidaTexto = "";
  var salidaExcedida = false;

  function marcaCorteDeSalida() {
    var error = new Error("corte por salida excedida");
    error.esCorteDeSalida = true;
    return error;
  }

  function escribe(fragmento) {
    if (salidaExcedida) throw marcaCorteDeSalida();
    if (salidaTexto.length + fragmento.length > topeSalida) {
      salidaTexto = salidaTexto.slice(0, topeSalida);
      salidaExcedida = true;
      throw marcaCorteDeSalida();
    }
    salidaTexto += fragmento;
  }

  var consolaLocal = {};
  var nombresConsola = ["log", "info", "warn", "error", "debug"];
  for (var c = 0; c < nombresConsola.length; c++) {
    (function (nombre) {
      consolaLocal[nombre] = function () {
        var piezas = [];
        for (var k = 0; k < arguments.length; k++) {
          var parte = arguments[k];
          piezas.push(typeof parte === "string" ? parte : aTexto(parte, topeValor));
        }
        escribe(piezas.join(" ") + "\n");
      };
    })(nombresConsola[c]);
  }

  var temporizadores = 0;
  var retenerTemporizador = function () { temporizadores++; return 0; };
  var soltarTemporizador = function () {};
  var ambitosTemporizador = [self, ambitoGlobal()];
  for (var t = 0; t < ambitosTemporizador.length; t++) {
    var ambitoTemporizador = ambitosTemporizador[t];
    if (!ambitoTemporizador) continue;
    try {
      ambitoTemporizador.setTimeout = retenerTemporizador;
      ambitoTemporizador.setInterval = retenerTemporizador;
      ambitoTemporizador.clearTimeout = soltarTemporizador;
      ambitoTemporizador.clearInterval = soltarTemporizador;
    } catch (e) { /* si alguno no se puede escribir, queda el original: lo honesto */ }
  }

  var pasos = [];
  var trazaTruncada = false;
  var pasosTraza = limites.pasosTraza || 2000;

  function anota(eventoDeTraza, linea, variables) {
    if (pasos.length >= pasosTraza) {
      trazaTruncada = true;
      return;
    }
    pasos.push({ paso: pasos.length + 1, linea: linea, evento: eventoDeTraza, variables: variables });
  }

  var instrumento = {
    paso: function (linea, variablesVivas) {
      if (!trazar) return;
      var variables = {};
      if (variablesVivas) {
        for (var v = 0; v < variablesVivas.length; v++) {
          var dato = variablesVivas[v];
          try { variables[dato.nom] = aTexto(dato.val(), topeValor); } catch (e) { /* fuera de alcance */ }
        }
      }
      anota("linea", linea, variables);
    },
    retorno: function (linea, valor) {
      if (!trazar) return valor;
      anota("retorno", linea, { retorna: aTexto(valor, topeValor) });
      return valor;
    }
  };
  self._cifra = instrumento;

  var memoriaAntes = leerMemoria();
  var instanteInicial = ahora();
  var estado = "ok";
  var codigoSalida = 0;
  var stderr = "";
  // 0.3.D: en los tipos "retorno" y "propiedad" el código acaba en una expresión; el valor de
  // finalización de eval la devuelve. La salida sale por el mismo captador de consola; la red
  // ya está bloqueada y el corte por salida también rige aquí.
  var capturarValor = !!mensaje.capturarValor;
  var valorDevuelto;
  var tipoValor;

  try {
    if (capturarValor) {
      var console = consolaLocal;
      var resultadoDeEval = eval(solicitud.codigo);
      tipoValor = typeof resultadoDeEval;
      valorDevuelto = aTexto(resultadoDeEval, 4000);
    } else {
      // Si el código ya usa el prefijo del instrumento, se compila sin el parámetro: declarar un
      // propio _cifra chocaría con el parámetro y sería un error temprano de sintaxis.
      var cuerpo = mensaje.sinInstrumento
        ? new Function("console", solicitud.codigo)
        : new Function("_cifra", "console", solicitud.codigo);
      cuerpo(mensaje.sinInstrumento ? consolaLocal : instrumento, consolaLocal);
    }
  } catch (excepcion) {
    if (excepcion && excepcion.esCorteDeSalida) {
      estado = "salida-excedida";
      codigoSalida = 1;
      stderr = "La salida superó " + (limites.salidaKB || 0) + " KB (0.3.B) y la ejecución se cortó.";
    } else {
      estado = "error";
      codigoSalida = 1;
      if (excepcion) {
        stderr = aTexto(excepcion.stack || (excepcion.name + ": " + (excepcion.message || "")), 4000);
      } else {
        stderr = String(excepcion);
      }
      anota("excepcion", 0, { mensaje: aTexto(excepcion && excepcion.message || String(excepcion), topeValor) });
    }
  }

  var despues = leerMemoria();
  var memoriaMBUsada = memoriaAntes !== null && despues !== null
    ? Math.round(despues - memoriaAntes)
    : undefined;

  if (estado === "ok" && memoriaMBUsada !== undefined && memoriaMBUsada > limites.memoriaMB) {
    estado = "memoria";
    codigoSalida = 1;
    stderr = "El programa usó unas " + memoriaMBUsada + " MB de heap, más del límite de "
      + limites.memoriaMB + " MB (0.3.B).";
  }

  if (estado === "ok" && temporizadores > 0) {
    salidaTexto += "\nEl programa dejó " + temporizadores
      + " temporizador(es) sin correr: la ejecución acaba cuando el cuerpo acaba.";
  }
  if (estado === "ok" && salidaExcedida) {
    estado = "salida-excedida";
    codigoSalida = 1;
    stderr = "La salida superó " + (limites.salidaKB || 0) + " KB (0.3.B).";
  }

  var resultado = {
    estado: estado,
    stdout: salidaTexto,
    stderr: stderr,
    codigoSalida: codigoSalida,
    duracionMs: ahora() - instanteInicial,
    traza: trazar ? pasos : undefined,
    trazaTruncada: trazar ? trazaTruncada : undefined,
    memoriaMBUsada: memoriaMBUsada,
    valorDevuelto: capturarValor ? valorDevuelto : undefined,
    tipoValor: capturarValor ? tipoValor : undefined,
    motor: motorActual()
  };
  self.postMessage({ tipo: "cifra-resultado", resultado: resultado });
};
`;
}
