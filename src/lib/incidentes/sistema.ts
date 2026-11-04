/**
 * El sistema de ficheros virtual del paquete (0.5.B). Solo lectura: no existe ninguna
 * operación que escriba. Todas las rutas se normalizan a forma absoluta con la raíz `/`
 * (la raíz del paquete es el mundo entero de la terminal), con `.` y `..` resueltos a la
 * manera de Unix dentro de la raíz: `../` sobre la raíz se queda en la raíz, nunca fuera.
 */

export type Sistema = {
  /** ruta normalizada `/a/b` → contenido, solo ficheros. */
  ficheros: Map<string, string>;
  /** rutas normalizadas de directorios, incluidas las intermedias. */
  directorios: Set<string>;
};

const rutaAbsoluta = /^\/[a-z0-9._-]+(?:\/[a-z0-9._-]+)*$/;

/** Normaliza una ruta de la terminal a forma absoluta con la raíz `/`. */
export function normalizarRuta(entrada: string, raiz = "/"): string | null {
  const texto = entrada.trim();
  if (texto.length === 0) return raiz;
  const trozos: string[] = [];
  for (const parte of texto.split("/")) {
    if (parte === "" || parte === ".") continue;
    if (parte === "..") trozos.pop(); // sobre la raíz no hay sitio al que subir
    else trozos.push(parte);
  }
  if (trozos.some((parte) => !/^[a-zA-Z0-9._-]+$/.test(parte))) return null;
  return trozos.length === 0 ? raiz : `/${trozos.join("/")}`;
}

/** Construye el sistema: los directorios salen de las rutas de los ficheros. */
export function creaSistema(ficheros: Record<string, string>): Sistema {
  const mapa = new Map<string, string>();
  const directorios = new Set<string>(["/"]);
  for (const [cruda, contenido] of Object.entries(ficheros)) {
    if (!cruda.trim()) continue;
    const ruta = normalizarRuta(cruda.startsWith("/") ? cruda : `/${cruda}`);
    if (!ruta || !rutaAbsoluta.test(ruta)) continue;
    mapa.set(ruta, contenido);
    for (let indice = ruta.indexOf("/", 1); indice > 0; indice = ruta.indexOf("/", indice + 1)) {
      directorios.add(ruta.slice(0, indice));
    }
  }
  return { ficheros: mapa, directorios };
}

export type BusquedaRuta =
  | { ok: true; ruta: string; tipo: "fichero" | "directorio" }
  | { ok: false; problema: "no-existe" | "fuera-del-paquete"; ruta: string };

/**
 * Busca una ruta contra el sistema. Como la raíz del paquete es el mundo de la terminal,
 * `../` de más se queda en la raíz: si el destino no está en el paquete, es que no existe.
 */
export function buscaRuta(sistema: Sistema, entrada: string): BusquedaRuta {
  const resuelta = normalizarRuta(entrada);
  if (!resuelta) return { ok: false, problema: "fuera-del-paquete", ruta: entrada };
  if (sistema.ficheros.has(resuelta)) return { ok: true, ruta: resuelta, tipo: "fichero" };
  if (sistema.directorios.has(resuelta)) return { ok: true, ruta: resuelta, tipo: "directorio" };
  return { ok: false, problema: "no-existe", ruta: resuelta };
}

/** Los hijos inmediatos de un directorio: primeros nombres, ficheros y directorios. */
export function hijosDe(sistema: Sistema, rutaDirectorio: string): string[] {
  const salida = new Set<string>();
  const prefijoBase = rutaDirectorio === "/" ? "/" : `${rutaDirectorio}/`;
  for (const ruta of sistema.ficheros.keys()) {
    if (!ruta.startsWith(prefijoBase)) continue;
    const resto = ruta.slice(prefijoBase.length);
    if (resto.includes("/")) salida.add(`${resto.split("/")[0]}/`);
    else salida.add(resto);
  }
  for (const ruta of sistema.directorios) {
    if (!ruta.startsWith(prefijoBase)) continue;
    const resto = ruta.slice(prefijoBase.length);
    if (resto.length === 0) continue;
    salida.add(`${resto.split("/")[0]}/`);
  }
  return [...salida].sort();
}

/** Todo lo que cuelga de una ruta: rutas completas, en orden alfabético. */
export function recorrer(sistema: Sistema, rutaDirectorio: string): string[] {
  const prefijo = rutaDirectorio === "/" ? "/" : `${rutaDirectorio}/`;
  const rutas = [...sistema.directorios, ...sistema.ficheros.keys()];
  return rutas.filter((ruta) => ruta !== rutaDirectorio && ruta.startsWith(prefijo)).sort();
}

/** Contenido por líneas (sin incluir el vacío final de una marca de fin de archivo). */
export function lineasDe(contenido: string): string[] {
  return contenido.split("\n");
}
