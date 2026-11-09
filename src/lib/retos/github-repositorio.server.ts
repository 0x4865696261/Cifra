import { actualizarReadme, type LogroPublico } from "./readme-logros.ts";
import type { ResultadoPortafolio } from "./logros.ts";

const nombre = "cifra-logros";
const descripcion = "Portafolio público gestionado por Cifra.";
const conflicto: ResultadoPortafolio = {
  estado: "conflicto",
  mensaje:
    "Ya existe un repositorio cifra-logros que Cifra no puede administrar. Puedes conservarlo con otro nombre y volver a publicar.",
};

export async function publicarRepositorio({
  token,
  githubId,
  origen,
  crear,
  cargarLogros,
  pedir = fetch,
}: {
  token: string;
  githubId: string;
  origen: string;
  crear: boolean;
  cargarLogros: () => Promise<LogroPublico[]>;
  pedir?: typeof fetch;
}): Promise<ResultadoPortafolio> {
  const github = (ruta: string, metodo = "GET", datos?: object) =>
    pedir("https://api.github.com" + ruta, {
      method: metodo,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: datos ? JSON.stringify(datos) : undefined,
      redirect: "error",
      signal: AbortSignal.timeout(4500),
    });
  const perfil = await github("/user");
  if (perfil.status === 401)
    return { estado: "permiso", mensaje: "Vuelve a autorizar la publicación en GitHub." };
  if (!perfil.ok) throw new Error("GitHub no devolvió el perfil.");
  const { login, id } = (await perfil.json()) as { login?: string; id?: number };
  if (!login || !/^[a-z0-9-]{1,39}$/i.test(login) || String(id) !== githubId)
    throw new Error("Cuenta GitHub inesperada.");

  const ruta = `/repos/${login}/${nombre}`;
  let repo = await github(ruta);
  if (repo.status === 404 && crear) {
    const creado = await github("/user/repos", "POST", {
      name: nombre,
      description: descripcion,
      private: false,
      auto_init: true,
    });
    if (!creado.ok && creado.status !== 422) throw new Error("GitHub no creó el repositorio.");
    repo = await github(ruta);
  }
  if (!repo.ok) throw new Error("GitHub no devolvió el repositorio.");
  const info = (await repo.json()) as {
    private?: boolean;
    description?: string;
    owner?: { id?: number };
  };
  if (info.private !== false || String(info.owner?.id) !== githubId) return conflicto;

  for (let intento = 0; intento < 3; intento++) {
    const fichero = await github(ruta + "/contents/README.md");
    if (!fichero.ok) throw new Error("GitHub no devolvió el README.");
    const { content, encoding, sha } = (await fichero.json()) as {
      content?: string;
      encoding?: string;
      sha?: string;
    };
    if (!sha || encoding !== "base64" || typeof content !== "string") return conflicto;
    const anterior = Buffer.from(content, "base64").toString("utf8");
    const inicial = info.description === descripcion && anterior.trim() === "# cifra-logros";
    const readme = actualizarReadme(inicial ? null : anterior, await cargarLogros(), origen);
    if (readme === null) return conflicto;
    const url = `https://github.com/${login}/${nombre}`;
    if (readme === anterior) return { estado: "publicado", url };
    const escritura = await github(ruta + "/contents/README.md", "PUT", {
      sha,
      message: "Actualiza los logros de Cifra",
      content: Buffer.from(readme).toString("base64"),
    });
    if (escritura.ok) return { estado: "publicado", url };
    if (escritura.status !== 409 && escritura.status !== 422)
      throw new Error("GitHub no guardó el README.");
  }
  throw new Error("El README cambió durante la sincronización.");
}
