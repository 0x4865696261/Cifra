import { textoDe } from "../ejecucion/pruebas.ts";
import type { TestSpec } from "@/lib/ejecucion/tipos";
import { plantillaReto } from "./contenido/utiles.ts";

/**
 * La prueba de nivel (0.4.A) para quien llega con experiencia: ocho tramos breves, de fácil a
 * difícil, en orden. El nivel estimado sale del número CONSECUTIVO de tramos superados desde
 * el primero: al fallar uno, ahí se coloca a la persona. Ese nivel es lo que guarda el
 * progreso y lo que abre el plan profesional cuando alcanza el umbral.
 *
 * Decisiones de la 0.4: cada tramo corre su salida en JavaScript como cualquier reto, pero
 * los datos son fijos y no llevan variantes —la prueba no mide lo que copiaste, mide dónde
 * estás— y no lleva «defiende tu solución» (la defensa va de retos, no de colocación).
 */

export type Tramo = {
  id: string;
  titulo: string;
  numero: number; // 1 a 8, en orden de dificultad
  enunciado: string;
  codigoDePartida: string;
  pruebas: TestSpec[];
};

type PiezaTramo = {
  id: string;
  titulo: string;
  numero: number;
  enunciado: string;
  nombre: string;
  firma: string;
  pista: string;
  cuerpo: string;
  /** La llamada tal cual la plantilla la pinta, con el valor que debe salir. */
  casos: Array<{ llamada: string; valor: unknown }>;
};

const ETIQUETAS = ["A", "B", "C", "D"];

/** La solución de referencia de cada tramo, con la plantilla completa. Solo la usan las pruebas. */
const solucionesTramo = new Map<string, string>();

function construir(pieza: PiezaTramo): Tramo {
  const casosTexto = pieza.casos
    .map((caso, i) => `console.log("${ETIQUETAS[i]}:", ${pieza.nombre}(${caso.llamada}));\n`)
    .join("");
  const final = `${pieza.nombre}(${pieza.casos[0].llamada});\n`;
  const plantilla = {
    nombre: pieza.nombre,
    firma: pieza.firma,
    pista: pieza.pista,
    casos: casosTexto,
    final,
  };
  const codigoDePartida = plantillaReto({ ...plantilla, cuerpo: "" });
  solucionesTramo.set(pieza.id, plantillaReto({ ...plantilla, cuerpo: pieza.cuerpo }));
  const salida = pieza.casos
    .map((caso, i) => `${ETIQUETAS[i]}: ${textoDe(caso.valor)}\n`)
    .join("");
  const pruebas: TestSpec[] = [
    {
      id: `${pieza.id}-salida`,
      nombre: "imprime lo que calcula en cada caso",
      entrada: null,
      esperado: salida,
      tipo: "salida",
      visible: true,
    },
    {
      id: `${pieza.id}-resultado`,
      nombre: "devuelve el resultado del caso A",
      entrada: null,
      esperado: textoDe(pieza.casos[0].valor),
      tipo: "retorno",
      visible: false,
    },
  ];
  return {
    id: pieza.id,
    titulo: pieza.titulo,
    numero: pieza.numero,
    enunciado: pieza.enunciado,
    codigoDePartida,
    pruebas,
  };
}

export const tramosDePrueba: Tramo[] = [
  construir({
    id: "prueba-tramo-1",
    titulo: "Doblar un número",
    numero: 1,
    nombre: "dobla",
    firma: "n",
    pista: "Devuelve n multiplicado por 2.",
    cuerpo: "  return n * 2;\n",
    enunciado: "Escribe `dobla(n)`: devuelve el doble de n.",
    casos: [
      { llamada: "7", valor: 14 },
      { llamada: "-3", valor: -6 },
    ],
  }),
  construir({
    id: "prueba-tramo-2",
    titulo: "El mayor de dos",
    numero: 2,
    nombre: "mayorDeDos",
    firma: "a, b",
    pista: "Devuelve el número más grande de los dos.",
    cuerpo: '  if (a > b) {\n    return a;\n  }\n  return b;\n',
    enunciado: "Escribe `mayorDeDos(a, b)`: el mayor de los dos números. Si son iguales, cualquiera de los dos vale.",
    casos: [
      { llamada: "9, 4", valor: 9 },
      { llamada: "3, 12", valor: 12 },
      { llamada: "5, 5", valor: 5 },
    ],
  }),
  construir({
    id: "prueba-tramo-3",
    titulo: "Par o impar",
    numero: 3,
    nombre: "esPar",
    firma: "n",
    pista: "Devuelve true si n es par, false si no.",
    cuerpo: "  return n % 2 === 0;\n",
    enunciado: "Escribe `esPar(n)`: devuelve true si n es par y false si no lo es.",
    casos: [
      { llamada: "8", valor: true },
      { llamada: "7", valor: false },
      { llamada: "0", valor: true },
    ],
  }),
  construir({
    id: "prueba-tramo-4",
    titulo: "La caja fuerte",
    numero: 4,
    nombre: "caeEnRango",
    firma: "x, minimo, maximo",
    pista: "Devuelve true solo si x está dentro del rango, extremos incluidos.",
    cuerpo: "  return x >= minimo && x <= maximo;\n",
    enunciado: "Escribe `caeEnRango(x, minimo, maximo)`: true si x está dentro del rango, extremos incluidos.",
    casos: [
      { llamada: "5, 1, 9", valor: true },
      { llamada: "1, 1, 9", valor: true },
      { llamada: "10, 1, 9", valor: false },
    ],
  }),
  construir({
    id: "prueba-tramo-5",
    titulo: "Sumar una lista",
    numero: 5,
    nombre: "sumar",
    firma: "numeros",
    pista: "Devuelve la suma de todos los números de la lista. Una lista vacía suma 0.",
    cuerpo:
      "  let suma = 0;\n" +
      "  for (const n of numeros) {\n" +
      "    suma = suma + n;\n" +
      "  }\n" +
      "  return suma;\n",
    enunciado: "El clásico de recorrer y acumular, sin excepciones: la lista vacía suma 0.",
    casos: [
      { llamada: "[4, 8, 3]", valor: 15 },
      { llamada: "[]", valor: 0 },
      { llamada: "[-2, 20]", valor: 18 },
    ],
  }),
  construir({
    id: "prueba-tramo-6",
    titulo: "Contar los pares",
    numero: 6,
    nombre: "cuentaPares",
    firma: "numeros",
    pista: "Devuelve cuántos números de la lista son pares.",
    cuerpo:
      "  let cuenta = 0;\n" +
      "  for (const n of numeros) {\n" +
      "    if (n % 2 === 0) {\n" +
      "      cuenta = cuenta + 1;\n" +
      "    }\n" +
      "  }\n" +
      "  return cuenta;\n",
    enunciado: "Recorre y cuenta con una condición dentro. La lista vacía cuenta 0.",
    casos: [
      { llamada: "[1, 4, 6, 7]", valor: 2 },
      { llamada: "[2, 3, 2]", valor: 2 },
      { llamada: "[]", valor: 0 },
    ],
  }),
  construir({
    id: "prueba-tramo-7",
    titulo: "La lista del revés",
    numero: 7,
    nombre: "invierte",
    firma: "piezas",
    pista: "Devuelve una lista nueva con las piezas en orden inverso, sin cambiar la original.",
    cuerpo:
      "  const salida = [];\n" +
      "  for (let i = piezas.length - 1; i >= 0; i--) {\n" +
      "    salida.push(piezas[i]);\n" +
      "  }\n" +
      "  return salida;\n",
    enunciado: "Recorre de atrás hacia delante y acumula en una lista nueva. Con un solo elemento, la misma lista.",
    casos: [
      { llamada: '["a", "b", "c"]', valor: ["c", "b", "a"] },
      { llamada: '["pocas"]', valor: ["pocas"] },
      { llamada: "[]", valor: [] },
    ],
  }),
  construir({
    id: "prueba-tramo-8",
    titulo: "La suma de los dígitos",
    numero: 8,
    nombre: "sumaDigitos",
    firma: "n, conElNegativo",
    pista: "Devuelve la suma de los dígitos del número n, sin contar el menos si lo tiene.",
    cuerpo:
      '  const enTexto = Math.abs(n).toString();\n' +
      "  let suma = 0;\n" +
      "  for (const letra of enTexto) {\n" +
      "    suma = suma + Number(letra);\n" +
      "  }\n" +
      "  return suma;\n",
    enunciado: "Recorrer dígitos y sumarlos; el negativo quita el signo antes, y el cero devuelve 0.",
    casos: [
      { llamada: "246", valor: 12 },
      { llamada: "-91", valor: 10 },
      { llamada: "0", valor: 0 },
    ],
  }),
];

/** La solución de referencia de un tramo: la plantilla completa con el cuerpo resuelto. */
export function solucionTramo(id: string): string | undefined {
  return solucionesTramo.get(id);
}

/** El nivel estimado: cuántos tramos seguidos empezando por el primero quedaron superados. */
export function nivelEstimadoDePrueba(resueltos: string[]): number {
  let consecutivos = 0;
  for (const tramo of tramosDePrueba) {
    if (!resueltos.includes(tramo.id)) break;
    consecutivos += 1;
  }
  return consecutivos;
}

export function tramoPorId(id: string): Tramo | undefined {
  return tramosDePrueba.find((tramo) => tramo.id === id);
}

/** El tramo que toca: el primero aún no resuelto, en orden. Sirve para reanudar. */
export function siguienteTramo(resueltos: string[]): Tramo | undefined {
  return tramosDePrueba.find((tramo) => !resueltos.includes(tramo.id));
}
