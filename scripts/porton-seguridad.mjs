import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, sep, join } from "node:path";
import { projectRoot } from "./with-app-env.mjs";

const FORMATOS_CREDENCIAL = [
  /\bsk-[a-z0-9_-]{10,}\b/gi,
  /\bAKIA[A-Z0-9]{16}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bAIza[0-9A-Za-z_-]{35}\b/g,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  /\b(?:postgres(?:ql)?|mysql):\/\/[^/@\s:]+:[^/@\s]+@[^/\s]+/gi,
  /\b(?:api[-_]?key|access[-_]?key(?:[-_]?id)?|secret(?:[-_]?key)?|token|password|passwd|private[-_]?key)\b\s*(?:[:=]|=>)\s*(?:['"`])?([A-Za-z0-9_\-+/=]{16,})(?:['"`])?\b/gi,
];

const MARCA_SINTETICA =
  /(?:^|[-_"'`])(?:test|sint[eé]tic[oa]|synthetic|fixture|example|demo|sample|dummy)(?:[-_"'`]|$)|clave-de-prueba/i;
const DIRECTORIOS_VIGILADOS = ["src", "server", "public", "scripts"];

function archivosDe(directorio) {
  if (!existsSync(directorio)) return [];
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(directorio, entrada.name);
    if (entrada.isDirectory()) return archivosDe(ruta);
    return entrada.isFile() ? [ruta] : [];
  });
}

/** Detecta formatos conocidos de credencial sin devolver ni registrar el valor encontrado. */
export function hayCredencial(texto) {
  for (const formato of FORMATOS_CREDENCIAL) {
    formato.lastIndex = 0;
    for (const [coincidencia] of texto.matchAll(formato)) {
      if (!MARCA_SINTETICA.test(coincidencia)) return true;
    }
  }
  return false;
}

/** Devuelve solo rutas: una credencial nunca se incluye en el resultado ni en sus logs. */
export function escanearCredenciales(root = projectRoot()) {
  const hallazgos = [];
  for (const nombre of DIRECTORIOS_VIGILADOS) {
    const directorio = join(root, nombre);
    if (!existsSync(directorio)) {
      throw new Error(`Directorio vigilado ausente: ${nombre}`);
    }
    if (!statSync(directorio).isDirectory()) {
      throw new Error(`La ruta vigilada no es un directorio: ${nombre}`);
    }
    for (const archivo of archivosDe(directorio)) {
      const contenido = readFileSync(archivo);
      if (contenido.includes(0)) continue;
      if (hayCredencial(contenido.toString("utf8"))) {
        hallazgos.push(relative(root, archivo).split(sep).join("/"));
      }
    }
  }
  return hallazgos.sort();
}
