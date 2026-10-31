import type { TestSpec } from "@/lib/ejecucion/tipos";
import { listaDeNumeros } from "../semilla.ts";
import type { DatosReto, Rand } from "../tipos";
import { literalLista, plantillaReto, type RetoCompleto } from "./utiles.ts";

/**
 * Familia «bucles» (0.4.B): repetir calculando.
 *
 * Cada reto compone con los datos de esta persona: la plantilla con los casos plantados, la
 * salida esperada calculada con la solución de referencia de la plataforma —no a mano— y la
 * «casi correcta» típica, que cae en la prueba de la salida por el límite o el extremo.
 */

function sumar(numeros: readonly number[]): number {
  return numeros.reduce((acumulada, actual) => acumulada + actual, 0);
}

function pintar(texto: string): number[] {
  if (texto.length === 0) return [];
  return texto.split(", ").map((valor) => Number(valor));
}

function pruebasSalidaRetorno(id: string, salida: string, retorno: unknown): TestSpec[] {
  return [
    {
      id: `${id}-salida`,
      nombre: "imprime lo que calcula en cada caso",
      entrada: null,
      esperado: salida,
      tipo: "salida",
      visible: true,
    },
    {
      id: `${id}-resultado`,
      nombre: "devuelve el resultado del caso A",
      entrada: null,
      esperado: retorno,
      tipo: "retorno",
      visible: false,
    },
  ];
}

const cuerpoSumaReferencia =
  "  let suma = 0;\n" +
  "  for (let i = 0; i < numeros.length; i++) {\n" +
  "    suma = suma + numeros[i];\n" +
  "  }\n" +
  "  return suma;\n";

const cuerpoSumaCasi =
  "  let suma = 0;\n" +
  "  for (let i = 1; i < numeros.length; i++) {\n" +
  "    suma = suma + numeros[i];\n" +
  "  }\n" +
  "  return suma;\n";

//
// bucles-dos — la suma de la lista
//

function armaSuma(datos: DatosReto, cuerpo: string) {
  const listaA = pintar(datos.casoA);
  const codigo = plantillaReto({
    nombre: "sumaLista",
    firma: "numeros",
    pista: "Devuelve la suma de todos los números de la lista. La lista vacía suma 0.",
    cuerpo,
    casos:
      `console.log("A:", sumaLista(${literalLista(listaA)}));\n` +
      `console.log("B:", sumaLista([]));\n`,
    final: `sumaLista(${literalLista(listaA)});\n`,
  });
  const salida = `A: ${sumar(listaA)}\nB: 0\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("bucles-dos", salida, sumar(listaA)) };
}

export const buclesDos: RetoCompleto = {
  id: "bucles-dos",
  titulo: "La suma de la lista",
  familia: "bucles",
  nivel: 2,
  conceptos: ["bucle", "arreglo"],
  preguntasDefensa: [
    "En tu propio código: ¿por qué tu bucle arranca donde arranca? ¿Qué rompería empezar una posición antes o una después?",
    "¿Cómo decide tu función la lista vacía? Recorre tu código línea por línea con caso B.",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => ({
    casoA: listaDeNumeros(aleatorio, { minimoLargo: 4, maximoLargo: 7, valorMinimo: 1, valorMaximo: 99 }).join(", "),
  }),
  fabrica: (datos) => {
    const hecho = armaSuma(datos, "");
    return {
      enunciado:
        "Escribe `sumaLista(numeros)`: devuelve la suma de todos los números de la lista. " +
        "La lista vacía suma 0. Los dos casos que la plantilla ejecuta son la lista del caso A " +
        "y la vacía. El desliz clásico aquí es arrancar el índice en 1.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) => armaSuma(datos, cuerpoSumaReferencia).codigo,
  solucionCasi: (datos) => armaSuma(datos, cuerpoSumaCasi).codigo,
};

//
// bucles-cinco — los múltiplos de un rango
//

const cuerpoMultiplosReferencia =
  "  let cuenta = 0;\n" +
  "  for (let x = desde; x <= hasta; x++) {\n" +
  "    if (x % salto === 0) {\n" +
  "      cuenta = cuenta + 1;\n" +
  "    }\n" +
  "  }\n" +
  "  return cuenta;\n";

const cuerpoMultiplosCasi =
  "  let cuenta = 0;\n" +
  "  for (let x = desde; x < hasta; x++) {\n" +
  "    if (x % salto === 0) {\n" +
  "      cuenta = cuenta + 1;\n" +
  "    }\n" +
  "  }\n" +
  "  return cuenta;\n";

function armaMultiplos(datos: DatosReto, cuerpo: string) {
  const salto = Number(datos.salto);
  const desde = Number(datos.desde);
  const hasta = Number(datos.hasta);
  const cuentaDe = (saltoX: number, desdeX: number, hastaX: number): number => {
    let cuenta = 0;
    for (let x = desdeX; x <= hastaX; x++) {
      if (x % saltoX === 0) cuenta += 1;
    }
    return cuenta;
  };
  const A = `cuentaMultiplos(${salto}, ${desde}, ${hasta})`;
  const B = `cuentaMultiplos(${salto}, ${salto}, ${salto})`;
  const codigo = plantillaReto({
    nombre: "cuentaMultiplos",
    firma: "salto, desde, hasta",
    pista: "Devuelve cuántos números entre desde y hasta —los dos incluidos— son múltiplos de salto.",
    cuerpo,
    casos: `console.log("A:", ${A});\nconsole.log("B:", ${B});\n`,
    final: `${A};\n`,
  });
  const salida = `A: ${cuentaDe(salto, desde, hasta)}\nB: 1\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("bucles-cinco", salida, cuentaDe(salto, desde, hasta)) };
}

export const buclesCinco: RetoCompleto = {
  id: "bucles-cinco",
  titulo: "Los múltiplos de un rango",
  familia: "bucles",
  nivel: 5,
  conceptos: ["bucle", "invariante"],
  preguntasDefensa: [
    "¿Por qué tu rango incluye el extremo de arriba? Muéstralo en tu código con el caso A.",
    "En tu bucle: ¿qué garantiza el invariante en cada vuelta? ¿Y qué pasa si salto fuera 1?",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    const paso = 2 + Math.floor(aleatorio() * 4); // 2 a 5
    const arranque = 2 + Math.floor(aleatorio() * 7); // 2 a 8, no múltiplo garantizado no hace falta
    const k = 6 + Math.floor(aleatorio() * 4); // 6 a 9 saltos de largo
    return {
      salto: String(paso),
      desde: String(arranque),
      hasta: String(arranque + paso * k),
    };
  },
  fabrica: (datos) => {
    const hecho = armaMultiplos(datos, "");
    return {
      enunciado:
        "Escribe `cuentaMultiplos(salto, desde, hasta)`: cuántos números del rango `[desde, hasta]`, " +
        "los dos extremos incluidos, son múltiplos de `salto`. El caso B es el rango de un solo número " +
        "múltiplo: tiene que contar ese extremo. El desliz clásico es cerrar el bucle con `<` y perder " +
        "el último múltiplo del rango.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) => armaMultiplos(datos, cuerpoMultiplosReferencia).codigo,
  solucionCasi: (datos) => armaMultiplos(datos, cuerpoMultiplosCasi).codigo,
};

//
// bucles-ocho — la racha más larga
//

const cuerpoRachaReferencia =
  "  let racha = 1;\n" +
  "  let mayor = 1;\n" +
  "  for (let i = 1; i < numeros.length; i++) {\n" +
  "    if (numeros[i] === numeros[i - 1]) {\n" +
  "      racha = racha + 1;\n" +
  "      if (racha > mayor) {\n" +
  "        mayor = racha;\n" +
  "      }\n" +
  "    } else {\n" +
  "      racha = 1;\n" +
  "    }\n" +
  "  }\n" +
  "  return mayor;\n";

const cuerpoRachaCasi =
  "  let racha = 1;\n" +
  "  let mayor = 1;\n" +
  "  for (let i = 1; i < numeros.length; i++) {\n" +
  "    if (numeros[i] === numeros[i - 1]) {\n" +
  "      racha = racha + 1;\n" +
  "    } else {\n" +
  "      if (racha > mayor) {\n" +
  "        mayor = racha;\n" +
  "      }\n" +
  "      racha = 1;\n" +
  "    }\n" +
  "  }\n" +
  "  return mayor;\n";

/** Una lista sin dos iguales seguidos, con el valor final prohibido fuera: para plantar la racha. */
function listaSinRachas(aleatorio: Rand, largo: number, prohibido: number): number[] {
  const lista: number[] = [];
  let anterior = -1;
  for (let i = 0; i < largo; i++) {
    let valor = 1 + Math.floor(aleatorio() * 30);
    while (valor === anterior || valor === prohibido) valor = 1 + Math.floor(aleatorio() * 30);
    lista.push(valor);
    anterior = valor;
  }
  return lista;
}

function armaRacha(datos: DatosReto, cuerpo: string) {
  const listaA = pintar(datos.casoA);
  const listaB = pintar(datos.casoB);
  const rachaDe = (lista: number[]): number => {
    let racha = 1;
    let mayor = 1;
    for (let i = 1; i < lista.length; i++) {
      if (lista[i] === lista[i - 1]) {
        racha += 1;
        if (racha > mayor) mayor = racha;
      } else {
        racha = 1;
      }
    }
    return mayor;
  };
  const codigo = plantillaReto({
    nombre: "rachaMayor",
    firma: "numeros",
    pista: "Devuelve el largo de la racha más larga de números iguales seguidos.",
    cuerpo,
    casos:
      `console.log("A:", rachaMayor(${literalLista(listaA)}));\n` +
      `console.log("B:", rachaMayor(${literalLista(listaB)}));\n`,
    final: `rachaMayor(${literalLista(listaA)});\n`,
  });
  const salida = `A: ${rachaDe(listaA)}\nB: ${rachaDe(listaB)}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("bucles-ocho", salida, rachaDe(listaA)) };
}

export const buclesOcho: RetoCompleto = {
  id: "bucles-ocho",
  titulo: "La racha más larga",
  familia: "bucles",
  nivel: 8,
  conceptos: ["bucle", "invariante"],
  preguntasDefensa: [
    "¿Qué pasa con tu racha cuando el bucle se acaba y la mejor racha era la última? Míralo en tu código.",
    "¿Qué garantiza la variable que acumulas en cada vuelta, y cuándo la reinicias?",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    // La racha más larga siempre acaba al final: el desliz clásico (no cerrar la racha al
    // salir del bucle) cae seguro en ambas listas.
    const kA = 3 + Math.floor(aleatorio() * 3); // 3 a 5 van seguidos
    const valorA = 1 + Math.floor(aleatorio() * 30);
    const listaA = [...listaSinRachas(aleatorio, 4 + Math.floor(aleatorio() * 3), valorA), ...Array.from<number>({ length: kA }).fill(valorA)];
    const kB = 3 + Math.floor(aleatorio() * 3);
    const valorB = 1 + Math.floor(aleatorio() * 30);
    const listaB = [...listaSinRachas(aleatorio, 3 + Math.floor(aleatorio() * 2), valorB), ...Array.from<number>({ length: kB }).fill(valorB)];
    return { casoA: listaA.join(", "), casoB: listaB.join(", ") };
  },
  fabrica: (datos) => {
    const hecho = armaRacha(datos, "");
    return {
      enunciado:
        "Escribe `rachaMayor(numeros)`: el largo de la racha más larga de números iguales seguidos. " +
        "En los dos casos la racha mayor está al final de la lista. El desliz clásico: cuando el " +
        "bucle se acaba, tu mejor racha queda sin comparar. Comprueba qué pasa con la última racha.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) => armaRacha(datos, cuerpoRachaReferencia).codigo,
  solucionCasi: (datos) => armaRacha(datos, cuerpoRachaCasi).codigo,
};

export const retosDeBucles: RetoCompleto[] = [buclesDos, buclesCinco, buclesOcho];
