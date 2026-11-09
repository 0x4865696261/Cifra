import { sonIguales } from "./pruebas.ts";
import type { CasoJuez } from "../retos/casos-juez.server.ts";
import type { PeticionJuez, RespuestaJuez, ResultadoJuez } from "./juez.ts";
import type { RunResult } from "./tipos.ts";

type Corrida = Pick<RunResult, "estado" | "stdout" | "stderr" | "codigoSalida">;
export type Corridas = { compilacion: Corrida | null; corridas: Corrida[] };

export const avisoServicio: RespuestaJuez = {
  ok: false,
  causa: "servicio",
  mensaje: "El ejecutor no está disponible en este momento. Tu borrador sigue guardado.",
};

function probarTarjeta(stdout: string): boolean {
  try {
    const dato = JSON.parse(stdout) as {
      estructura?: boolean;
      color?: string;
      espaciado?: boolean;
    };
    return (
      dato.estructura === true && dato.color === "rgb(240, 244, 255)" && dato.espaciado === true
    );
  } catch {
    return false;
  }
}

export function interpretarCorridas(
  pedido: PeticionJuez,
  salida: Corridas,
  casos: CasoJuez[] | undefined,
  privado: boolean,
  duracionMs: number,
): RespuestaJuez {
  if (!salida.compilacion && salida.corridas.length !== (casos?.length ?? 1)) return avisoServicio;
  const normalizar = (texto: string) => texto.replace(/\r\n/g, "\n");
  const pruebas: ResultadoJuez["pruebas"] = casos?.map((caso, indice) => {
    const corrida = salida.corridas[indice];
    const obtenido = corrida ? normalizar(corrida.stdout) : "";
    const valor = pedido.modo === "nivel" ? obtenido : obtenido.replace(/\n$/, "");
    const coincide =
      pedido.lenguaje === "web" ? probarTarjeta(valor) : sonIguales(valor, caso.esperado);
    const pasada = corrida?.estado === "ok" && coincide;
    return {
      id: caso.id,
      pasada,
      ...(caso.visible && pedido.lenguaje !== "web"
        ? {
            esperado: caso.esperado,
            ...(!privado && corrida ? { obtenido: valor } : {}),
          }
        : {}),
      ...(!pasada
        ? { error: caso.visible ? "La prueba no pasó." : "Un caso oculto no pasó." }
        : {}),
    };
  });
  const corridasVisibles = salida.corridas.filter(
    (_, indice) => casos?.[indice]?.visible ?? !casos,
  );
  const salidaVisible = salida.compilacion ?? corridasVisibles[0];
  const corte = salida.compilacion ?? salida.corridas.find((c) => c.estado !== "ok");
  // El proceso de una entrega puede ver sus entradas privadas. Solo se devuelven diagnósticos
  // de compilación o de ejecuciones que nunca recibieron esos datos.
  const mostrar = !privado || Boolean(salida.compilacion);
  const resultado: ResultadoJuez = {
    estado: corte?.estado ?? "ok",
    stdout: mostrar ? normalizar(salidaVisible?.stdout ?? "") : "",
    stderr: mostrar
      ? normalizar((salida.compilacion ?? corridasVisibles.find((c) => c.stderr))?.stderr ?? "")
      : "",
    duracionMs,
    pruebas,
    motor: { nombre: pedido.lenguaje, version: "Vercel Sandbox" },
    origen: "ejecucion-real",
  };
  return {
    ok: true,
    resultado,
    superado:
      privado &&
      resultado.estado === "ok" &&
      Boolean(pruebas?.length && pruebas.every((p) => p.pasada)),
  };
}
