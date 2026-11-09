import { createServerFn } from "@tanstack/react-start";
import { esLenguajeJuez, type LenguajeJuez } from "./catalogo.ts";
import type { RunResult, TestResult } from "./tipos.ts";

export type ResultadoJuez = Omit<RunResult, "pruebas"> & {
  pruebas?: (Omit<TestResult, "obtenido" | "esperado"> & {
    obtenido?: string;
    esperado?: string;
  })[];
};

export type PeticionJuez = {
  modo: "libre" | "ejecutar" | "enviar" | "nivel";
  lenguaje: LenguajeJuez;
  codigo: string;
  css?: string;
  entrada?: string;
  reto?: string;
  semilla?: string;
};

export type RespuestaJuez =
  | { ok: true; resultado: ResultadoJuez; superado: boolean; registroPendiente?: true }
  | { ok: false; causa: "sesion" | "cuota" | "ocupado" | "servicio"; mensaje: string };

function textoLimitado(value: unknown, max: number): value is string {
  return (
    typeof value === "string" &&
    new TextEncoder().encode(value).length <= max &&
    !value.includes("\u0000")
  );
}

export function validarPeticion(input: unknown): PeticionJuez {
  if (!input || typeof input !== "object") throw new Error("Solicitud inválida.");
  const { modo, lenguaje, codigo, css, entrada, reto, semilla } = input as Partial<PeticionJuez>;
  if (
    (modo !== "libre" && modo !== "ejecutar" && modo !== "enviar" && modo !== "nivel") ||
    !esLenguajeJuez(lenguaje) ||
    !textoLimitado(codigo, 24_000) ||
    !codigo.trim() ||
    (css !== undefined && (!textoLimitado(css, 16_000) || lenguaje !== "web")) ||
    (entrada !== undefined && (!textoLimitado(entrada, 8_000) || modo !== "libre")) ||
    (modo !== "libre" && (!textoLimitado(reto, 80) || !/^[a-z0-9-]+$/.test(reto))) ||
    (semilla !== undefined && (typeof semilla !== "string" || !/^[a-f0-9]{32}$/.test(semilla)))
  )
    throw new Error("El lenguaje, los datos o el tamaño de la solicitud no son válidos.");
  return { modo, lenguaje, codigo, css, entrada, reto, semilla };
}

export const juzgarCodigo = createServerFn({ method: "POST" })
  .validator(validarPeticion)
  .handler(async ({ data }): Promise<RespuestaJuez> => {
    const { ejecutarJuez } = await import("./juez.server.ts");
    return ejecutarJuez(data);
  });

export const verEjemplos = createServerFn({ method: "GET" })
  .validator((input: { reto: string; semilla: string }) => {
    if (
      typeof input?.reto !== "string" ||
      !/^[a-z0-9-]{1,80}$/.test(input.reto) ||
      typeof input.semilla !== "string" ||
      !/^[a-f0-9]{32}$/.test(input.semilla)
    ) {
      throw new Error("Variante inválida.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { firmas } = await import("../retos/firmas.ts");
    const { ejemplosDeReto } = await import("../retos/casos-juez.server.ts");
    const firma = Object.hasOwn(firmas, data.reto) ? firmas[data.reto] : undefined;
    return firma ? ejemplosDeReto(data.reto, data.semilla, firma) : [];
  });
