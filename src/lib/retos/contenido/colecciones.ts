import type { TestSpec } from "@/lib/ejecucion/tipos";
import { enteroEntre, listaDeNumeros } from "../semilla.ts";
import type { DatosReto, Rand } from "../tipos";
import { literalLista, plantillaReto, type RetoCompleto } from "./utiles.ts";

/**
 * Familia «colecciones» (0.4.B): listas y lo que se recorre. El casi de esta familia cae en
 * un índice mal puesto, un valor de partida equivocado o un orden confundido.
 */

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

//
// colecciones-dos — el mayor, con la lista fría
//

const cuerpoMayorReferencia =
  "  let mayor = numeros[0];\n" +
  "  for (let i = 1; i < numeros.length; i++) {\n" +
  "    if (numeros[i] > mayor) {\n" +
  "      mayor = numeros[i];\n" +
  "    }\n" +
  "  }\n" +
  "  return mayor;\n";

// El casi clásico: arranca en 0, que no sirve cuando todas las cifras son frías (negativas).
const cuerpoMayorCasi =
  "  let mayor = 0;\n" +
  "  for (let i = 1; i < numeros.length; i++) {\n" +
  "    if (numeros[i] > mayor) {\n" +
  "      mayor = numeros[i];\n" +
  "    }\n" +
  "  }\n" +
  "  return mayor;\n";

function armaMayor(datos: DatosReto, cuerpo: string) {
  const listaA = datos.casoA.split(", ").map(Number);
  const listaB = datos.casoB.split(", ").map(Number);
  const mayorDe = (lista: number[]): number => {
    let mayor = lista[0];
    for (let i = 1; i < lista.length; i++) {
      if (lista[i] > mayor) mayor = lista[i];
    }
    return mayor;
  };
  const codigo = plantillaReto({
    nombre: "mayorDe",
    firma: "numeros",
    pista: "Devuelve el número más grande de la lista. La lista B está formada solo por negativos.",
    cuerpo,
    casos:
      `console.log("A:", mayorDe(${literalLista(listaA)}));\n` +
      `console.log("B:", mayorDe(${literalLista(listaB)}));\n`,
    final: `mayorDe(${literalLista(listaA)});\n`,
  });
  const salida = `A: ${mayorDe(listaA)}\nB: ${mayorDe(listaB)}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("colecciones-dos", salida, mayorDe(listaA)) };
}

export const coleccionesDos: RetoCompleto = {
  id: "colecciones-dos",
  titulo: "El mayor, con la lista fría",
  familia: "colecciones",
  nivel: 2,
  conceptos: ["arreglo", "variable"],
  preguntasDefensa: [
    "¿De dónde arranca tu mayor y por qué ese valor exacto? Recorre tu código con la lista B, fría del todo.",
    "¿Qué pasa si la lista tiene un solo elemento? Míralo en tu código, sin ejecutarlo.",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    const listaA = listaDeNumeros(aleatorio, { minimoLargo: 4, maximoLargo: 7, valorMinimo: -40, valorMaximo: 40 });
    // La lista B convive con fríos garantizados: si arrancas el mayor en 0, aquí falla.
    const listaB = Array.from({ length: 3 + Math.floor(aleatorio() * 3) }, () =>
      -enteroEntre(aleatorio, 1, 40),
    );
    return { casoA: listaA.join(", "), casoB: listaB.join(", ") };
  },
  fabrica: (datos) => {
    const hecho = armaMayor(datos, "");
    return {
      enunciado:
        "Escribe `mayorDe(numeros)`: el número más grande de la lista. La lista B está formada " +
        "solo por negativos. El desliz clásico: arrancar tu acumulador en 0 y devolver 0 cuando " +
        "todo lo que hay es frío. Arranca con lo que hay en la lista, no con lo que te conviene.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) => armaMayor(datos, cuerpoMayorReferencia).codigo,
  solucionCasi: (datos) => armaMayor(datos, cuerpoMayorCasi).codigo,
};

//
// colecciones-cinco — sin repetidos, en el orden en que llegaron
//

function armaRepetidos(datos: DatosReto, cuerpo: string) {
  const piezas = datos.piezas.split(", ");
  const sinRepetirDe = (lista: string[]): string[] => {
    const salida: string[] = [];
    for (const pieza of lista) {
      if (!salida.includes(pieza)) salida.push(pieza);
    }
    return salida;
  };
  const codigo = plantillaReto({
    nombre: "sinRepetir",
    firma: "piezas",
    pista: "Devuelve una lista nueva sin repetidos, conservando el orden de la primera vez que se vio cada pieza.",
    cuerpo,
    casos: `console.log("A:", sinRepetir(${literalTextoLista(piezas)}));\n`,
    final: `sinRepetir(${literalTextoLista(piezas)});\n`,
  });
  const salida = `A: ${JSON.stringify(sinRepetirDe(piezas))}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("colecciones-cinco", salida, sinRepetirDe(piezas)) };
}

function literalTextoLista(textos: readonly string[]): string {
  return `[${textos.map((texto) => JSON.stringify(texto)).join(", ")}]`;
}

export const coleccionesCinco: RetoCompleto = {
  id: "colecciones-cinco",
  titulo: "Sin repetidos, en el orden en que llegaron",
  familia: "colecciones",
  nivel: 5,
  conceptos: ["arreglo", "bucle"],
  preguntasDefensa: [
    "¿Qué guarda tu lista salida exactamente cuando la pieza ya estaba? Muéstralo en tu código con la segunda vez que se repite una.",
    "¿Por qué tu orden es el del momento en que la pieza llegó? ¿Qué rompería guardarlo por la última vez en vez de la primera?",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    const bolsa = ["tuerca", "tornillo", "clavo", "anclaje", "arandela", "remache"];
    const primerasDe = (lista: string[]) => {
      const salida: string[] = [];
      for (const pieza of lista) if (!salida.includes(pieza)) salida.push(pieza);
      return salida;
    };
    const ultimasDe = (lista: string[]) =>
      lista.filter((pieza, indice) => lista.lastIndexOf(pieza) === indice);
    const piezas: string[] = [];
    do {
      piezas.length = 0;
      for (let i = 0; i < enteroEntre(aleatorio, 6, 9); i++) {
        piezas.push(bolsa[Math.floor(aleatorio() * bolsa.length)]);
      }
      // Garantía: un orden de primeras apariciones distinto del de últimas. Si coincidieran,
      // casi cualquier desliz de orden pasaría por buena.
    } while (JSON.stringify(primerasDe(piezas)) === JSON.stringify(ultimasDe(piezas)));
    return { piezas: piezas.join(", ") };
  },
  fabrica: (datos) => {
    const hecho = armaRepetidos(datos, "");
    return {
      enunciado:
        "Escribe `sinRepetir(piezas)`: una lista nueva, sin repetidos, conservando el orden del " +
        "momento en que cada pieza apareció por PRIMERA vez. El caso A repite piezas en desorden. " +
        "El desliz clásico: quedarte con la ÚLTIMA vez que se vio cada pieza (o cualquiera), " +
        "que cambia el orden y por eso la entrega lo marca.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaRepetidos(
      datos,
      "  const salida = [];\n" +
        "  for (const pieza of piezas) {\n" +
        "    if (!salida.includes(pieza)) {\n" +
        "      salida.push(pieza);\n" +
        "    }\n" +
        "  }\n" +
        "  return salida;\n",
    ).codigo,
  solucionCasi: (datos) =>
    armaRepetidos(
      datos,
      "  const salida = piezas.filter(function (pieza, indice) {\n" +
        "    return piezas.lastIndexOf(pieza) === indice;\n" +
        "  });\n" +
        "  return salida;\n",
    ).codigo,
};

//
// colecciones-ocho — los parejas que suman
//

function armaParejas(datos: DatosReto, cuerpo: string) {
  const numeros = datos.casoA.split(", ").map(Number);
  const objetivo = Number(datos.objetivo);
  const parejasDe = (lista: number[], suma: number): number => {
    let cuenta = 0;
    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        if (lista[i] + lista[j] === suma) cuenta += 1;
      }
    }
    return cuenta;
  };
  const codigo = plantillaReto({
    nombre: "cuentaParejas",
    firma: "numeros, objetivo",
    pista: "Devuelve cuántas parejas de posiciones distintas, la primera antes que la segunda, suman el objetivo.",
    cuerpo,
    casos: `console.log("A:", cuentaParejas(${literalLista(numeros)}, ${objetivo}));\n`,
    final: `cuentaParejas(${literalLista(numeros)}, ${objetivo});\n`,
  });
  const salida = `A: ${parejasDe(numeros, objetivo)}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("colecciones-ocho", salida, parejasDe(numeros, objetivo)) };
}

export const coleccionesOcho: RetoCompleto = {
  id: "colecciones-ocho",
  titulo: "Las parejas que suman",
  familia: "colecciones",
  nivel: 8,
  conceptos: ["bucle", "invariante", "complejidad"],
  preguntasDefensa: [
    "¿De dónde a dónde recorre tu bucle interior y qué garantiza la posición de j respecto de i?",
    "¿Cuántas comparaciones hace tu código en total con la lista del caso A? Justifícalo con tus dos bucles.",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    const numeros = listaDeNumeros(aleatorio, { minimoLargo: 8, maximoLargo: 9, valorMinimo: 1, valorMaximo: 30 });
    // El objetivo sale de dos posiciones reales de la lista: hay al menos una pareja.
    const i = Math.floor(aleatorio() * (numeros.length - 1));
    const j = i + 1 + Math.floor(aleatorio() * (numeros.length - 1 - i));
    return { casoA: numeros.join(", "), objetivo: String(numeros[i] + numeros[j]) };
  },
  fabrica: (datos) => {
    const hecho = armaParejas(datos, "");
    return {
      enunciado:
        "Escribe `cuentaParejas(numeros, objetivo)`: cuántas parejas de la lista, tomando cada " +
        "pareja de posiciones en el orden natural —la del índice menor antes que la del mayor—, " +
        "suman exactamente el `objetivo`. Cada pareja se cuenta una sola vez: `(3, 7)`, no también " +
        "`(7, 3)`. El desliz clásico es recorrer los dos bucles por completo y contar cada pareja " +
        "por partida doble.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaParejas(
      datos,
      "  let cuenta = 0;\n" +
        "  for (let i = 0; i < numeros.length; i++) {\n" +
        "    for (let j = i + 1; j < numeros.length; j++) {\n" +
        "      if (numeros[i] + numeros[j] === objetivo) {\n" +
        "        cuenta = cuenta + 1;\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "  return cuenta;\n",
    ).codigo,
  solucionCasi: (datos) =>
    armaParejas(
      datos,
      "  let cuenta = 0;\n" +
        "  for (let i = 0; i < numeros.length; i++) {\n" +
        "    for (let j = 0; j < numeros.length; j++) {\n" +
        "      if (i !== j && numeros[i] + numeros[j] === objetivo) {\n" +
        "        cuenta = cuenta + 1;\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "  return cuenta;\n",
    ).codigo,
};

export const retosDeColecciones: RetoCompleto[] = [
  coleccionesDos,
  coleccionesCinco,
  coleccionesOcho,
];
