import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { guardarGuiaEnCache, guiaEnCache, huellaDeGuia, objetoDeHuella } from "./guia-cache.ts";
import { versionSkills } from "../skills/registry.ts";
import type { GuiaDeDepuracion } from "./debug-parse.ts";

const entrada = {
  level: "practica",
  language: "python",
  code: "print(precios('a', catalogo))",
  errorMessage: "KeyError: 'minimo'",
  question: "",
  codeFacts: ["L1: hay una función"],
  messageFacts: ["El mensaje pone entre comillas: «minimo»."],
  provider: "plataforma",
  model: "",
};

const guia: GuiaDeDepuracion = {
  leerElMensaje: [{ texto: "El mensaje dice que falta la clave minimo.", procedencia: "deducido" }],
  localizarElSitio: [{ texto: "Apunta a la línea del promedio.", procedencia: "deducido" }],
  hipotesis: [{ texto: "El filtro puede vaciar la colección", coste: 1, comoComprobarla: "Imprime elegidos." }],
  entradaQueFallaHoy: "precios('z', catalogo)",
  entradaQueDebeSeguirFuncionando: "precios('a', catalogo)",
  comoHabriaSaltadoAntes: "Una prueba con la lista vacía.",
};

describe("huellaDeGuia", () => {
  it("da la misma huella para una segunda petición idéntica", async () => {
    const primera = await huellaDeGuia(entrada);
    const segunda = await huellaDeGuia({ ...entrada });
    assert.equal(primera, segunda);
  });

  it("cambia si cambia cualquiera de los datos de la petición", async () => {
    const primera = await huellaDeGuia(entrada);
    const otra = await huellaDeGuia({ ...entrada, code: entrada.code + "\n" });
    assert.notEqual(primera, otra);
  });
});

describe("caché de guías", () => {
  it("una segunda petición idéntica llega a la guía sin llamar al proveedor", async () => {
    const huella = await huellaDeGuia(entrada);
    assert.equal(guiaEnCache(huella), null);
    guardarGuiaEnCache(huella, guia);
    assert.equal(guiaEnCache(await huellaDeGuia({ ...entrada })), guia);
  });

  it("una petición distinta no recibe la guía de otra", async () => {
    const huellaPropia = await huellaDeGuia(entrada);
    guardarGuiaEnCache(huellaPropia, guia);
    const huellaAjena = await huellaDeGuia({ ...entrada, errorMessage: "TypeError: otro fallo" });
    assert.equal(guiaEnCache(huellaAjena), null);
  });

  it("el objeto de huella lleva la versión de las skills y el resto de la petición", () => {
    const objeto = objetoDeHuella(entrada);
    assert.equal(objeto.versionSkills, versionSkills);
    assert.equal(objeto.code, entrada.code);
    assert.equal(objeto.provider, entrada.provider);
  });
});
