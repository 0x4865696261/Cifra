/**
 * La semilla por persona (0.4.D) y los generados que salen de ella.
 *
 * Una persona tiene una semilla fija en su navegador. Con esa semilla y el id del reto, los
 * datos del reto salen siempre iguales para ella y distintos para otra persona: copiar la
 * solución (y la salida) de otra pestaña no sirve tal cual. Todo es determinista y local:
 * nada aquí depende del servidor ni del reloj.
 */

import type { Rand } from "./tipos";

const CLAVE_SEMILLA = "cifra.semilla";

/** La semilla de esta persona en este navegador: se crea la primera vez y no vuelve a cambiar. */
export function semillaPorPersona(): string {
  try {
    const guardada = localStorage.getItem(CLAVE_SEMILLA);
    if (guardada && esSemillaValida(guardada)) return guardada;
    const nueva = crearSemilla();
    localStorage.setItem(CLAVE_SEMILLA, nueva);
    return nueva;
  } catch {
    // Sin localStorage (navegación privada estricta) la semilla vive solo en esta sesión.
    return crearSemilla();
  }
}

function esSemillaValida(valor: string): boolean {
  return /^[0-9a-f]{32}$/.test(valor);
}

function crearSemilla(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Hash 32 bits estable de (semilla, id de reto): FNV-1a. El mismo par siempre da lo mismo. */
export function hashSemilla(semilla: string, id: string): number {
  let hash = 0x811c9dc5;
  const texto = `${semilla}::${id}`;
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Generador determinista: una variante probada y recortada de mulberry32. */
export function crearAleatorio(semillaNumerica: number): Rand {
  let estado = semillaNumerica >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Entero entre mínimo y máximo, ambos incluidos. */
export function enteroEntre(aleatorio: Rand, minimo: number, maximo: number): number {
  const bajo = Math.ceil(minimo);
  const alto = Math.floor(maximo);
  if (alto <= bajo) return bajo;
  return bajo + Math.floor(aleatorio() * (alto - bajo + 1));
}

/** Un elemento al azar de la lista. */
export function elegirDe(aleatorio: Rand, lista: readonly string[]): string {
  if (lista.length === 0) return "";
  return lista[Math.floor(aleatorio() * lista.length)];
}

/**
 * Una lista de números para el enunciado: longitud acotada, valores en rango y sin repetir
 * cuando se pide: para que la solución «casi correcta» típica (un límite mal puesto, vacío)
 * no pase por suerte.
 */
export function listaDeNumeros(
  aleatorio: Rand,
  { minimoLargo, maximoLargo, valorMinimo, valorMaximo }: {
    minimoLargo: number;
    maximoLargo: number;
    valorMinimo: number;
    valorMaximo: number;
  },
): number[] {
  const largo = enteroEntre(aleatorio, minimoLargo, maximoLargo);
  const lista: number[] = [];
  const usados = new Set<number>();
  while (lista.length < largo) {
    const valor = enteroEntre(aleatorio, valorMinimo, valorMaximo);
    if (usados.has(valor)) continue;
    usados.add(valor);
    lista.push(valor);
  }
  return lista;
}

/** Una palabra para los ejemplos y los nombres en el código de partida. */
export function listaTextos(aleatorio: Rand, bolsa: readonly string[], largo: number): string[] {
  const lista: string[] = [];
  for (let i = 0; i < largo; i++) lista.push(elegirDe(aleatorio, bolsa));
  return lista;
}

/** La variante de un reto: los datos ya generados para esta persona y este reto. */
export function datosDe(
  definicion: {
    id: string;
    crearDatos: (aleatorio: Rand) => Record<string, string>;
  },
  semilla: string,
): Record<string, string> {
  const aleatorio = crearAleatorio(hashSemilla(semilla, definicion.id));
  return definicion.crearDatos(aleatorio);
}
