import type { TestSpec } from "@/lib/ejecucion/tipos";
import { elegirDe, enteroEntre } from "../semilla.ts";
import type { DatosReto, Rand } from "../tipos";
import { literalTexto, plantillaReto, type RetoCompleto } from "./utiles.ts";

/**
 * Familia «funciones» (0.4.B): piezas llamables. Firma, caso base, llamada de la recursión y
 * lo que vale la función devolver.
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
// funciones-dos — repite con separación
//

function armaRepite(datos: DatosReto, cuerpo: string) {
  const texto = datos.texto;
  const vecesA = Number(datos.vecesA);
  const vecesB = Number(datos.vecesB);
  const vecesC = Number(datos.vecesC);
  const repite = (cita: string, veces: number): string =>
    Array.from({ length: Math.max(0, veces) }).fill(cita).join(" ");
  const A = `repite(${literalTexto(texto)}, ${vecesA})`;
  const B = `repite(${literalTexto(texto)}, ${vecesB})`;
  const C = `repite(${literalTexto(texto)}, ${vecesC})`;
  const codigo = plantillaReto({
    nombre: "repite",
    firma: "texto, veces",
    pista: 'Devuelve el texto repetido `veces` veces, con un espacio entre copias. Con veces 0, "".',
    cuerpo,
    casos:
      `console.log("A:", ${A});\n` +
      `console.log("B:", ${B});\n` +
      `console.log("C:", ${C});\n`,
    final: `${A};\n`,
  });
  const salida =
    `A: ${repite(texto, vecesA)}\n` +
    `B: ${repite(texto, vecesB)}\n` +
    `C: ${repite(texto, vecesC)}\n`;
  return {
    codigo,
    pruebas: pruebasSalidaRetorno("funciones-dos", salida, repite(texto, vecesA)),
  };
}

export const funcionesDos: RetoCompleto = {
  id: "funciones-dos",
  titulo: "Repite con separación",
  familia: "funciones",
  nivel: 2,
  conceptos: ["funcion", "prueba"],
  preguntasDefensa: [
    "¿Por qué tu caso de 0 copias devuelve exactamente una cadena vacía y no un espacio suelto?",
    "¿Dónde hace falta tu línea que pone el separador y por qué no en todas las vueltas?",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    // La palabra se compone al azar con un alfabeto grande: así dos personas rara vez
    // reciben la misma variante, y la trampa de las 0 copias sigue plantada en B.
    const alfabeto = "abcdefghijkmnopqrstuvwxyz";
    const largo = enteroEntre(aleatorio, 5, 8);
    let palabra = "";
    for (let i = 0; i < largo; i++) {
      palabra += alfabeto[Math.floor(aleatorio() * alfabeto.length)];
    }
    return {
      texto: palabra,
      // B es la trampa: 0 copias tiene que quedar vacío del todo, hasta el separador final.
      vecesA: String(enteroEntre(aleatorio, 2, 4)),
      vecesB: "0",
      vecesC: "1",
    };
  },
  fabrica: (datos) => {
    const hecho = armaRepite(datos, "");
    return {
      enunciado:
        "Escribe `repite(texto, veces)`: devuelve el texto repetido `veces` veces, con un espacio " +
        "entre copia y copia, y sin espacio de más. Con `veces` 0 devuelve la cadena vacía. " +
        "El desliz clásico es pegar el separador en cada vuelta y dejar uno colgado al final, " +
        "o romper con 0 copias.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaRepite(
      datos,
      '  let salida = "";\n' +
        "  for (let i = 0; i < veces; i++) {\n" +
        "    if (i > 0) {\n" +
        '      salida = salida + " ";\n' +
        "    }\n" +
        "    salida = salida + texto;\n" +
        "  }\n" +
        "  return salida;\n",
    ).codigo,
  solucionCasi: (datos) =>
    armaRepite(
      datos,
      '  let salida = "";\n' +
        "  for (let i = 0; i < veces; i++) {\n" +
        "    salida = salida + texto + \" \";\n" +
        "  }\n" +
        "  return salida;\n",
    ).codigo,
};

//
// funciones-cinco — el máximo común divisor
//

function armaDivisor(datos: DatosReto, cuerpo: string) {
  const a = Number(datos.a);
  const b = Number(datos.b);
  const mcdDe = (x: number, y: number): number => {
    let grande = x;
    let pequeno = y;
    while (pequeno !== 0) {
      const resto = grande % pequeno;
      grande = pequeno;
      pequeno = resto;
    }
    return grande;
  };
  const P = `mcd(${datos.a}, ${datos.b})`;
  const Q = `mcd(${datos.igual}, ${datos.igual})`;
  const codigo = plantillaReto({
    nombre: "mcd",
    firma: "a, b",
    pista: "Devuelve el máximo común divisor de a y b, del modo que quieras: por restas o por restos.",
    cuerpo,
    casos: `console.log("A:", ${P});\nconsole.log("B:", ${Q});\n`,
    final: `${P};\n`,
  });
  const salida = `A: ${mcdDe(a, b)}\nB: ${mcdDe(Number(datos.igual), Number(datos.igual))}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("funciones-cinco", salida, mcdDe(a, b)) };
}

export const funcionesCinco: RetoCompleto = {
  id: "funciones-cinco",
  titulo: "El máximo común divisor",
  familia: "funciones",
  nivel: 5,
  conceptos: ["funcion", "bucle", "invariante"],
  preguntasDefensa: [
    "¿Por qué tu bucle arranca donde arranca y por qué el número que devuelve es el máximo y no un múltiplo?",
    "Recorre tu código con el caso A: ¿qué vale tu variable de resto en la última vuelta?",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    let a = 30;
    let b = 20;
    // a > b y b no divide a a: así la casi correcta (que devolvería el segundo número) no
    // pasa por coincidencia.
    do {
      a = enteroEntre(aleatorio, 30, 90);
      b = enteroEntre(aleatorio, 20, a - 1);
    } while (a % b === 0);
    return {
      a: String(a),
      b: String(b),
      // El par B se compone del mismo número dos veces: un extremo fácil de romper.
      igual: String(enteroEntre(aleatorio, 7, 40)),
    };
  },
  fabrica: (datos) => {
    const hecho = armaDivisor(datos, "");
    return {
      enunciado:
        "Escribe `mcd(a, b)`: el máximo común divisor, con el que quieras: por restas o por restos, " +
        "con un bucle. El máximo de 48 y 18 es 6: no el producto, no la suma de divides. El caso B " +
        "es una pareja compuesta por el mismo número dos veces, donde el máximo es ese número. " +
        "El desliz clásico: actualizar la misma variable que acabas de usar en el resto.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaDivisor(
      datos,
      "  let grande = a;\n" +
        "  let pequeno = b;\n" +
        "  while (pequeno !== 0) {\n" +
        "    const resto = grande % pequeno;\n" +
        "    grande = pequeno;\n" +
        "    pequeno = resto;\n" +
        "  }\n" +
        "  return grande;\n",
    ).codigo,
  solucionCasi: (datos) =>
    armaDivisor(
      datos,
      "  let grande = a;\n" +
        "  let pequeno = b;\n" +
        "  while (pequeno !== 0) {\n" +
        "    grande = pequeno;\n" +
        "    pequeno = grande % pequeno;\n" +
        "  }\n" +
        "  return grande;\n",
    ).codigo,
};

//
// funciones-ocho — subir la escalera, con recursión
//

function armaEscalera(datos: DatosReto, cuerpo: string) {
  const subir = (n: number): number => {
    if (n === 0 || n === 1) return 1;
    return subir(n - 1) + subir(n - 2);
  };
  const A = `subirEscalera(${datos.peldanos})`;
  const codigo = plantillaReto({
    nombre: "subirEscalera",
    firma: "peldanos",
    pista: "Devuelve de cuántas maneras se puede subir una escalera de `peldanos` peldaños dando saltos de 1 o de 2.",
    cuerpo,
    casos: `console.log("A:", ${A});\n`,
    final: `${A};\n`,
  });
  const n = Number(datos.peldanos);
  const salida = `A: ${subir(n)}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("funciones-ocho", salida, subir(n)) };
}

export const funcionesOcho: RetoCompleto = {
  id: "funciones-ocho",
  titulo: "Subir la escalera",
  familia: "funciones",
  nivel: 8,
  conceptos: ["recursion", "pila-de-llamadas", "funcion"],
  preguntasDefensa: [
    "¿Cuántas vueltas hace tu función antes de tocar el caso base con el valor del caso A? ¿Por qué?",
    "Si alguien llama a tu función con un peldaño más, ¿cuántas llamadas recientes entran y salen de la pila? Justifícalo mirando tu código.",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => ({
    peldanos: String(enteroEntre(aleatorio, 9, 16)),
  }),
  fabrica: (datos) => {
    const hecho = armaEscalera(datos, "");
    return {
      enunciado:
        "Escribe `subirEscalera(peldanos)`: de cuántas maneras distintas se puede subir una escalera " +
        "de `peldanos` peldaños si en cada paso das un salto de 1 o de 2. Con 0 peldaños hay una " +
        "manera: no moverse. El desliz clásico es tomar la base como `peldanos <= 1` devuelve " +
        "`peldanos`, que hace caer todo el árbol desde el 0. Piensa el caso base antes del caso general.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaEscalera(
      datos,
      "  if (peldanos === 0) {\n    return 1;\n  }\n  if (peldanos === 1) {\n    return 1;\n  }\n" +
        "  return subirEscalera(peldanos - 1) + subirEscalera(peldanos - 2);\n",
    ).codigo,
  solucionCasi: (datos) =>
    armaEscalera(
      datos,
      "  if (peldanos <= 1) {\n    return peldanos;\n  }\n  return subirEscalera(peldanos - 1) + subirEscalera(peldanos - 2);\n",
    ).codigo,
};

export const retosDeFunciones: RetoCompleto[] = [funcionesDos, funcionesCinco, funcionesOcho];
