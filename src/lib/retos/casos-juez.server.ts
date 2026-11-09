import { randomBytes } from "node:crypto";
import { argumento } from "./adaptadores-juez.ts";
import { definicionPorId, instanciaReto } from "./retos.ts";
import type { Dato, Firma } from "./firmas.ts";

export type CasoJuez = {
  id: string;
  visible: boolean;
  args: string[];
  esperado: string;
  entrada: Dato[];
};

function casosDeVariante(id: string, semilla: string, firma: Firma): CasoJuez[] {
  const reto = definicionPorId(id);
  if (!reto) throw new Error("Reto desconocido");
  const { codigoDePartida, pruebas } = instanciaReto(reto, semilla);
  const lineas = pruebas.find((prueba) => prueba.tipo === "salida")?.esperado;
  if (typeof lineas !== "string") throw new Error("Faltan las salidas de referencia");
  const resultados = new Map(
    [...lineas.matchAll(/^([A-Z]): (.*)$/gm)].map(([, etiqueta, valor]) => [etiqueta, valor]),
  );
  // Las plantillas históricas generan exclusivamente llamadas con literales JSON.
  // Leerlas evita mantener una segunda copia de los valores y de sus soluciones.
  const llamadas = new RegExp(`^console\\.log\\("([A-Z]):", ${firma.nombre}\\((.*)\\)\\);$`, "gm");
  const casos = [...codigoDePartida.matchAll(llamadas)].map(([, etiqueta, args]) => {
    const salida = resultados.get(etiqueta);
    if (salida === undefined) throw new Error("Falta un resultado de referencia");
    const entrada = JSON.parse(`[${args}]`) as Dato[];
    if (entrada.length !== firma.parametros.length) throw new Error("La firma no coincide");
    return {
      id: etiqueta,
      visible: true,
      entrada,
      args: entrada.map(argumento),
      esperado: firma.devuelve === "textos" ? argumento(JSON.parse(salida) as string[]) : salida,
    };
  });
  if (casos.length === 0 || casos.length !== resultados.size) throw new Error("Casos incompletos");
  return casos;
}

export function ejemplosDeReto(id: string, semilla: string, firma: Firma) {
  return casosDeVariante(id, semilla, firma).map(({ id, entrada, esperado }) => ({
    id,
    entrada,
    esperado:
      firma.devuelve === "textos"
        ? esperado.split("\x1f")
        : firma.devuelve === "entero"
          ? Number(esperado)
          : firma.devuelve === "booleano"
            ? esperado === "true"
            : esperado,
  }));
}

export function casosDeReto(id: string, semilla: string, firma: Firma, incluirOcultos: boolean) {
  const visibles = casosDeVariante(id, semilla, firma);
  if (!incluirOcultos) return visibles;

  const conocidos = new Set(visibles.map((caso) => JSON.stringify(caso.args)));
  const ocultos: CasoJuez[] = [];
  for (let intento = 0; intento < 12 && ocultos.length < 3; intento++) {
    const variante = casosDeVariante(id, randomBytes(16).toString("hex"), firma);
    for (const caso of variante) {
      const clave = JSON.stringify(caso.args);
      if (conocidos.has(clave) || ocultos.length === 3) continue;
      conocidos.add(clave);
      ocultos.push({ ...caso, id: `oculto-${ocultos.length + 1}`, visible: false });
    }
  }
  if (ocultos.length === 0) throw new Error("No se generaron casos privados");
  return [...visibles, ...ocultos];
}
