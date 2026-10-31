/**
 * Instrumenta JavaScript para la traza paso a paso (0.3.E).
 *
 * Inserta una llamada del instrumento antes de cada sentencia con un escáner propio que salta
 * cadenas, comentarios, plantillas y literales de expresión regular. Las inserciones van en
 * línea: el fichero no cambia de número de líneas, así la pila de un error sigue apuntando al
 * código original. Los valores de las variables se leen con cierres creados en el propio punto
 * de la sentencia: leen los nombres como están en ese momento, y los que quedan fuera de
 * alcance fallan al evaluarlos y se descartan, nunca se inventan.
 *
 * Lo que no instrumenta, así queda (no es un defecto accidental):
 * - la primera sentencia de cada `case` de un `switch` y las propiedades de objetos y clases;
 * - la desestructuración no saca nombres, así que esas variables no aparecen en la traza;
 * - funciones de bloque dentro de la expresión de una plantilla no se trazan.
 *
 * Supuestos didácticos del código de entrada: el código es JavaScript síncrono de tamaño de
 * ejercicio. Los saltos de línea que separan sentencias se resuelven con una heurística
 * sencilla de ASI (la expresión sigue si la línea acaba en un operador o la siguiente empieza
 * con `.`); un código que juegue en contra de esa heurística puede terminar sin todas las
 * marcas de traza, pero nunca con código roto: si algo no se comprende, no se anota ahí.
 *
 * Si el código pegado ya usa el prefijo del instrumento, se ejecuta sin instrumentar para no
 * ensuciar con un nombre que colisione.
 */

export const prefijoInstrumento = "_cifra";

export type Instrumentado = { codigo: string; instrumentable: boolean };

export function instrumentar(codigo: string, opciones: { trazar: boolean }): Instrumentado {
  if (new RegExp(`\\b${prefijoInstrumento}\\b`).test(codigo)) {
    return { codigo, instrumentable: false };
  }
  if (!codigo.trim()) return { codigo, instrumentable: true };

  const escaneo = escanear(codigo, opciones.trazar);
  const nombres = nombresDeclarados(codigo);
  const capturas = opciones.trazar
    ? nombres.map((nombre) => `{nom:${JSON.stringify(nombre)},val:()=>${nombre}}`).join(",")
    : "";
  const apunte = (linea: number) =>
    opciones.trazar
      ? `${prefijoInstrumento}.paso(${linea},[${capturas}]);`
      : `${prefijoInstrumento}.paso(${linea},[]);`;

  const cambios: Editar[] = [];
  for (const marca of escaneo.sentencias) {
    cambios.push({ en: marca.pos, texto: apunte(marca.linea), orden: 0 });
  }
  for (const retorno of escaneo.retornos) {
    cambios.push({ en: retorno.pos, texto: ` ${prefijoInstrumento}.retorno(${retorno.linea},`, orden: 1 });
    cambios.push({ en: retorno.fin, texto: ")", orden: 1 });
  }
  for (const envoltorio of escaneo.envoltorios) {
    cambios.push({ en: envoltorio.abrirEn, texto: `{${apunte(envoltorio.linea)}`, orden: 0 });
    cambios.push({ en: envoltorio.cerrarEn, texto: "}", orden: 2 });
  }

  return { codigo: aplicar(codigo, cambios), instrumentable: true };
}

type Editar = { en: number; texto: string; orden: number };
type Sentencia = { pos: number; linea: number };
type Retorno = { pos: number; fin: number; linea: number };
type Envoltorio = { abrirEn: number; cerrarEn: number; linea: number };

type Escaneo = {
  sentencias: Sentencia[];
  retornos: Retorno[];
  envoltorios: Envoltorio[];
};

function aplicar(codigo: string, cambios: Editar[]): string {
  cambios.sort((a, b) => a.en - b.en || a.orden - b.orden);
  let cursor = 0;
  let resultado = "";
  for (const cambio of cambios) {
    resultado += codigo.slice(cursor, cambio.en) + cambio.texto;
    cursor = cambio.en;
  }
  return resultado + codigo.slice(cursor);
}

const palabrasControl = new Set(["if", "for", "while", "switch", "catch"]);
const cuerpoQueNoSeEnvuelve = new Set(["do", "switch"]);
const bloqueadoresDeSentencia = new Set(["else", "catch", "finally", "while", "case", "default"]);
const palabrasRegex = new Set(["return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "case", "do", "else", "yield", "await", "throw"]);
const contextosRegex = new Set([
  "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "^", "<", ">", "~",
]);
const reservadas = new Set([
  "if", "else", "for", "while", "do", "switch", "case", "default", "break", "continue",
  "return", "function", "class", "extends", "new", "delete", "typeof", "instanceof",
  "in", "of", "void", "this", "super", "try", "catch", "finally", "throw", "let",
  "const", "var", "await", "async", "yield", "true", "false", "null", "undefined",
]);

type Palabra = { palabra: string; inicio: number; fin: number };

function palabraAnterior(texto: string, i: number): Palabra | null {
  let j = i - 1;
  while (j >= 0 && /\s/.test(texto[j])) j--;
  if (j < 0) return null;
  if (!/[A-Za-z0-9_$]/.test(texto[j])) {
    return { palabra: "", inicio: j, fin: j + 1 };
  }
  const fin = j + 1;
  while (j >= 0 && /[A-Za-z0-9_$]/.test(texto[j])) j--;
  return { palabra: texto.slice(j + 1, fin), inicio: j + 1, fin };
}

function palabraEn(texto: string, i: number): Palabra | null {
  if (!/[A-Za-z_$]/.test(texto[i] || "")) return null;
  let fin = i;
  while (fin < texto.length && /[A-Za-z0-9_$]/.test(texto[fin])) fin++;
  return { palabra: texto.slice(i, fin), inicio: i, fin };
}

function siguienteSignificativo(texto: string, desde: number): number {
  let i = desde;
  while (i < texto.length) {
    if (texto.startsWith("//", i)) {
      const fin = texto.indexOf("\n", i);
      i = fin === -1 ? texto.length : fin + 1;
      continue;
    }
    if (texto.startsWith("/*", i)) {
      const fin = texto.indexOf("*/", i + 2);
      i = fin === -1 ? texto.length : fin + 2;
      continue;
    }
    if (/\s/.test(texto[i])) {
      i++;
      continue;
    }
    break;
  }
  return i;
}

/** Longitud de un literal de expresión regular en `i`, o null si ahí hay una división. */
function abarcaLiteralRegex(texto: string, i: number): number | null {
  const anterior = palabraAnterior(texto, i);
  let admite = anterior === null;
  if (anterior) {
    if (anterior.palabra) {
      admite = palabrasRegex.has(anterior.palabra) || anterior.palabra === "";
    } else {
      admite = contextosRegex.has(texto[anterior.inicio] ?? "");
    }
  }
  if (!admite) return null;

  let j = i + 1;
  let enClase = false;
  while (j < texto.length) {
    const ch = texto[j];
    if (ch === "\\") {
      j += 2;
      continue;
    }
    if (ch === "\n") return null;
    if (ch === "[") enClase = true;
    else if (ch === "]") enClase = false;
    else if (ch === "/" && !enClase) break;
    j++;
  }
  if (j >= texto.length) return null;
  j++;
  while (j < texto.length && /[a-z]/.test(texto[j])) j++;
  return j;
}

function claseDeLlave(texto: string, i: number): "bloque" | "literal" {
  const anterior = palabraAnterior(texto, i);
  if (anterior === null) return "bloque";
  if (anterior.palabra) {
    if (["else", "try", "finally", "do"].includes(anterior.palabra)) return "bloque";
    // `class Foo {`: body de clase se trata como literal para no instrumentar sus miembros.
    const palabraDos = palabraAnterior(texto, anterior.inicio);
    if (palabraDos?.palabra === "class") return "literal";
    return "bloque";
  }
  const ch = texto[anterior.inicio] ?? "";
  if (ch === ")") return "bloque";
  const par = texto.slice(anterior.inicio - 1, anterior.inicio + 1);
  if (par === "=>") return "bloque";
  if ([";", "{", "}"].includes(ch)) {
    // `{` tras `{` gana el literal: object anidados son lo didáctico frecuente.
    return ch === "{" ? "literal" : "bloque";
  }
  return "literal";
}

function numeroDeSaltos(texto: string): number[] {
  const total = texto.length;
  const saltos = new Array<number>(total + 1);
  saltos[0] = 0;
  for (let i = 0; i < total; i++) {
    saltos[i + 1] = saltos[i] + (texto[i] === "\n" ? 1 : 0);
  }
  return saltos;
}

type Profundidades = { paren: number; corchete: number; llave: number };

/**
 * ¿Se sigue la misma sentencia tras el salto que está en `iSalto`? Heurística didáctica de
 * ASI: la expresión sigue si la línea acaba en un operador que no cierra nada, o si la
 * siguiente empieza con `.` (cadena de llamadas). No es un analizador completo: es lo que la
 * traza necesita para no cortar a mitad de expresión.
 */
function saltoContinua(texto: string, iSalto: number): boolean {
  let prev = iSalto - 1;
  while (prev >= 0 && /\s/.test(texto[prev])) prev--;
  const prevChar = texto[prev] ?? "";
  if (["(", "[", ",", "=", "<", ">", "!", "?", ":", "&", "|", "+", "-", "*", "/", "%", "^"].includes(prevChar)) {
    return true;
  }
  let sig = iSalto + 1;
  while (sig < texto.length && /\s/.test(texto[sig])) sig++;
  return texto[sig] === ".";
}

/** Escanea desde `desde` y devuelve el índice del primer carácter donde `paro` diga basta. */
function escanearHasta(texto: string, desde: number, paro: (ch: string, i: number, d: Profundidades) => boolean): number {
  let i = desde;
  const d: Profundidades = { paren: 0, corchete: 0, llave: 0 };
  while (i < texto.length) {
    if (texto.startsWith("//", i)) {
      const fin = texto.indexOf("\n", i);
      if (fin === -1) return texto.length;
      i = fin;
      continue;
    }
    if (texto.startsWith("/*", i)) {
      const fin = texto.indexOf("*/", i + 2);
      if (fin === -1) return texto.length;
      i = fin + 2;
      continue;
    }
    const ch = texto[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      let j = i + 1;
      while (j < texto.length) {
        if (texto[j] === "\\") {
          j += 2;
          continue;
        }
        if (ch === "`" && texto[j] === "$" && texto[j + 1] === "{") {
          const finExpresion = escanearHasta(
            texto,
            j + 2,
            (car, _i, prof) =>
              car === "}" &&
              prof.paren === 0 &&
              prof.corchete === 0 &&
              prof.llave === 0,
          );
          if (finExpresion >= texto.length) return texto.length;
          j = finExpresion + 1;
          continue;
        }
        if (ch === "`" && texto[j] === "`") break;
        if (ch !== "`" && texto[j] === ch) break;
        j++;
      }
      i = j + 1;
      continue;
    }
    if (ch === "/" && texto.startsWith("/*", i)) {
      const fin = texto.indexOf("*/", i + 2);
      if (fin === -1) return texto.length;
      i = fin + 2;
      continue;
    }
    if (ch === "/" && texto.startsWith("//", i)) {
      const fin = texto.indexOf("\n", i);
      if (fin === -1) return texto.length;
      i = fin;
      continue;
    }
    if (ch === "/") {
      const literal = abarcaLiteralRegex(texto, i);
      if (literal !== null) {
        i = literal;
        continue;
      }
    }
    if (paro(ch, i, d)) return i;
    if (ch === "(") d.paren++;
    if (ch === "[") d.corchete++;
    if (ch === "{") d.llave++;
    if (ch === ")") d.paren--;
    if (ch === "]") d.corchete--;
    if (ch === "}") d.llave--;
    i++;
  }
  return texto.length;
}

/** Dónde acaba una «sentencia simple» que empieza en `desde`, para envolverla entre llaves. */
function finDeSentencia(texto: string, desde: number): number {
  if (!/[A-Za-z0-9_$.["'`]/.test(texto[desde] ?? "")) return -1;
  if (texto[desde] === "{") {
    // Un `{` en posición de cuerpo abre un bloque: el `}` que lo cierra ve la llave a nivel 1.
    const cierre = escanearHasta(texto, desde, (ch, _i, d) => ch === "}" && d.llave === 1);
    if (cierre >= texto.length) return -1;
    const post = siguienteSignificativo(texto, cierre + 1);
    return texto[post] === ";" ? post + 1 : cierre + 1;
  }
  const paro = (ch: string, i: number, d: Profundidades): boolean => {
    if (ch === ";") return true;
    if (ch === "\n" && d.paren === 0 && d.corchete === 0 && d.llave === 0) {
      return !saltoContinua(texto, i);
    }
    if (ch === "}" && d.paren === 0 && d.corchete === 0 && d.llave === 0) return true;
    if (ch === ")" && d.paren === 0) return true;
    if (ch === "]" && d.corchete === 0) return true;
    return false;
  };
  const fin = escanearHasta(texto, desde, paro);
  if (fin > desde && texto[fin] === ";") return fin + 1;
  return fin > desde ? fin : -1;
}

/** Dónde acaba la expresión tras `return`, sin consumir el `;` que la cierra. */
function finDeExpresion(texto: string, desde: number): number {
  const paro = (ch: string, i: number, d: Profundidades): boolean => {
    if (ch === ";") return true;
    if (ch === ")" && d.paren === 0) return true;
    if (ch === "]" && d.corchete === 0) return true;
    if (ch === "}" && d.llave === 0) return true;
    if (ch === "\n" && d.paren === 0 && d.corchete === 0 && d.llave === 0) {
      return !saltoContinua(texto, i);
    }
    return false;
  };
  return escanearHasta(texto, desde, paro);
}

function escanear(codigo: string, trazar: boolean): Escaneo {
  const saltos = numeroDeSaltos(codigo);
  const lineaDe = (pos: number) => saltos[Math.min(pos, saltos.length - 1)] + 1;

  const sentencias: Sentencia[] = [];
  const retornos: Retorno[] = [];
  const envoltorios: Envoltorio[] = [];
  const puestos = new Set<number>();
  const pilaLlaves: Array<"bloque" | "literal" | "plantilla"> = [];
  const pilaSignos: Array<"ctrl" | "abre" | "corchete"> = [];
  let enCadena: "'" | '"' | "`" | null = null;
  let anterior = -1; // índice del último char de código consumido

  // Dentro de la expresión de una plantilla no hay sentencias: anotar ahí rompería el código.
  const dentroDePlantilla = () => pilaLlaves.includes("plantilla");

  // ¿Estamos donde puede empezar una sentencia? Fuera de paréntesis y corchetes, con el
  // último marco siendo un bloque (o nada): en un objeto literal las propiedades no son sentencias.
  const enPosicionDeSentencia = () =>
    pilaSignos.length === 0 &&
    !dentroDePlantilla() &&
    (pilaLlaves.length === 0 || pilaLlaves[pilaLlaves.length - 1] === "bloque");

  // Sentencias solo fuera de paréntesis y corchetes; el cuerpo de una función, en cambio,
  // puede vivir dentro de argumentos (`nombres.map((n) => { return ... })`).
  const enCuerpoDeBloque = () =>
    !dentroDePlantilla() &&
    (pilaLlaves.length === 0 || pilaLlaves[pilaLlaves.length - 1] === "bloque");

  const anunciar = (desde: number) => {
    if (desde >= codigo.length || puestos.has(desde) || dentroDePlantilla()) return;
    if (!empiezaSentencia(codigo, desde)) return;
    puestos.add(desde);
    sentencias.push({ pos: desde, linea: lineaDe(desde) });
  };

  const envolver = (desde: number) => {
    if (desde >= codigo.length || puestos.has(desde) || dentroDePlantilla()) return;
    if (!enPosicionDeSentencia()) return;
    const palabra = palabraEn(codigo, desde)?.palabra ?? "";
    if (cuerpoQueNoSeEnvuelve.has(palabra)) return;
    const fin = finDeSentencia(codigo, desde);
    if (fin <= desde) return;
    puestos.add(desde);
    envoltorios.push({ abrirEn: desde, cerrarEn: fin, linea: lineaDe(desde) });
  };

  function empiezaSentencia(texto: string, pos: number): boolean {
    const ch = texto[pos];
    if (ch === "{" || ch === "[") return true;
    const palabra = palabraEn(texto, pos);
    if (palabra) return !bloqueadoresDeSentencia.has(palabra.palabra);
    return false;
  }

  const primer = siguienteSignificativo(codigo, 0);
  if (primer < codigo.length) anunciar(primer);

  for (let i = 0; i < codigo.length; ) {
    const ch = codigo[i];

    if (enCadena !== null) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (enCadena === "`") {
        if (ch === "`") {
          enCadena = null;
          anterior = i;
          i++;
          continue;
        }
        if (ch === "$" && codigo[i + 1] === "{") {
          pilaLlaves.push("plantilla");
          i += 2;
          continue;
        }
      }
      if (ch === enCadena) {
        enCadena = null;
        anterior = i;
      }
      i++;
      continue;
    }

    if (ch === "/" && codigo.startsWith("//", i)) {
      const fin = codigo.indexOf("\n", i);
      if (fin === -1) break;
      i = fin + 1;
      continue;
    }
    if (ch === "/" && codigo.startsWith("/*", i)) {
      const fin = codigo.indexOf("*/", i + 2);
      if (fin === -1) break;
      i = fin + 2;
      continue;
    }
    if (ch === "/") {
      const literal = abarcaLiteralRegex(codigo, i);
      if (literal !== null) {
        i = literal;
        anterior = literal - 1;
        continue;
      }
      anterior = i;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      enCadena = ch;
      anterior = i;
      i++;
      continue;
    }

    if (/[A-Za-z_$]/.test(ch)) {
      const palabra = palabraEn(codigo, i)!;
      const trasSigno = anterior >= 0 && (codigo[anterior] === "." || codigo[anterior] === "?");
      if (!trasSigno && enCuerpoDeBloque() && enCadena === null) {
        if (palabra.palabra === "return" && trazar) {
          const arranque = siguienteSignificativo(codigo, palabra.fin);
          const fin = finDeExpresion(codigo, arranque);
          if (fin > arranque) {
            retornos.push({ pos: palabra.fin, fin, linea: lineaDe(i) });
          }
        }
        if (palabra.palabra === "else" || palabra.palabra === "do") {
          if (!enPosicionDeSentencia()) {
            anterior = palabra.fin - 1;
            i = palabra.fin;
            continue;
          }
          const prox = siguienteSignificativo(codigo, palabra.fin);
          const palabraProx = palabraEn(codigo, prox)?.palabra ?? "";
          const salta = palabra.palabra === "else" && (palabraProx === "if" || codigo[prox] === "{");
          if (codigo[prox] !== "{" && !salta && codigo[prox] !== ";") {
            envolver(prox);
          }
        }
      }
      anterior = palabra.fin - 1;
      i = palabra.fin;
      continue;
    }

    if (ch === "{") {
      const clase = claseDeLlave(codigo, i);
      pilaLlaves.push(clase);
      if (clase === "bloque") anunciar(siguienteSignificativo(codigo, i + 1));
      anterior = i;
      i++;
      continue;
    }
    if (ch === "}") {
      const marco = pilaLlaves.pop();
      if (marco === "plantilla") {
        enCadena = "`";
        i++;
        continue;
      }
      if (marco === "bloque") {
        const prox = siguienteSignificativo(codigo, i + 1);
        anunciar(prox);
      }
      anterior = i;
      i++;
      continue;
    }
    if (ch === "(") {
      const cabecera = esCabeceraDeControl(codigo, i);
      pilaSignos.push(cabecera ? "ctrl" : "abre");
      anterior = i;
      i++;
      continue;
    }
    if (ch === ")") {
      const marco = pilaSignos.pop();
      if (marco === "ctrl") {
        const prox = siguienteSignificativo(codigo, i + 1);
        if (codigo[prox] !== "{" && codigo[prox] !== ";") {
          envolver(prox);
        }
      }
      anterior = i;
      i++;
      continue;
    }
    if (ch === "[") {
      pilaSignos.push("corchete");
      anterior = i;
      i++;
      continue;
    }
    if (ch === "]") {
      pilaSignos.pop();
      anterior = i;
      i++;
      continue;
    }
    if (ch === ";") {
      const marco = pilaSignos[pilaSignos.length - 1];
      // En las cabeceras de `for (a; b; c)` el `;` es separador, no final de sentencia.
      if (marco !== "ctrl" && marco !== "corchete") {
        anunciar(siguienteSignificativo(codigo, i + 1));
      }
      anterior = i;
      i++;
      continue;
    }

    if (ch === "\n" && enPosicionDeSentencia() && !saltoContinua(codigo, i)) {
      anunciar(siguienteSignificativo(codigo, i + 1));
    }

    anterior = i;
    i++;
  }

  return { sentencias, retornos, envoltorios };
}

function esCabeceraDeControl(codigo: string, i: number): boolean {
  const anterior = palabraAnterior(codigo, i);
  if (anterior?.palabra && palabrasControl.has(anterior.palabra)) return true;
  if (anterior?.palabra === "await") {
    const previa = palabraAnterior(codigo, anterior.inicio);
    return !!previa?.palabra && palabrasControl.has(previa.palabra);
  }
  return false;
}

/** Nombres que el instrumento puede capturar en la traza, en orden de aparición. */
function nombresDeclarados(codigo: string): string[] {
  const nombres = new Set<string>();
  const añadir = (candidato: string | undefined) => {
    if (!candidato) return;
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(candidato)) return;
    if (reservadas.has(candidato) || candidato === prefijoInstrumento) return;
    nombres.add(candidato);
  };

  const patrones: RegExp[] = [
    /\b(?:let|const|var)\s+([A-Za-z_$][\w$]*)/g,
    /\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)?\s*\(([^()]*)\)/g,
    /\bclass\s+([A-Za-z_$][\w$]*)/g,
    /\b([A-Za-z_$][\w$]*)\s*=>/g,
    /\bcatch\s*\(([^()]*)\)/g,
    /\bfor\s*(?:async\s*)?\(([^()]*)\)/g,
  ];
  for (const patron of patrones) {
    for (const hallazgo of codigo.matchAll(patron)) {
      const directo = hallazgo[1];
      const entreParentesis = hallazgo[2];
      añadir(directo);
      if (entreParentesis) {
        for (const pieza of entreParentesis.split(",")) {
          const nombre = palabraEn(pieza.replace(/^\s*(?:let|const|var)\s*/, ""), 0)?.palabra;
          añadir(nombre);
        }
      }
    }
  }
  return [...nombres];
}
