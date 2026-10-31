import type { TestSpec } from "@/lib/ejecucion/tipos";
import type { DatosReto, Rand } from "../tipos";
import { plantillaReto, type RetoCompleto } from "./utiles.ts";

/**
 * Familia «condicionales» (0.4.B): decidir. Los bordes de cada franja, la prioridad de las
 * reglas y el caso que nadie mira: el casi de esta familia siempre cae en un borde.
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
// condicionales-dos — el signo, con su caso cero
//

function armaSigno(datos: DatosReto, cuerpo: string) {
  const A = Number(datos.casoA);
  const C = Number(datos.casoC);
  const signoDe = (valor: number): string => (valor > 0 ? "positivo" : valor < 0 ? "negativo" : "cero");
  const codigo = plantillaReto({
    nombre: "signoDe",
    firma: "n",
    pista: "Devuelve \"positivo\", \"negativo\" o \"cero\", según el número.",
    cuerpo,
    casos:
      `console.log("A:", signoDe(${A}));\n` +
      `console.log("B:", signoDe(0));\n` +
      `console.log("C:", signoDe(${C}));\n`,
    final: `signoDe(${A});\n`,
  });
  const salida = `A: ${signoDe(A)}\nB: cero\nC: ${signoDe(C)}\n`;
  return { codigo, pruebas: pruebasSalidaRetorno("condicionales-dos", salida, signoDe(A)) };
}

export const condicionalesDos: RetoCompleto = {
  id: "condicionales-dos",
  titulo: "El signo, con su caso cero",
  familia: "condicionales",
  nivel: 2,
  conceptos: ["condicion", "prueba"],
  preguntasDefensa: [
    "En tu propio código: ¿qué pasa con el número 0 exactamente, rama por rama?",
    "Si alguien te pasa otro número negativo, ¿por qué tu función sigue bien?",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    // A y C de signos contrarios y nunca cero: el caso cero está plantado en B a propósito.
    const a = 1 + Math.floor(aleatorio() * 9);
    const c = 1 + Math.floor(aleatorio() * 9);
    const aNegativo = aleatorio() < 0.5;
    return { casoA: String(aNegativo ? -a : a), casoC: String(aNegativo ? c : -c) };
  },
  fabrica: (datos) => {
    const hecho = armaSigno(datos, "");
    return {
      enunciado:
        "Escribe `signoDe(n)`: devuelve `\"positivo\"` si el número es mayor que cero, `\"negativo\"` " +
        "si es menor, y `\"cero\"` si es exactamente 0. El caso 0 está en B. El desliz clásico es " +
        "olvidarlo: si tu última rama es un `else` suelto, el cero cae donde menos le conviene.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaSigno(
      datos,
      '  if (n > 0) {\n    return "positivo";\n  } else if (n < 0) {\n    return "negativo";\n  }\n  return "cero";\n',
    ).codigo,
  solucionCasi: (datos) =>
    armaSigno(
      datos,
      '  if (n > 0) {\n    return "positivo";\n  } else {\n    return "negativo";\n  }\n',
    ).codigo,
};

//
// condicionales-cinco — la nota a su franja
//

function armaFranja(datos: DatosReto, cuerpo: string) {
  const l1 = Number(datos.franja1);
  const l2 = Number(datos.franja2);
  const l3 = Number(datos.franja3);
  const notaA = Number(datos.notaA);
  const franjaDe = (nota: number, a: number, b: number, c: number): string => {
    if (nota < a) return "insuficiente";
    if (nota < b) return "suficiente";
    if (nota < c) return "notable";
    return "sobresaliente";
  };
  const codigo = plantillaReto({
    nombre: "franjaDe",
    firma: "nota, franja1, franja2, franja3",
    pista: 'Devuelve la franja de la nota contra los tres límites: bajo franja2 va "insuficiente".',
    cuerpo,
    casos:
      `console.log("A:", franjaDe(${notaA}, ${l1}, ${l2}, ${l3}));\n` +
      `console.log("B:", franjaDe(${l2}, ${l1}, ${l2}, ${l3}));\n` +
      `console.log("C:", franjaDe(10, ${l1}, ${l2}, ${l3}));\n`,
    final: `franjaDe(${notaA}, ${l1}, ${l2}, ${l3});\n`,
  });
  const salida =
    `A: ${franjaDe(notaA, l1, l2, l3)}\n` +
    `B: ${franjaDe(l2, l1, l2, l3)}\n` +
    `C: ${franjaDe(10, l1, l2, l3)}\n`;
  return {
    codigo,
    pruebas: pruebasSalidaRetorno("condicionales-cinco", salida, franjaDe(notaA, l1, l2, l3)),
  };
}

export const condicionalesCinco: RetoCompleto = {
  id: "condicionales-cinco",
  titulo: "La nota a su franja",
  familia: "condicionales",
  nivel: 5,
  conceptos: ["condicion", "prueba"],
  preguntasDefensa: [
    "La nota de B cae justo en el borde: ¿por qué tu código la manda a la franja que manda y no a la de al lado?",
    "Si los tres límites cambiaran de orden (sin reescribir tu lógica), ¿qué saldría mal y dónde lo ves en tu código?",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    const l1 = 4 + Math.floor(aleatorio() * 2); // 4 o 5
    const notaA = Math.floor(aleatorio() * 11); // 0 a 10
    return {
      franja1: String(l1),
      franja2: String(l1 + 2),
      franja3: String(l1 + 4),
      notaA: String(notaA),
    };
  },
  fabrica: (datos) => {
    const hecho = armaFranja(datos, "");
    return {
      enunciado:
        "Escribe `franjaDe(nota, franja1, franja2, franja3)`: " +
        "con la nota menor que `franja1` devuelve `\"insuficiente\"`; menor que `franja2`, `\"suficiente\"`; " +
        "menor que `franja3`, `\"notable\"`; y con la nota en `franja3` o más, `\"sobresaliente\"`. " +
        "El caso B cae justo en el borde `franja2`. El desliz clásico es un `<=` metido donde va `<`.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaFranja(
      datos,
      '  if (nota < franja1) {\n    return "insuficiente";\n  } else if (nota < franja2) {\n    return "suficiente";\n  } else if (nota < franja3) {\n    return "notable";\n  }\n  return "sobresaliente";\n',
    ).codigo,
  solucionCasi: (datos) =>
    armaFranja(
      datos,
      '  if (nota < franja1) {\n    return "insuficiente";\n  } else if (nota <= franja2) {\n    return "suficiente";\n  } else if (nota < franja3) {\n    return "notable";\n  }\n  return "sobresaliente";\n',
    ).codigo,
};

//
// condicionales-ocho — el orden manda
//

function armaCobro(datos: DatosReto, cuerpo: string) {
  const cobra = (importe: number, esSocio: boolean, esPrimera: boolean): string => {
    if (esPrimera) return "bienvenida";
    if (esSocio) return "descuento-socio";
    if (importe >= 50) return "envio-gratis";
    return "sin-descuento";
  };
  const A = `cobra(${datos.importeA}, ${datos.socioA}, ${datos.primeraA})`;
  const B = `cobra(${datos.importeB}, ${datos.socioB}, ${datos.primeraB})`;
  const C = `cobra(${datos.importeC}, ${datos.socioC}, ${datos.primeraC})`;
  const codigo = plantillaReto({
    nombre: "cobra",
    firma: "importe, esSocio, esPrimera",
    pista: 'Devuelve "bienvenida", "descuento-socio", "envio-gratis" o "sin-descuento" según las reglas, en orden.',
    cuerpo,
    casos:
      `console.log("A:", ${A});\n` +
      `console.log("B:", ${B});\n` +
      `console.log("C:", ${C});\n`,
    final: `${A};\n`,
  });
  const salida =
    `A: ${cobra(Number(datos.importeA), datos.socioA === "true", datos.primeraA === "true")}\n` +
    `B: ${cobra(Number(datos.importeB), datos.socioB === "true", datos.primeraB === "true")}\n` +
    `C: ${cobra(Number(datos.importeC), datos.socioC === "true", datos.primeraC === "true")}\n`;
  const retorno = cobra(Number(datos.importeA), datos.socioA === "true", datos.primeraA === "true");
  return { codigo, pruebas: pruebasSalidaRetorno("condicionales-ocho", salida, retorno) };
}

export const condicionalesOcho: RetoCompleto = {
  id: "condicionales-ocho",
  titulo: "El orden manda",
  familia: "condicionales",
  nivel: 8,
  conceptos: ["condicion", "prueba"],
  preguntasDefensa: [
    "¿Qué pasa en tu código si la persona es primera cliente y además compra más de 50? ¿Por qué sale la rama que sale?",
    "Si mañana cambian el orden de las reglas, ¿cuántas líneas tuyas toca mover? Justifícalo con tu código.",
  ],
  crearDatos: (aleatorio: Rand): DatosReto => {
    const importe = (minimo: number) => String(minimo + Math.floor(aleatorio() * (90 - minimo)));
    return {
      // A: el caso que hundía el orden: fuerte y primera cliente a la vez.
      importeA: importe(50),
      socioA: "false",
      primeraA: "true",
      // B: socio sin primera ni compra grande (20 a 49).
      importeB: String(20 + Math.floor(aleatorio() * 30)),
      socioB: "true",
      primeraB: "false",
      // C: compra grande sin socio ni primera.
      importeC: importe(50),
      socioC: "false",
      primeraC: "false",
    };
  },
  fabrica: (datos) => {
    const hecho = armaCobro(datos, "");
    return {
      enunciado:
        "Escribe `cobra(importe, esSocio, esPrimera)` con estas reglas, en este orden exacto: " +
        "1) si es primera compra, `\"bienvenida\"`; 2) si es socio, `\"descuento-socio\"`; " +
        "3) si compra 50 o más, `\"envio-gratis\"`; 4) en cualquier otro caso, `\"sin-descuento\"`. " +
        "El orden importa: la regla 1 gana aunque también cumpla la 3. El desliz clásico es " +
        "empezar por la regla del importe y hacer que la primera compra cobre menos.",
      codigoDePartida: hecho.codigo,
      pruebas: hecho.pruebas,
    };
  },
  solucionReferencia: (datos) =>
    armaCobro(
      datos,
      '  if (esPrimera) {\n    return "bienvenida";\n  } else if (esSocio) {\n    return "descuento-socio";\n  } else if (importe >= 50) {\n    return "envio-gratis";\n  }\n  return "sin-descuento";\n',
    ).codigo,
  solucionCasi: (datos) =>
    armaCobro(
      datos,
      '  if (importe >= 50) {\n    return "envio-gratis";\n  } else if (esPrimera) {\n    return "bienvenida";\n  } else if (esSocio) {\n    return "descuento-socio";\n  }\n  return "sin-descuento";\n',
    ).codigo,
};

export const retosDeCondicionales: RetoCompleto[] = [
  condicionalesDos,
  condicionalesCinco,
  condicionalesOcho,
];
