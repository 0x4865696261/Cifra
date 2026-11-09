import { randomBytes, randomUUID } from "node:crypto";
import { enSandbox } from "./sandbox.server.ts";
import { getSql, dbSource } from "../db.ts";
import { assertSameSiteRequest } from "../auth/isolation.server.ts";
import { getSessionUser } from "../auth/verify.server.ts";
import { casosDeReto, type CasoJuez } from "../retos/casos-juez.server.ts";
import { firmas } from "../retos/firmas.ts";
import { tramosDePrueba } from "../retos/prueba-nivel.ts";
import { retoEspecial } from "../retos/especiales.ts";
import { textoDe } from "./pruebas.ts";
import { avisoServicio, interpretarCorridas } from "./veredicto-juez.ts";
import { planProceso, librosEjemplo } from "./plan-juez.server.ts";
import type { PeticionJuez, RespuestaJuez } from "./juez.ts";

function preparar(pedido: PeticionJuez) {
  let casos: CasoJuez[] | undefined;
  const { modo, lenguaje, reto, semilla } = pedido;
  const privado = modo === "enviar" || modo === "nivel";
  const especial = reto ? retoEspecial(reto) : undefined;
  const firma = reto && Object.hasOwn(firmas, reto) ? firmas[reto] : undefined;

  if (modo === "nivel") {
    const tramo = tramosDePrueba.find((pieza) => pieza.id === reto);
    if (!tramo || lenguaje !== "javascript") throw new Error("Tramo inválido.");
    casos = tramo.pruebas.map((prueba) => ({
      id: prueba.id,
      visible: prueba.visible,
      args: [prueba.tipo],
      esperado: textoDe(prueba.esperado),
      entrada: [],
    }));
  } else if (modo !== "libre") {
    if (especial && especial.lenguaje === lenguaje) {
      if (lenguaje === "sql") {
        const extra = randomBytes(4).toString("hex");
        const filas = [
          [`Beta ${extra}`, 101],
          [`Alfa ${extra}`, 205],
          ["Límite", 100],
        ];
        casos = [
          {
            id: "A",
            visible: true,
            args: [JSON.stringify(librosEjemplo)],
            esperado: '[["Luz"],["Mar"]]',
            entrada: [],
          },
          ...(privado
            ? [
                {
                  id: "oculto-1",
                  visible: false,
                  args: [JSON.stringify(filas)],
                  esperado: JSON.stringify([[`Alfa ${extra}`], [`Beta ${extra}`]]),
                  entrada: [],
                },
              ]
            : []),
        ];
      } else {
        casos = [{ id: "tarjeta", visible: true, args: [], esperado: "", entrada: [] }];
      }
    } else if (firma && reto && semilla && lenguaje !== "sql" && lenguaje !== "web") {
      casos = casosDeReto(reto, semilla, firma, privado);
    } else {
      throw new Error("Reto o lenguaje inválido.");
    }
  }
  return {
    casos,
    privado,
    plan: planProceso({
      ...pedido,
      firma: modo === "libre" ? undefined : firma,
      casos,
      nivel: modo === "nivel",
    }),
  };
}

export async function ejecutarJuez(pedido: PeticionJuez): Promise<RespuestaJuez> {
  assertSameSiteRequest();
  const cuenta = await getSessionUser();
  if (!cuenta)
    return {
      ok: false,
      causa: "sesion",
      mensaje: "Inicia sesión con Google para ejecutar código.",
    };
  const snapshotId = process.env.CIFRA_SANDBOX_SNAPSHOT?.trim();
  if (
    process.env.VITE_CIFRA_PUBLIC !== "1" ||
    !snapshotId ||
    dbSource !== "neon" ||
    process.env.CIFRA_EJECUCION_PAUSADA === "1"
  )
    return avisoServicio;

  try {
    const { plan, casos, privado } = preparar(pedido);
    const sql = await getSql();
    const id = randomUUID();
    const [reserva] = await sql<{
      estado: string;
    }>`select cifra_reservar_ejecucion(${id}::uuid, ${cuenta.id}) as estado`;
    if (reserva?.estado !== "ok") {
      if (reserva?.estado === "ocupado")
        return {
          ok: false,
          causa: "ocupado",
          mensaje: "Hay tres ejecuciones en curso. Inténtalo de nuevo en unos segundos.",
        };
      if (reserva?.estado === "cuenta")
        return {
          ok: false,
          causa: "cuota",
          mensaje: "Has usado tus 10 ejecuciones de las últimas 24 horas.",
        };
      if (reserva?.estado === "global")
        return {
          ok: false,
          causa: "cuota",
          mensaje: "Cifra ha alcanzado el cupo global de ejecuciones.",
        };
      return avisoServicio;
    }
    const inicio = performance.now();
    // Si el proveedor no confirma el cierre, el cupo simultáneo se mantiene
    // hasta que expire la reserva. Así un fallo de red no abre otra plaza.
    const salida = await enSandbox(snapshotId, plan);
    await sql`update cifra_ejecuciones set finalizada = clock_timestamp() where id = ${id}::uuid`.catch(
      () => console.error("[cifra] no se pudo cerrar una reserva"),
    );
    return interpretarCorridas(
      pedido,
      salida,
      casos,
      privado,
      Math.round(performance.now() - inicio),
    );
  } catch {
    console.error("[cifra] fallo del ejecutor");
    return avisoServicio;
  }
}
