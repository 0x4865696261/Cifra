import test from "node:test";
import assert from "node:assert/strict";
import { actualizarReadme, inicioCifra, finCifra } from "../../src/lib/retos/readme-logros.ts";
import { publicarRepositorio } from "../../src/lib/retos/github-repositorio.server.ts";

const origen = "https://cifra.example";
const logros = [
  { id: "bucles-dos", titulo: "La suma | lista", lenguaje: "Rust", fecha: "2026-11-09" },
];
const ruta = "/repos/octocat/cifra-logros";
const owner = { id: 51 };
const repositorio = {
  owner,
  private: false,
  description: "Portafolio público gestionado por Cifra.",
};

function api(pasos) {
  return async (url, opciones) => {
    const paso = pasos.shift();
    assert.ok(paso, "Petición inesperada a GitHub");
    assert.equal(url, "https://api.github.com" + paso.ruta);
    assert.equal(opciones.method, paso.metodo ?? "GET");
    paso.validar?.(JSON.parse(opciones.body));
    return Response.json(paso.dato ?? {}, { status: paso.status ?? 200 });
  };
}

const perfil = { ruta: "/user", dato: { login: "octocat", id: 51 } };
const repo = { ruta, dato: repositorio };
const readme = (texto, sha) => ({
  ruta: ruta + "/contents/README.md",
  dato: { content: Buffer.from(texto).toString("base64"), encoding: "base64", sha },
});
const publicar = (pasos, crear = false) =>
  publicarRepositorio({
    token: "token-sintetico",
    githubId: "51",
    origen,
    crear,
    cargarLogros: async () => logros,
    pedir: api(pasos),
  });

test("el README publica solo los campos curados y conserva el texto personal", () => {
  const previo =
    "Mi introducción\n" + inicioCifra + "\nAnterior\n" + finCifra + "\nMis proyectos\n";
  const nuevo = actualizarReadme(previo, logros, origen);
  assert.ok(nuevo.startsWith("Mi introducción\n"));
  assert.ok(nuevo.endsWith("\nMis proyectos\n"));
  assert.ok(
    nuevo.includes(
      "[La suma \\| lista](https://cifra.example/retos/bucles-dos) | Rust | 2026-11-09",
    ),
  );
  assert.equal(actualizarReadme("# README ajeno", logros, origen), null);
});

test("la activación explícita crea un portafolio público y escribe solo su README", async () => {
  const pasos = [
    perfil,
    { ruta, status: 404 },
    {
      ruta: "/user/repos",
      metodo: "POST",
      status: 201,
      validar: (cuerpo) => {
        assert.equal(cuerpo.name, "cifra-logros");
        assert.equal(cuerpo.private, false);
      },
    },
    repo,
    readme("# cifra-logros\n", "inicial"),
    {
      ruta: ruta + "/contents/README.md",
      metodo: "PUT",
      validar: (cuerpo) => {
        assert.equal(cuerpo.sha, "inicial");
        assert.ok(Buffer.from(cuerpo.content, "base64").toString().includes("Rust"));
      },
    },
  ];
  assert.deepEqual(await publicar(pasos, true), {
    estado: "publicado",
    url: "https://github.com/octocat/cifra-logros",
  });
  assert.equal(pasos.length, 0);
});

test("protege repositorios privados, README ajenos y sincronizaciones sin cambios", async () => {
  assert.equal(
    (await publicar([perfil, { ruta, dato: { ...repositorio, private: true } }], true)).estado,
    "conflicto",
  );
  assert.equal(
    (await publicar([perfil, repo, readme("# Trabajo personal", "ajeno")], true)).estado,
    "conflicto",
  );
  const pasos = [perfil, repo, readme(actualizarReadme(null, logros, origen), "igual")];
  assert.equal((await publicar(pasos)).estado, "publicado");
  assert.equal(pasos.length, 0);
});

test("relee el SHA y preserva cambios concurrentes del README", async () => {
  const anterior = actualizarReadme(null, [], origen);
  const actualizado = "Texto personal\n\n" + anterior;
  const pasos = [
    perfil,
    repo,
    readme(anterior, "primero"),
    { ruta: ruta + "/contents/README.md", metodo: "PUT", status: 409 },
    readme(actualizado, "segundo"),
    {
      ruta: ruta + "/contents/README.md",
      metodo: "PUT",
      validar: (cuerpo) => {
        assert.equal(cuerpo.sha, "segundo");
        assert.ok(
          Buffer.from(cuerpo.content, "base64").toString().startsWith("Texto personal\n\n"),
        );
      },
    },
  ];
  assert.equal((await publicar(pasos)).estado, "publicado");
  assert.equal(pasos.length, 0);
});

test("sin consentimiento explícito nunca intenta crear un repositorio ausente", async () => {
  const pasos = [perfil, { ruta, status: 404 }];
  await assert.rejects(publicar(pasos), /no devolvió el repositorio/);
  assert.equal(pasos.length, 0);
});
