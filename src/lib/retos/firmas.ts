export type TipoDato = "entero" | "texto" | "booleano" | "enteros" | "textos";
export type Dato = number | string | boolean | number[] | string[];
export type Firma = {
  nombre: string;
  parametros: readonly (readonly [string, TipoDato])[];
  devuelve: TipoDato;
};

export const firmas: Record<string, Firma> = {
  "bucles-dos": { nombre: "sumaLista", parametros: [["numeros", "enteros"]], devuelve: "entero" },
  "bucles-cinco": {
    nombre: "cuentaMultiplos",
    parametros: [
      ["salto", "entero"],
      ["desde", "entero"],
      ["hasta", "entero"],
    ],
    devuelve: "entero",
  },
  "bucles-ocho": { nombre: "rachaMayor", parametros: [["numeros", "enteros"]], devuelve: "entero" },
  "condicionales-dos": { nombre: "signoDe", parametros: [["n", "entero"]], devuelve: "texto" },
  "condicionales-cinco": {
    nombre: "franjaDe",
    parametros: [
      ["nota", "entero"],
      ["franja1", "entero"],
      ["franja2", "entero"],
      ["franja3", "entero"],
    ],
    devuelve: "texto",
  },
  "condicionales-ocho": {
    nombre: "cobra",
    parametros: [
      ["importe", "entero"],
      ["esSocio", "booleano"],
      ["esPrimera", "booleano"],
    ],
    devuelve: "texto",
  },
  "funciones-dos": {
    nombre: "repite",
    parametros: [
      ["texto", "texto"],
      ["veces", "entero"],
    ],
    devuelve: "texto",
  },
  "funciones-cinco": {
    nombre: "mcd",
    parametros: [
      ["a", "entero"],
      ["b", "entero"],
    ],
    devuelve: "entero",
  },
  "funciones-ocho": {
    nombre: "subirEscalera",
    parametros: [["peldanos", "entero"]],
    devuelve: "entero",
  },
  "colecciones-dos": {
    nombre: "mayorDe",
    parametros: [["numeros", "enteros"]],
    devuelve: "entero",
  },
  "colecciones-cinco": {
    nombre: "sinRepetir",
    parametros: [["piezas", "textos"]],
    devuelve: "textos",
  },
  "colecciones-ocho": {
    nombre: "cuentaParejas",
    parametros: [
      ["numeros", "enteros"],
      ["objetivo", "entero"],
    ],
    devuelve: "entero",
  },
  "cadenas-dos": { nombre: "cuentaVocales", parametros: [["texto", "texto"]], devuelve: "entero" },
  "cadenas-cinco": { nombre: "acronimoDe", parametros: [["frase", "texto"]], devuelve: "texto" },
  "cadenas-ocho": {
    nombre: "esPalindromo",
    parametros: [["texto", "texto"]],
    devuelve: "booleano",
  },
};
