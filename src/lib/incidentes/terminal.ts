/**
 * La terminal simulada (0.5.B): intérprete propio sobre el sistema de ficheros virtual del
 * paquete. No es una shell real ni se conecta a nada. La lista de comandos es cerrada; lo
 * que no está en ella devuelve «comando no disponible» y nunca se ejecuta. Todo es de solo
 * lectura: no existe una operación que escriba, así que el sistema no se puede cambiar.
 *
 * Es una función pura: cada comando devuelve un estado nuevo con el historial alargado.
 */

import { buscaRuta, hijosDe, lineasDe, recorrer, type Sistema } from "./sistema.ts";

/** La lista cerrada de 0.5.B. Nada fuera de esto se ejecuta. */
export const COMANDOS_TERMINAL = [
  "ls",
  "cat",
  "head",
  "tail",
  "grep",
  "wc",
  "sort",
  "uniq",
  "diff",
  "find",
  "cut",
] as const;

export type ComandoTerminal = (typeof COMANDOS_TERMINAL)[number];

/** Tope de salida de un comando: sin log gigante que caiga la página. */
export const TOPE_LINEAS = 2000;
export const TOPE_CARACTERES = 40_000;

export type EntradaHistorial = {
  comando: string;
  /** Las líneas de salida tal cual hay que mostrarlas, con el aviso de corte si tocó. */
  lineas: string[];
  /** false si el comando no pudo producir lo que se pedía. */
  ok: boolean;
};

export type EstadoTerminal = { historial: EntradaHistorial[] };

export function terminalVacia(): EstadoTerminal {
  return { historial: [] };
}

/* ------------------------------------------------------------------ */
/* Analizador de la línea                                             */
/* ------------------------------------------------------------------ */

type Token = { texto: string; conGuion: boolean };

function tokensDe(texto: string): Token[] {
  return texto
    .split(/\s+/)
    .filter((parte) => parte.length > 0)
    .map((parte) => ({ texto: parte, conGuion: parte.startsWith("-") && parte.length > 1 }));
}

function ficherosDe(tokens: Token[]): string[] {
  return tokens.filter((token) => !token.conGuion).map((token) => token.texto);
}

/** El número que sigue a `-n`; null si no viene o no es positivo. */
function numeroDe(tokens: Token[], etiqueta: string): number | null {
  const indice = tokens.findIndex((token) => token.conGuion && token.texto === etiqueta);
  if (indice < 0) return null;
  const valor = tokens[indice + 1];
  if (!valor || valor.conGuion) return null;
  const numero = Number(valor.texto);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

/** ¿La línea lleva `-i`, `-n`, `-r`…? Solo letras sueltas o apretadas `-in`. */
function llevaIndicador(tokens: Token[], letra: string): boolean {
  return tokens.some((token) => {
    if (!token.conGuion || token.texto.startsWith("--")) return false;
    return token.texto.slice(1).includes(letra);
  });
}

function recortar(lineas: string[]): string[] {
  let total = 0;
  let fin = lineas.length;
  for (let indice = 0; indice < lineas.length; indice++) {
    total += lineas[indice].length + 1;
    if (total > TOPE_CARACTERES) {
      fin = Math.max(1, indice);
      break;
    }
  }
  const recortadas = lineas.slice(0, fin);
  if (recortadas.length === lineas.length) return recortadas;
  return [...recortadas, "… (salida cortada)"];
}

/* ------------------------------------------------------------------ */
/* Ejecución                                                          */
/* ------------------------------------------------------------------ */

function avisoNoExiste(cruda: string, problema: "no-existe" | "fuera-del-paquete"): string {
  if (problema === "fuera-del-paquete") return `fuera del sistema de ficheros: ${cruda}`;
  return `no existe en el paquete: ${cruda}`;
}

/** Ejecuta la línea completa (puede llevar tuberías `|`) y devuelve el estado nuevo. */
export function ejecutarComando(
  texto: string,
  sistema: Sistema,
  estado: EstadoTerminal,
): EstadoTerminal {
  const limpio = texto.trim();
  if (limpio.length === 0) return estado;
  const etapas = limpio
    .split("|")
    .map((parte) => parte.trim())
    .filter((parte) => parte.length > 0);
  let arrastre: string[] | null = null;
  let historial = estado.historial;
  for (const etapa of etapas) {
    const entrada = correrEtapa(etapa, sistema, arrastre);
    arrastre = [...entrada.lineas];
    historial = [...historial, entrada];
  }
  return { historial };
}

function esComando(nombre: string): nombre is ComandoTerminal {
  return (COMANDOS_TERMINAL as readonly string[]).includes(nombre);
}

function correrEtapa(texto: string, sistema: Sistema, arrastre: string[] | null): EntradaHistorial {
  const tokens = tokensDe(texto);
  const nombre = tokens[0]?.texto ?? "";
  if (!esComando(nombre)) {
    return {
      comando: nombre,
      ok: false,
      lineas: [
        `comando no disponible: ${nombre}`,
        "La terminal solo tiene: cat, cut, diff, find, grep, head, ls, sort, tail, uniq, wc.",
      ],
    };
  }
  const resto = tokens.slice(1);
  const ficheros = ficherosDe(resto);
  // Sin ficheros tras una tubería, el comando lee la salida de la etapa anterior.
  const tuberia = arrastre !== null && ficheros.length === 0 ? arrastre : null;
  const contexto: Contexto = { sistema, tokens: resto, ficheros, tuberia };
  const salio = FASES[nombre](contexto);
  return { comando: texto, ok: salio.ok, lineas: recortar(salio.lineas) };
}

type Contexto = {
  sistema: Sistema;
  tokens: Token[];
  ficheros: string[];
  tuberia: string[] | null;
};

type Resultado = { lineas: string[]; ok: boolean };

/**
 * Lo que lee un comando: los ficheros pedidos, o la entrada de la tubería cuando no hay
 * ficheros. `ruta` recoge cuando todo el contenido viene de un único fichero (grep lo usa
 * para numerar y `wc` para etiquetar).
 */
type Lectura =
  | { ok: true; ruta: string | null; lineas: string[] }
  | { ok: false; avisos: string[] };

function leer(sistema: Sistema, ficheros: string[], tuberia: string[] | null): Lectura {
  if (ficheros.length === 0) {
    if (tuberia) return { ok: true, ruta: null, lineas: tuberia };
    return { ok: false, avisos: ["me falta el fichero que hay que leer"] };
  }
  const avisos: string[] = [];
  const lineas: string[] = [];
  let rutaUnica: string | null = null;
  let abierta = false;
  for (const cruda of ficheros) {
    const encontrada = buscaRuta(sistema, cruda);
    if (!encontrada.ok) {
      avisos.push(avisoNoExiste(cruda, encontrada.problema));
      continue;
    }
    if (encontrada.tipo !== "fichero") {
      avisos.push(`es un directorio, no un fichero: ${encontrada.ruta}`);
      continue;
    }
    lineas.push(...lineasDe(sistema.ficheros.get(encontrada.ruta)!));
    rutaUnica = ficheros.length === 1 ? encontrada.ruta : null;
    abierta = true;
  }
  if (avisos.length > 0 && !abierta) return { ok: false, avisos };
  return { ok: true, ruta: rutaUnica, lineas };
}

function deLectura(leida: Lectura): Resultado {
  if (leida.ok) return { lineas: leida.lineas, ok: true };
  return { lineas: leida.avisos, ok: false };
}

const FASES: Record<ComandoTerminal, (contexto: Contexto) => Resultado> = {
  /* --------- ls: lo que hay en una carpeta --------- */
  ls: ({ sistema, ficheros }) => {
    const pedidos = ficheros.length === 0 ? ["/"] : ficheros;
    const lineas: string[] = [];
    let ok = true;
    for (let indice = 0; indice < pedidos.length; indice++) {
      const cruda = pedidos[indice];
      const encontrada = buscaRuta(sistema, cruda);
      if (!encontrada.ok) {
        lineas.push(avisoNoExiste(cruda, encontrada.problema));
        ok = false;
        continue;
      }
      const conEncabezado = pedidos.length > 1 || pedidos[0] !== "/";
      if (conEncabezado) {
        if (indice > 0) lineas.push("");
        lineas.push(`${encontrada.ruta}:`);
      }
      lineas.push(
        ...(encontrada.tipo === "directorio"
          ? hijosDe(sistema, encontrada.ruta)
          : [encontrada.ruta]),
      );
    }
    return { lineas: lineas.length > 0 ? lineas : ["(vacío)"], ok };
  },

  /* --------- cat: el fichero entero --------- */
  cat: ({ sistema, ficheros, tuberia }) => {
    if (ficheros.length === 0 && !tuberia) {
      return { lineas: ["uso: cat FICHERO..."], ok: false };
    }
    return deLectura(leer(sistema, ficheros, tuberia));
  },

  /* --------- head / tail: los extremos de un fichero --------- */
  head: ({ sistema, ficheros, tokens, tuberia }) => {
    if (ficheros.length === 0 && !tuberia) {
      return { lineas: ["uso: head [-n LÍNEAS] FICHERO"], ok: false };
    }
    const tope = numeroDe(tokens, "-n") ?? 10;
    const leida = leer(sistema, ficheros, tuberia);
    if (!leida.ok) return { lineas: leida.avisos, ok: false };
    return { lineas: leida.lineas.slice(0, tope), ok: true };
  },

  tail: ({ sistema, ficheros, tokens, tuberia }) => {
    if (ficheros.length === 0 && !tuberia) {
      return { lineas: ["uso: tail [-n LÍNEAS] FICHERO"], ok: false };
    }
    const tope = numeroDe(tokens, "-n") ?? 10;
    const leida = leer(sistema, ficheros, tuberia);
    if (!leida.ok) return { lineas: leida.avisos, ok: false };
    const desde = Math.max(0, leida.lineas.length - tope);
    return { lineas: leida.lineas.slice(desde), ok: true };
  },

  /* --------- grep: las líneas que casan --------- */
  grep: ({ sistema, ficheros, tokens, tuberia }) => {
    const insensible = llevaIndicador(tokens, "i");
    const conNumeros = llevaIndicador(tokens, "n");
    const patron = ficheros[0];
    const rutas = ficheros.slice(1);
    if (!patron || (rutas.length === 0 && !tuberia)) {
      return { lineas: ["uso: grep [-i] [-n] PATRÓN FICHERO..."], ok: false };
    }
    const probada = pruebaRegex(patron, insensible);
    if (!probada) {
      return { lineas: [`el patrón no es una expresión válida: ${patron}`], ok: false };
    }
    const lineas: string[] = [];
    if (rutas.length === 0 && tuberia) {
      tuberia.forEach((linea, indice) => {
        if (!probada(linea)) return;
        lineas.push(conNumeros ? `${indice + 1}:${linea}` : linea);
      });
      return { lineas: lineas.length > 0 ? lineas : ["(nada coincide)"], ok: true };
    }
    let ok = true;
    for (const cruda of rutas) {
      const encontrada = buscaRuta(sistema, cruda);
      if (!encontrada.ok) {
        lineas.push(avisoNoExiste(cruda, encontrada.problema));
        ok = false;
        continue;
      }
      if (encontrada.tipo !== "fichero") {
        lineas.push(`es un directorio, no un fichero: ${encontrada.ruta}`);
        ok = false;
        continue;
      }
      const todo = lineasDe(sistema.ficheros.get(encontrada.ruta)!);
      const prefijoFichero = rutas.length > 1 ? `${encontrada.ruta}:` : "";
      todo.forEach((linea, indice) => {
        if (!probada(linea)) return;
        const prefijoNumero = conNumeros ? `${indice + 1}:` : "";
        lineas.push(`${prefijoFichero}${prefijoNumero}${linea}`);
      });
    }
    return { lineas: lineas.length > 0 ? lineas : ["(nada coincide)"], ok };
  },

  /* --------- wc: cuántas líneas, palabras y caracteres --------- */
  wc: ({ sistema, ficheros, tokens, tuberia }) => {
    if (ficheros.length === 0 && !tuberia) {
      return { lineas: ["uso: wc [-l|-w|-c] FICHERO"], ok: false };
    }
    const leida = leer(sistema, ficheros, tuberia);
    if (!leida.ok) return { lineas: leida.avisos, ok: false };
    const texto = leida.lineas.join("\n");
    const lineas = leida.lineas.length;
    const palabras = texto.split(/\s+/).filter((palabra) => palabra.length > 0).length;
    const caracteres = texto.length;
    const etiqueta = leida.ruta ?? "(entrada)";
    const soloLineas = llevaIndicador(tokens, "l");
    const soloPalabras = llevaIndicador(tokens, "w");
    const soloCaracteres = llevaIndicador(tokens, "c");
    const partes: string[] = [];
    if (soloLineas || (!soloPalabras && !soloCaracteres)) partes.push(`lín ${lineas}`);
    if (soloPalabras || (!soloLineas && !soloCaracteres)) partes.push(`pal ${palabras}`);
    if (soloCaracteres || (!soloLineas && !soloPalabras)) partes.push(`car ${caracteres}`);
    return { lineas: [`${partes.join(", ")} → ${etiqueta}`], ok: true };
  },

  /* --------- sort: alfabético, con -r al revés --------- */
  sort: ({ sistema, ficheros, tokens, tuberia }) => {
    const leida = leer(sistema, ficheros, tuberia);
    if (!leida.ok) return { lineas: leida.avisos, ok: false };
    const lineas = [...leida.lineas].sort();
    return { lineas: llevaIndicador(tokens, "r") ? lineas.reverse() : lineas, ok: true };
  },

  /* --------- uniq: quita los repetidos consecutivos, -c los cuenta --------- */
  uniq: ({ sistema, ficheros, tokens, tuberia }) => {
    const leida = leer(sistema, ficheros, tuberia);
    if (!leida.ok) return { lineas: leida.avisos, ok: false };
    const contar = llevaIndicador(tokens, "c");
    const lineas: string[] = [];
    let anterior: string | null = null;
    let veces = 0;
    const cerrar = () => {
      if (anterior === null) return;
      lineas.push(contar ? `${veces.toString().padStart(3)} ${anterior}` : anterior);
    };
    for (const linea of leida.lineas) {
      if (linea === anterior) {
        veces++;
        continue;
      }
      cerrar();
      anterior = linea;
      veces = 1;
    }
    cerrar();
    return { lineas, ok: true };
  },

  /* --------- diff: lo que cambia entre dos ficheros --------- */
  diff: ({ sistema, ficheros }) => {
    if (ficheros.length !== 2) {
      return { lineas: ["uso: diff FICHERO1 FICHERO2"], ok: false };
    }
    const a = contenidoDel(sistema, ficheros[0]);
    const b = contenidoDel(sistema, ficheros[1]);
    if (!a.ok || !b.ok) {
      const avisos = [...(a.ok ? [] : a.avisos), ...(b.ok ? [] : b.avisos)];
      return { lineas: avisos, ok: false };
    }
    return { lineas: difDe(a.lineas, b.lineas), ok: true };
  },

  /* --------- find: todo lo que cuelga de una ruta --------- */
  find: ({ sistema, ficheros, tokens }) => {
    const indice = tokens.findIndex((token) => token.texto === "-name");
    const patron =
      indice >= 0 && tokens[indice + 1] && !tokens[indice + 1].conGuion
        ? tokens[indice + 1].texto
        : null;
    // El patrón de -name no es una ruta desde la que buscar; se quita de los ficheros.
    const desde =
      ficheros.filter((cruda) => cruda !== patron).length > 0
        ? ficheros.filter((cruda) => cruda !== patron)[0]
        : "/";
    const encontrada = buscaRuta(sistema, desde);
    if (!encontrada.ok) {
      return { lineas: [avisoNoExiste(desde, encontrada.problema)], ok: false };
    }
    const todas = recorrer(sistema, encontrada.ruta);
    const lineas = patron
      ? todas.filter((ruta) => casa(patron, nombreDe(ruta)))
      : todas;
    return { lineas: lineas.length > 0 ? lineas : ["(nada)"], ok: true };
  },

  /* --------- cut: columnas separadas por un símbolo --------- */
  cut: ({ sistema, ficheros, tokens, tuberia }) => {
    if (ficheros.length === 0 && !tuberia) {
      return { lineas: ["uso: cut [-d SÍMBOLO] [-f CAMPO] FICHERO"], ok: false };
    }
    let delimitador = "\t";
    let campo = 1;
    for (let indice = 0; indice < tokens.length; indice++) {
      if (tokens[indice].texto === "-d") delimitador = tokens[indice + 1]?.texto ?? "\t";
      if (tokens[indice].texto === "-f") {
        const pedido = Number(tokens[indice + 1]?.texto);
        if (Number.isInteger(pedido) && pedido > 0) campo = pedido;
      }
    }
    const leida = leer(sistema, ficheros, tuberia);
    if (!leida.ok) return { lineas: leida.avisos, ok: false };
    const regex = literalRegex(delimitador);
    const lineas = leida.lineas.map((linea) => linea.split(regex)[campo - 1] ?? "");
    return { lineas, ok: true };
  },
};

/* ------------------------------------------------------------------ */
/* Piezas                                                             */
/* ------------------------------------------------------------------ */

function nombreDe(ruta: string): string {
  const trozos = ruta.split("/").filter((parte) => parte.length > 0);
  return trozos[trozos.length - 1] ?? "/";
}

/** Casar un patrón de `find -name` con * y ? sobre un nombre completo. */
export function casa(patron: string, texto: string): boolean {
  const regex = new RegExp(
    `^${patron
      .split("*")
      .map((trozo) =>
        trozo
          .split("?")
          .map((fino) => fino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("."),
      )
      .join(".*")}$`,
  );
  return regex.test(texto);
}

/** Regex de un delimitador concreto (la usa `cut`). */
function literalRegex(simbolo: string): RegExp {
  return new RegExp(
    simbolo
      .split("")
      .map((letra) => letra.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join(""),
  );
}

function pruebaRegex(patron: string, insensible: boolean): ((linea: string) => boolean) | null {
  try {
    const regex = insensible ? new RegExp(patron, "i") : new RegExp(patron);
    return (linea: string) => regex.test(linea);
  } catch {
    // Un patrón que no es regex válida se prueba como texto: nunca se fuerza un tipo.
    return (linea: string) => linea.includes(patron);
  }
}

/** El contenido crudo de un fichero, para `diff`: avisos separados de la salida. */
function contenidoDel(
  sistema: Sistema,
  cruda: string,
): { ok: true; lineas: string[] } | { ok: false; avisos: string[] } {
  const encontrada = buscaRuta(sistema, cruda);
  if (!encontrada.ok) {
    return { ok: false, avisos: [avisoNoExiste(cruda, encontrada.problema)] };
  }
  if (encontrada.tipo !== "fichero") {
    return { ok: false, avisos: [`es un directorio, no un fichero: ${encontrada.ruta}`] };
  }
  return { ok: true, lineas: lineasDe(sistema.ficheros.get(encontrada.ruta)!) };
}

/**
 * El `diff` de la terminal, bloque a bloque, sobre la subsecuencia común más larga. El
 * formato es el diff clásico reducido: «a,b c,d», líneas del primero con `<`, del segundo
 * con `>`, separadas por `---`. Sin contexto ni indexado fino: es lectura, no un parche.
 */
export function difDe(lasA: string[], lasB: string[]): string[] {
  const A = lasA.length;
  const B = lasB.length;
  const LCS: number[][] = Array.from({ length: A + 1 }, () => Array(B + 1).fill(0));
  for (let i = A - 1; i >= 0; i--) {
    for (let j = B - 1; j >= 0; j--) {
      LCS[i][j] =
        lasA[i] === lasB[j] ? LCS[i + 1][j + 1] + 1 : Math.max(LCS[i + 1][j], LCS[i][j + 1]);
    }
  }
  type Trozo = { a: number[]; b: number[] };
  const trozos: Trozo[] = [];
  let actual: Trozo = { a: [], b: [] };
  const cerrar = () => {
    if (actual.a.length > 0 || actual.b.length > 0) trozos.push({ ...actual });
    actual = { a: [], b: [] };
  };
  let i = 0;
  let j = 0;
  while (i < A && j < B) {
    if (lasA[i] === lasB[j]) {
      cerrar();
      i++;
      j++;
    } else if (LCS[i + 1][j] >= LCS[i][j + 1]) {
      actual.a.push(i);
      i++;
    } else {
      actual.b.push(j);
      j++;
    }
  }
  while (i < A) {
    actual.a.push(i);
    i++;
  }
  while (j < B) {
    actual.b.push(j);
    j++;
  }
  cerrar();

  const lineas: string[] = [];
  for (const trozo of trozos) {
    lineas.push(`${textoRango(trozo.a)}c${textoRango(trozo.b)}`);
    for (const indice of trozo.a) lineas.push(`< ${lasA[indice]}`);
    if (trozo.a.length > 0 && trozo.b.length > 0) lineas.push("---");
    for (const indice of trozo.b) lineas.push(`> ${lasB[indice]}`);
  }
  return lineas.length > 0 ? lineas : ["sin diferencias"];
}

function textoRango(indices: number[]): string {
  if (indices.length === 0) return "0";
  if (indices.length === 1) return `${indices[0] + 1}`;
  return `${indices[0] + 1},${indices[indices.length - 1] + 1}`;
}
