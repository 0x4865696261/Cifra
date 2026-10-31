import type { TestSpec } from "@/lib/ejecucion/tipos";
import { elegirDe, enteroEntre } from "../semilla.ts";
import type { DatosReto, Rand } from "../tipos";
import { literalTexto, plantillaReto, type RetoCompleto } from "./utiles.ts";

/**
 * Familia «cadenas» (0.4.B): tratar el texto. Qué es letra, qué es palabra, qué pasa con las
 * mayúsculas y con los signos. El casi de esta familia cae en una forma no mirada del texto.
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
// cadenas-dos — cuenta las vocales, con y sin mayúsculas
//

function armaVocales(datos: DatosReto, cuerpo: string) {
  const cuentaDe = (texto: string): number => {
    return texto.replace(/[^aeiouAEIOU]/g, "").length;
  };
  const A = `cuentaVocales(${literalTexto(datos.casoA)})`;
  const codigo = plantillaReto({
    nombre: "cuentaVocales",
    firma: "texto",
    pista: "Devuelve cuántas vocales a, e, i, o, u hay en el texto, mayúsculas y minúsculas por igual.",
    cuerpo,
    casos: `console.log("A:", ${A});\n`,
    final: `${A};\n`,
  });
  const salida = `A: ${cuentaDe(datos.casoA)}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("cadenas-dos", salida, cuentaDe(datos.casoA)) };
}

export const cadenasDos: RetoCompleto = {
  id: "cadenas-dos",
  titulo: "Cuenta las vocales",
  familia: "cadenas",
  nivel: 2,
  conceptos: ["variable", "bucle"],
  preguntasDefensa: [
    "En tu propio código: ¿por qué las mayúsculas de tu texto cuentan igual que las minúsculas?",
    "¿Qué es exactamente lo que tu bucle compara en cada vuelta? Ponlo en palabras con el texto del caso A.",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    // El texto lleva SIEMPRE alguna vocal mayúscula: la casi correcta (que solo mira
    // minúsculas) no pasa por coincidencia. La segunda parte alarga el texto base con una
    // palabra en minúsculas, para que el espacio de variantes sea grande.
    const conMayusculas = ["aRenA", "ELEFANTE", "Rotunda", "Olvidada", "impidIO", "subSUELO"];
    const enMinusculas = ["taburete", "mermelada", "puerca", "colmena", "tuvieron"];
    return { casoA: `${elegirDe(aleatorio, conMayusculas)} ${elegirDe(aleatorio, enMinusculas)}` };
  },
  fabrica: (datos) => {
    const hecho = armaVocales(datos, "");
    return {
      enunciado:
        "Escribe `cuentaVocales(texto)`: cuántas vocales contiene, contando igual `\"a\"` y `\"A\"`. " +
        "El texto del caso A mezcla mayúsculas y minúsculas a propósito. El desliz clásico: " +
        "comparar letra a letra solo con las minúsculas y perder las de arriba.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaVocales(
      datos,
      "  let cuenta = 0;\n" +
        "  const enMinusculas = texto.toLowerCase();\n" +
        "  for (const letra of enMinusculas) {\n" +
        "    if (\"aeiou\".includes(letra)) {\n" +
        "      cuenta = cuenta + 1;\n" +
        "    }\n" +
        "  }\n" +
        "  return cuenta;\n",
    ).codigo,
  solucionCasi: (datos) =>
    armaVocales(
      datos,
      "  let cuenta = 0;\n" +
        "  for (const letra of texto) {\n" +
        "    if (\"aeiou\".includes(letra)) {\n" +
        "      cuenta = cuenta + 1;\n" +
        "    }\n" +
        "  }\n" +
        "  return cuenta;\n",
    ).codigo,
};

//
// cadenas-cinco — el acrónimo
//

function armaAcronimo(datos: DatosReto, cuerpo: string) {
  const acronimoDe = (frase: string): string => {
    return frase
      .split(" ")
      .filter((palabra) => palabra.length > 0)
      .map((palabra) => palabra.charAt(0).toUpperCase())
      .join("");
  };
  const A = `acronimoDe(${literalTexto(datos.frase)})`;
  const codigo = plantillaReto({
    nombre: "acronimoDe",
    firma: "frase",
    pista: "Devuelve una palabra con las iniciales de cada palabra de la frase, todas en mayúscula.",
    cuerpo,
    casos: `console.log("A:", ${A});\n`,
    final: `${A};\n`,
  });
  const salida = `A: ${acronimoDe(datos.frase)}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("cadenas-cinco", salida, acronimoDe(datos.frase)) };
}

export const cadenasCinco: RetoCompleto = {
  id: "cadenas-cinco",
  titulo: "El acrónimo",
  familia: "cadenas",
  nivel: 5,
  conceptos: ["variable", "prueba"],
  preguntasDefensa: [
    "¿Por qué tu código salta los huecos dobles sin fallar? Míralo en tu bucle con una palabra vacía.",
    "¿Dónde conviertes a mayúscula cada letra y por qué no hace falta convertir la palabra entera?",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    const bolsa = ["mercado", "central", "abasto", "plaza", "bilbao", "grande"];
    const piezas: string[] = [];
    // Cuatro palabras; el hueco vacío después de la segunda está garantizado, para que la
    // frase traiga doble espacio siempre.
    for (let i = 0; i < 4; i++) {
      piezas.push(elegirDe(aleatorio, bolsa));
      if (i === 1 || aleatorio() < 0.4) piezas.push("");
    }
    if (piezas[piezas.length - 1] === "") piezas.pop();
    return { frase: piezas.join(" ") };
  },
  fabrica: (datos) => {
    const hecho = armaAcronimo(datos, "");
    return {
      enunciado:
        "Escribe `acronimoDe(frase)`: una palabra en MAYÚSCULAS hecha con la primera letra de cada " +
        "palabra de la frase. Las palabras van separadas por espacios, y la frase a veces trae " +
        "doble espacio: esas palabras vacías ni cuentan ni fallan. El desliz clásico: mandar la " +
        "letra sin subir a mayúscula.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaAcronimo(
      datos,
      "  let salida = '';\n" +
        "  for (const palabra of frase.split(' ')) {\n" +
        "    if (palabra.length > 0) {\n" +
        "      salida = salida + palabra.charAt(0).toUpperCase();\n" +
        "    }\n" +
        "  }\n" +
        "  return salida;\n",
    ).codigo,
  solucionCasi: (datos) =>
    armaAcronimo(
      datos,
      "  let salida = '';\n" +
        "  for (const palabra of frase.split(' ')) {\n" +
        "    if (palabra.length > 0) {\n" +
        "      salida = salida + palabra.charAt(0);\n" +
        "    }\n" +
        "  }\n" +
        "  return salida;\n",
    ).codigo,
};

//
// cadenas-ocho — el palíndromo, respetando lo que no es letra
//

function armaPalindromo(datos: DatosReto, cuerpo: string) {
  const esDe = (texto: string): boolean => {
    const limpio = texto.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (limpio.length === 0) return false;
    let i = 0;
    let j = limpio.length - 1;
    while (i < j) {
      if (limpio[i] !== limpio[j]) return false;
      i++;
      j--;
    }
    return true;
  };
  const A = `esPalindromo(${literalTexto(datos.casoA)})`;
  const B = `esPalindromo(${literalTexto(datos.casoB)})`;
  const C = `esPalindromo(${literalTexto(datos.casoC)})`;
  const codigo = plantillaReto({
    nombre: "esPalindromo",
    firma: "texto",
    pista: "Devuelve true solo si el texto se lee igual del derecho y del revés, sin espacios ni signos.",
    cuerpo,
    casos:
      `console.log("A:", ${A});\n` +
      `console.log("B:", ${B});\n` +
      `console.log("C:", ${C});\n`,
    final: `${A};\n`,
  });
  const salida = `A: ${esDe(datos.casoA)}\nB: ${esDe(datos.casoB)}\nC: ${esDe(datos.casoC)}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("cadenas-ocho", salida, esDe(datos.casoA)) };
}

export const cadenasOcho: RetoCompleto = {
  id: "cadenas-ocho",
  titulo: "El palíndromo con lo de fuera",
  familia: "cadenas",
  nivel: 8,
  conceptos: ["prueba", "funcion"],
  preguntasDefensa: [
    "¿Dónde decides en tu código qué se mete a la comparación y qué se queda fuera?",
    "Si el texto fuera solo signos de puntuación, ¿qué devolvería tu función y por qué está bien?",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    const palindromos = [
      "Somos o no somos.",
      "Amo la pacífica paloma.",
      "Anita lava la tina",
      "¿Acaso hubo búhos acá?",
    ];
    const rotos = ["Sé lo que dije.", "Ruta tras ruta a cambiar", "Ojo, ¡cuidado!"];
    return {
      casoA: elegirDe(aleatorio, palindromos),
      casoB: elegirDe(aleatorio, rotos),
      casoC: "La ruta nos aportó otro paso natural.",
    };
  },
  fabrica: (datos) => {
    const hecho = armaPalindromo(datos, "");
    return {
      enunciado:
        "Escribe `esPalindromo(texto)`: true si el texto se lee igual del derecho y del revés " +
        "cuando solo cuentan letras y dígitos, y mayúsculas y minúsculas son la misma cosa. Los " +
        "espacios, la comas y los signos no cuentan. Un texto sin ninguna letra ni dígito no es " +
        "palíndromo. El desliz clásico: comparar el texto tal cual, sin limpiarlo de signos.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaPalindromo(
      datos,
      "  let limpio = '';\n" +
        "  for (const letra of texto.toLowerCase()) {\n" +
        "    const esLetra = letra >= 'a' && letra <= 'z';\n" +
        "    const esDigito = letra >= '0' && letra <= '9';\n" +
        "    if (esLetra || esDigito) {\n" +
        "      limpio = limpio + letra;\n" +
        "    }\n" +
        "  }\n" +
        "  if (limpio.length === 0) {\n    return false;\n  }\n" +
        "  for (let i = 0; i < limpio.length / 2; i++) {\n" +
        "    if (limpio[i] !== limpio[limpio.length - 1 - i]) {\n" +
        "      return false;\n" +
        "    }\n" +
        "  }\n" +
        "  return true;\n",
    ).codigo,
  solucionCasi: (datos) =>
    armaPalindromo(
      datos,
      "  let limpio = texto.toLowerCase().split(' ').join('');\n" +
        "  if (limpio.length === 0) {\n    return false;\n  }\n" +
        "  for (let i = 0; i < limpio.length / 2; i++) {\n" +
        "    if (limpio[i] !== limpio[limpio.length - 1 - i]) {\n" +
        "      return false;\n" +
        "    }\n" +
        "  }\n" +
        "  return true;\n",
    ).codigo,
};

export const retosDeCadenas: RetoCompleto[] = [cadenasDos, cadenasCinco, cadenasOcho];
