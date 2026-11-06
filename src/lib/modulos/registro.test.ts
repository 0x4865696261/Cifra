import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cargarModulos } from "./registro.ts";
import { contratosDeModulo, type ManifiestoModulo, type Modulo } from "./tipos.ts";

type ContenidoLenguaje = { id: string; label: string; familia: string };

function manifiesto(extra: Partial<ManifiestoModulo> = {}): ManifiestoModulo {
  return {
    id: "python",
    tipo: "lenguaje",
    aporta: ["analizador", "notas"],
    versionContrato: contratosDeModulo.lenguaje.version,
    necesita: [],
    ...extra,
  };
}

function moduloLenguaje(extra: Partial<ManifiestoModulo> = {}, contenido: unknown = undefined): Modulo<ContenidoLenguaje> {
  return {
    manifiesto: manifiesto(extra),
    contenido: contenido ?? { id: extra.id ?? "python", label: "Python", familia: "python" },
  } as Modulo<ContenidoLenguaje>;
}

function moduloModelo(id = "otro") {
  return {
    manifiesto: {
      id,
      tipo: "modelo",
      aporta: ["adaptador"],
      versionContrato: contratosDeModulo.modelo.version,
      necesita: ["contrato:4.3"],
    },
    contenido: {
      id,
      modelosSoportados: ["modelo-x"],
      construirPeticion: () => ({ url: "https://ejemplo.test", headers: {}, cuerpo: {} }),
      leerRespuesta: () => ({ texto: "" }),
      traducirError: () => ({ tipo: "respuesta-invalida", mensaje: "sin forma" }),
    },
  } as unknown as Modulo<unknown>;
}

describe("cargarModulos: el manifiesto manda", () => {
  it("carga los módulos que cumplen su manifiesto", () => {
    const carga = cargarModulos<ContenidoLenguaje>([moduloLenguaje()]);
    assert.equal(carga.cargados.length, 1);
    assert.equal(carga.rechazados.length, 0);
    assert.equal(carga.cargados[0].manifiesto.id, "python");
  });

  it("rechaza un candidato sin manifiesto", () => {
    const carga = cargarModulos<ContenidoLenguaje>([null as unknown as Modulo<ContenidoLenguaje>]);
    assert.equal(carga.cargados.length, 0);
    assert.equal(carga.rechazados[0].motivo, "sin manifiesto");
  });

  it("rechaza el id vacío", () => {
    const carga = cargarModulos<ContenidoLenguaje>([moduloLenguaje({ id: "   " })]);
    assert.equal(carga.rechazados[0].motivo, "id vacío");
  });

  it("rechaza un tipo desconocido", () => {
    const carga = cargarModulos<ContenidoLenguaje>([
      moduloLenguaje({ tipo: "tema" as unknown as "lenguaje" }),
    ]);
    assert.match(carga.rechazados[0].motivo, /tipo desconocido/);
  });

  it("rechaza un manifiesto sin aporta", () => {
    const carga = cargarModulos<ContenidoLenguaje>([moduloLenguaje({ aporta: [] })]);
    assert.equal(carga.rechazados[0].motivo, "aporta vacío");
  });

  it("rechaza una versión de contrato distinta de la vigente", () => {
    const carga = cargarModulos<ContenidoLenguaje>([moduloLenguaje({ versionContrato: 2 })]);
    assert.match(carga.rechazados[0].motivo, /versión de contrato 2, se espera 1/);
  });

  it("rechaza el id repetido y se queda con el primero", () => {
    const carga = cargarModulos<ContenidoLenguaje>([moduloLenguaje(), moduloLenguaje()]);
    assert.equal(carga.cargados.length, 1);
    assert.equal(carga.rechazados.length, 1);
    assert.equal(carga.rechazados[0].motivo, "id repetido");
  });

  it("rechaza un contrato inexistente en necesita", () => {
    const carga = cargarModulos<ContenidoLenguaje>([moduloLenguaje({ necesita: ["contrato:9.9"] })]);
    assert.match(carga.rechazados[0].motivo, /contrato que no existe: contrato:9\.9/);
  });

  it("rechaza una dependencia de módulo que no se cargó antes", () => {
    const carga = cargarModulos<ContenidoLenguaje>([moduloLenguaje({ necesita: ["base"] })]);
    assert.match(carga.rechazados[0].motivo, /módulo que no está cargado antes: base/);
  });

  it("acepta la dependencia si ese módulo se cargó antes", () => {
    const base = moduloLenguaje({ id: "base" }, { id: "base", label: "Base", familia: "brace" });
    const dependiente = moduloLenguaje(
      { id: "python", necesita: ["base"] },
      { id: "python", label: "Python", familia: "python" },
    );
    const carga = cargarModulos<ContenidoLenguaje>([base, dependiente]);
    assert.equal(carga.cargados.length, 2);
    assert.equal(carga.rechazados.length, 0);
  });

  it("rechaza el contenido ausente", () => {
    const carga = cargarModulos<ContenidoLenguaje>([
      { manifiesto: manifiesto() } as unknown as Modulo<ContenidoLenguaje>,
    ]);
    assert.equal(carga.rechazados[0].motivo, "sin contenido");
  });

  it("rechaza un lenguaje sin label", () => {
    const carga = cargarModulos<ContenidoLenguaje>([
      moduloLenguaje({}, { id: "python", familia: "python" }),
    ]);
    assert.equal(carga.rechazados[0].motivo, "lenguaje sin label");
  });

  it("rechaza un lenguaje cuyo id no coincide con el del manifiesto", () => {
    const carga = cargarModulos<ContenidoLenguaje>([
      moduloLenguaje({ id: "python" }, { id: "ruby", label: "Ruby", familia: "ruby" }),
    ]);
    assert.match(carga.rechazados[0].motivo, /no es el del manifiesto/);
  });

  it("rechaza un modelo sin las tres funciones del contrato 4.3", () => {
    const roto = moduloModelo();
    delete (roto.contenido as Record<string, unknown>).leerRespuesta;
    const carga = cargarModulos([roto]);
    assert.equal(carga.rechazados[0].motivo, "modelo sin leerRespuesta");
  });

  it("rechaza un reto sin elementos", () => {
    const carga = cargarModulos<unknown>([
      {
        manifiesto: {
          id: "retos/vacio",
          tipo: "reto",
          aporta: ["familia:vacio"],
          versionContrato: contratosDeModulo.reto.version,
          necesita: ["contrato:4.5"],
        },
        contenido: [],
      },
    ]);
    assert.equal(carga.rechazados[0].motivo, "reto sin elementos");
  });

  it("un módulo malo no impide cargar a los buenos", () => {
    const carga = cargarModulos<unknown>([
      moduloLenguaje(),
      moduloLenguaje({ id: "roto", versionContrato: 99 }),
      moduloModelo(),
    ]);
    assert.equal(carga.cargados.length, 2);
    assert.equal(carga.rechazados.length, 1);
    assert.equal(carga.rechazados[0].id, "roto");
    assert.equal(carga.rechazados[0].tipo, "lenguaje");
  });
});
