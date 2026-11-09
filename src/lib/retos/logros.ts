import { createServerFn } from "@tanstack/react-start";

export type AccionPortafolio = "manual" | "automatico" | "pausar";
export type ResultadoPortafolio =
  | { estado: "publicado"; url: string }
  | { estado: "inactivo" | "permiso" | "conflicto" | "error"; mensaje: string };

export const publicarLogros = createServerFn({ method: "POST" })
  .validator((modo: AccionPortafolio) => {
    if (modo !== "manual" && modo !== "automatico" && modo !== "pausar") {
      throw new Error("Acción de portafolio inválida.");
    }
    return modo;
  })
  .handler(async ({ data }): Promise<ResultadoPortafolio> => {
    const { sincronizarPortafolio } = await import("./logros.server.ts");
    return sincronizarPortafolio(data);
  });
