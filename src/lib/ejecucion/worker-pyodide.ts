/**
 * El código del Worker de Pyodide (0.3.C: Python) como fuente de texto.
 *
 * Vive como cadena porque el Worker se crea desde un Blob. Lo que este Worker garantiza:
 * - Pyodide se carga por CDN (jsDelivr) bajo demanda en la primera ejecución, no como
 *   dependencia de npm: el resto de la web ya necesita red y el árbol no carga cientos de MB;
 * - la lista de paquetes queda cerrada a la biblioteca estándar: no se llama a
 *   `loadPackagesFromImports`, así que ningún paquete de terceros está instalado y un `import`
 *   que no sea stdlib falla con ModuleNotFoundError, tal como es;
 * - la salida de stdout/stderr se captura con el mismo tope de 0.3.B: al superarla, la salida
 *   se recorta, se marca el aviso y el programa sigue hasta que acaba o lo corta el tiempo;
 * - el trazo usa `sys.settrace` del intérprete: cada línea de Python envía a la web su línea y
 *   sus variables locales como texto (repr, ya recortado);
 * - la memoria no se mide con este runtime: `memoriaMBUsada` queda ausente y así se dice, sin
 *   simular un corte.
 *
 * IMPORTANTE para editar: la fuente es una plantilla String.raw — nada de comillas invertidas
 * ni ${ dentro del cuerpo del worker.
 */

export function codigoWorkerPyodide(): string {
  return String.raw`
var CDN_PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
var INDICE_PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
var version_pyodide = "0.26.4";

var pyodide = null;
var cargando = null;

function cargarPyodide() {
  if (pyodide) return Promise.resolve(pyodide);
  if (cargando) return cargando;
  cargando = new Promise(function (resolverSinFalla, rechazar) {
    try {
      importScripts(CDN_PYODIDE);
      Promise.resolve(self.loadPyodide({ indexURL: INDICE_PYODIDE })).then(function (instancia) {
        pyodide = instancia;
        resolverSinFalla(instancia);
      }, rechazar);
    } catch (causa) {
      rechazar(causa);
    }
  });
  return cargando;
}

function aTexto(valor, tope) {
  var texto;
  if (valor === null) texto = "null";
  else if (valor === undefined) texto = "undefined";
  else {
    try { texto = String(valor); } catch (e) { texto = "[sin texto]"; }
  }
  if (tope && texto.length > tope) return texto.slice(0, tope) + "…";
  return texto;
}

function motorActual() {
  return { nombre: "python", version: "Pyodide/" + version_pyodide };
}

// La misma puerta que el worker de JavaScript: envía el resultado al final, pase lo que pase.
self.onmessage = function (evento) {
  var mensaje = evento && evento.data ? evento.data : evento;
  if (!mensaje || mensaje.tipo !== "cifra-ejecutar") return;
  if (!mensaje.solicitud || mensaje.solicitud.lenguaje !== "python") return;
  correr(mensaje).catch(function (causa) {
    self.postMessage({
      tipo: "cifra-resultado",
      resultado: {
        estado: "error",
        stdout: "",
        stderr: asunto(causa),
        codigoSalida: 1,
        duracionMs: 0,
        traza: undefined,
        trazaTruncada: undefined,
        memoriaMBUsada: undefined,
        motor: motorActual()
      }
    });
  });
};

function asunto(causa) {
  return causa && causa.stack ? String(causa.stack).slice(0, 4000) : String(causa);
}

// El prefijo de trazo: una pitón-pitón función que dice la línea y sus variables locales.
// Vive como texto para que la complitación run puerto la pegue delante del programa.
var prefijo_traza = [
  "import sys, json, js",
  "def _cifra_digiere(valor):",
  "    try:",
  "        return repr(valor)",
  "    except BaseException:",
  "        return \"<sin texto>\"",
  "def _cifra_traza(marco, evento, argumento):",
  "    if evento == \"line\":",
  "        variables = {}",
  "        try:",
  "            piezas = marco.f_locals.items()",
  "            for nombre, valor in piezas:",
  "                variables[nombre] = _cifra_digiere(valor)",
  "        except BaseException:",
  "            variables = {}",
  "        js._cifraLinea(marco.f_lineno, json.dumps(variables))",
  "    return _cifra_traza",
  "def _cifra_aplanar():",
  "    sys.settrace(_cifra_traza)",
  "_cifra_aplanar()"
].join("\n");

async function correr(mensaje) {
  var solicitud = mensaje.solicitud;
  var limites = solicitud.limites || {};
  var topeValor = mensaje.topeValorTraza || 200;
  var trazar = !!solicitud.trazar;
  var pasosTraza = limites.pasosTraza || 2000;

  var pasos = [];
  var trazaTruncada = false;
  function anota(linea, variablesJson) {
    if (pasos.length >= pasosTraza) { trazaTruncada = true; return; }
    var variables = {};
    try { variables = JSON.parse(variablesJson); } catch (e) { variables = {}; }
    for (var clave in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, clave)) {
        variables[clave] = aTexto(variables[clave], topeValor);
      }
    }
    pasos.push({ paso: pasos.length + 1, linea: linea, evento: "linea", variables: variables });
  }
  self._cifraLinea = function (linea, variablesJson) { anota(linea, variablesJson); };

  var topeSalida = (limites.salidaKB || 0) * 1024;
  var salidaTexto = "";
  var salidaExcedida = false;
  var stderrTexto = "";
  var stderrExcedida = false;
  function destina(fonte, fragmento, alTope) {
    if (alTope()) return fragmento;
    if (fonte.length + fragmento.length > topeSalida) {
      return fragmento.slice(0, Math.max(0, topeSalida - fonte.length));
    }
    return fragmento;
  }
  var verdaderoSalida = function (fragmento) {
    var trozo = destina(salidaTexto, String(fragmento), function () { return salidaExcedida; });
    if (salidaTexto.length + trozo.length > topeSalida) salidaExcedida = true;
    salidaTexto += trozo;
  };
  var verdaderoErr = function (fragmento) {
    var trozo = destina(stderrTexto, String(fragmento), function () { return stderrExcedida; });
    if (stderrTexto.length + trozo.length > topeSalida) stderrExcedida = true;
    stderrTexto += trozo;
  };

  var instanteInicial = Date.now();
  var estado = "ok";
  var codigoSalida = 0;
  var stderr = "";

  try {
    var instancia = await cargarPyodide();
    // Capturas de salida por el run de Pyodide: las líneas van juntas ("batched").
    instancia.setStdout({ batched: verdaderoSalida });
    instancia.setStderr({ batched: verdaderoErr });
    if (trazar) {
      instancia.runPython(prefijo_traza);
    }
    await instancia.runPythonAsync(solicitud.codigo);
    if (trazar) {
      try { instancia.runPython("sys.settrace(None)"); } catch (causa) { /* la traza ya sirvió */ }
    }
  } catch (excepcion) {
    estado = "error";
    codigoSalida = 1;
    stderr = asunto(excepcion);
  }

  if (estado === "ok" && salidaExcedida) {
    estado = "salida-excedida";
    codigoSalida = 1;
    stderr = "La salida superó " + (limites.salidaKB || 0) + " KB (0.3.B) y la salida queda recortada.";
  }

  var resultado = {
    estado: estado,
    stdout: salidaTexto,
    stderr: stderr,
    codigoSalida: codigoSalida,
    duracionMs: Date.now() - instanteInicial,
    traza: trazar ? pasos : undefined,
    trazaTruncada: trazar ? trazaTruncada : undefined,
    memoriaMBUsada: undefined, // Pyodide no expone el heap del usuario: ausente y honesto
    motor: motorActual()
  };
  self.postMessage({ tipo: "cifra-resultado", resultado: resultado });
}
`;
}
