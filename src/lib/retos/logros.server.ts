import { getRequest } from "@tanstack/react-start/server";
import { auth, githubLoginConfigured } from "../auth/server.ts";
import { assertSameSiteRequest } from "../auth/isolation.server.ts";
import { dbSource, getSql } from "../db.ts";
import { esLenguajeJuez, etiquetasJuez } from "../ejecucion/catalogo.ts";
import { definicionPorId } from "./retos.ts";
import { retoEspecial } from "./especiales.ts";
import { publicarRepositorio } from "./github-repositorio.server.ts";
import type { AccionPortafolio, ResultadoPortafolio } from "./logros.ts";

const inactivo: ResultadoPortafolio = {
  estado: "inactivo",
  mensaje: "La publicación automática está pausada.",
};
const sinPermiso: ResultadoPortafolio = {
  estado: "permiso",
  mensaje:
    "Autoriza en GitHub el acceso a repositorios públicos y vuelve a pulsar Publicar logros.",
};
const errorPublicacion: ResultadoPortafolio = {
  estado: "error",
  mensaje: "No se pudo sincronizar GitHub. Tus logros siguen guardados en Cifra.",
};

export async function sincronizarPortafolio(modo: AccionPortafolio): Promise<ResultadoPortafolio> {
  assertSameSiteRequest();
  if (!githubLoginConfigured || dbSource !== "neon") return inactivo;
  try {
    const headers = getRequest().headers;
    const sesion = await auth.api.getSession({ headers, query: { disableCookieCache: true } });
    if (!sesion?.user) return inactivo;
    const cuenta = sesion.user.id;
    const sql = await getSql();
    if (modo === "pausar") {
      await sql`delete from cifra_portafolios where cuenta = ${cuenta}`;
      return inactivo;
    }

    const [preferencia] = await sql<{
      github_id: string;
    }>`select github_id from cifra_portafolios where cuenta = ${cuenta}`;
    if (!preferencia && modo === "automatico") return inactivo;
    const contexto = await auth.$context;
    const cuentas = (await contexto.internalAdapter.findAccounts(cuenta)).filter(
      (vinculada) => vinculada.providerId === "github",
    );
    if (cuentas.length !== 1)
      return { estado: "error", mensaje: "Conecta una única cuenta de GitHub para publicar." };
    const github = cuentas[0];
    if (modo === "automatico" && preferencia?.github_id !== github.accountId) return inactivo;
    if (!github.scope?.split(/[\s,]+/).includes("public_repo")) return sinPermiso;
    const credencial = await auth.api.getAccessToken({ headers, body: { accountId: github.id } });
    if (!credencial.accessToken) return sinPermiso;

    const origen = new URL(process.env.BETTER_AUTH_URL!).origin;
    const resultado = await publicarRepositorio({
      token: credencial.accessToken,
      githubId: github.accountId,
      origen,
      crear: modo === "manual",
      cargarLogros: async () => {
        const registros = await sql<{ reto: string; lenguaje: string; fecha: string }>`
          select reto, lenguaje, to_char(resuelto at time zone 'UTC', 'YYYY-MM-DD') as fecha
          from cifra_logros where cuenta = ${cuenta} order by resuelto desc, reto, lenguaje`;
        return registros.flatMap(({ reto, lenguaje, fecha }) => {
          const definicion = definicionPorId(reto) ?? retoEspecial(reto);
          return definicion && esLenguajeJuez(lenguaje)
            ? [{ id: reto, titulo: definicion.titulo, lenguaje: etiquetasJuez[lenguaje], fecha }]
            : [];
        });
      },
    });
    if (modo === "manual" && resultado.estado === "publicado") {
      await sql`insert into cifra_portafolios (cuenta, github_id) values (${cuenta}, ${github.accountId})
        on conflict (cuenta) do update set github_id = excluded.github_id`;
    }
    return resultado;
  } catch {
    return errorPublicacion;
  }
}
