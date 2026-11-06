import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";
import { cargarModulos } from "../../modulos/registro.ts";
import { contratosDeModulo, type Modulo } from "../../modulos/tipos.ts";
import { sistemaDelPlan, usuarioDelPlan, type PlanDeRespuesta } from "../plan.ts";
import { llamarCon } from "../providers.ts";
import { adaptadorDe, adaptadoresRechazados, agregarAdaptadores, providers } from "./index.ts";
import { FalloProveedor } from "./transporte.ts";
import type { ModelAdapter } from "./tipos.ts";

const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

const plan: PlanDeRespuesta = {
  superficie: "explicar",
  proposito: ["Eres Cifra, en el estudio del fallo."],
  skills: [],
  formato: ["Responde solo con un objeto JSON."],
  reglas: [],
  material: ["Código:\nconst x = 1;"],
};

/** Un proveedor inventado que cumple el contrato 4.3 y no toca nada de las skills. */
const adaptadorFalso: Modulo<ModelAdapter> = {
  manifiesto: {
    id: "falso",
    tipo: "modelo",
    aporta: ["adaptador"],
    versionContrato: contratosDeModulo.modelo.version,
    necesita: ["contrato:4.3"],
  },
  contenido: {
    id: "falso",
    label: "Falso (solo prueba)",
    defaultModel: "falso-1",
    nota: "De prueba: no habla con nadie de verdad.",
    clave: (clave) => clave.startsWith("falso-"),
    modelosSoportados: ["falso-1"],
    construirPeticion: (pedido, opciones) => ({
      url: "https://falso.example/v1/chat",
      headers: { "Content-Type": "application/json" },
      cuerpo: {
        model: opciones.modelo,
        system: sistemaDelPlan(pedido),
        user: usuarioDelPlan(pedido),
      },
    }),
    leerRespuesta: (crudo) => ({
      texto: (crudo as { respuesta?: string }).respuesta ?? "",
    }),
    traducirError: (crudo) =>
      new FalloProveedor(
        "respuesta-invalida",
        `falso: ${crudo instanceof Error ? crudo.message : String(crudo)}`,
      ),
  },
};

describe("adaptadores de modelo (0.6)", () => {
  it("el catálogo se carga entero: ningún adaptador queda fuera del registro", () => {
    assert.deepEqual(
      adaptadoresRechazados,
      [],
      "algún adaptador del catálogo no cumple su manifiesto",
    );
    assert.deepEqual(
      providers.map((adaptador) => adaptador.id),
      ["xai", "openai", "anthropic", "google"],
    );
    for (const { id, label, defaultModel, nota } of providers) {
      assert.ok(label.trim(), `${id}: sin label`);
      assert.ok(defaultModel.trim(), `${id}: sin defaultModel`);
      assert.ok(nota.trim(), `${id}: sin nota`);
      assert.ok(adaptadorDe(id), `${id}: adaptadorDe no lo encuentra`);
    }
  });

  it("un adaptador falso registrado responde sin tocar nada de las skills", async () => {
    const carga = cargarModulos<ModelAdapter>([adaptadorFalso]);
    assert.deepEqual(carga.rechazados, [], "el registro rechaza el adaptador falso");
    const agregado = agregarAdaptadores(carga.cargados);
    assert.deepEqual(
      agregado.lista.map((adaptador) => adaptador.id),
      ["falso"],
    );

    let cuerpo = "";
    globalThis.fetch = (async (_url: string | URL, init?: RequestInit) => {
      cuerpo = String(init?.body ?? "");
      return new Response('{"respuesta": "hola desde el falso"}', { status: 200 });
    }) as typeof fetch;

    const adaptador = agregado.porId["falso"];
    assert.ok(adaptador, "el adaptador falso no está en el agregado");
    const texto = await llamarCon(adaptador, plan, { clave: "falso-clave-de-prueba" });
    assert.equal(texto, "hola desde el falso");

    const pedido = JSON.parse(cuerpo) as { model: string; system: string; user: string };
    assert.equal(pedido.model, "falso-1", "sin modelo declarado usa el por defecto");
    assert.ok(
      pedido.system.includes("Eres Cifra, en el estudio del fallo."),
      "el sistema no sale del plan",
    );
    assert.ok(pedido.user.includes("const x = 1"), "el usuario no sale del plan");
  });

  it("las skills no nombran a ningún proveedor", () => {
    const texto = readFileSync(new URL("../../skills/registry.ts", import.meta.url), "utf8");
    for (const proveedor of ["xai", "openai", "anthropic", "google", "grok", "claude", "gemini"]) {
      assert.ok(
        !new RegExp(`\\b${proveedor}\\b`, "i").test(texto),
        `registry.ts nombra a ${proveedor}`,
      );
    }
  });

  it("los adaptadores no tocan el registro de skills", () => {
    for (const fichero of [
      "tipos.ts",
      "transporte.ts",
      "xai.ts",
      "openai.ts",
      "anthropic.ts",
      "google.ts",
      "index.ts",
    ]) {
      const texto = readFileSync(new URL(`./${fichero}`, import.meta.url), "utf8");
      assert.ok(!texto.includes("skills/"), `${fichero} toca el registro de skills`);
    }
  });
});
