import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { sistemaDelPlan, usuarioDelPlan, type PlanDeRespuesta } from "./plan.ts";
import { composeSkills, lockedSkills } from "../skills/registry.ts";

const plan: PlanDeRespuesta = {
  superficie: "depurar",
  proposito: ["Eres Cifra, en el estudio del fallo.", "Conduces el análisis de un error."],
  nivel: "practica",
  skills: lockedSkills("codigo"),
  formato: ["Responde solo con un objeto JSON.", '{"reading": string}'],
  reglas: ["Nada inventado presentado como ocurrido."],
  material: ["Código:\nconst x = 1;", ""],
};

describe("PlanDeRespuesta: el pedido se arma desde el plan (0.6)", () => {
  it("el sistema sale en orden: proposito, formato, reglas y skills compuestas", () => {
    assert.equal(
      sistemaDelPlan(plan),
      [
        "Eres Cifra, en el estudio del fallo.",
        "Conduces el análisis de un error.",
        "Responde solo con un objeto JSON.",
        '{"reading": string}',
        "Nada inventado presentado como ocurrido.",
        composeSkills([...plan.skills]),
      ].join("\n\n"),
    );
    assert.ok(sistemaDelPlan(plan).includes("## Pedagogía"), "sin la skill pedagogía");
    assert.ok(sistemaDelPlan(plan).includes("## Análisis"), "sin la skill análisis");
  });

  it("el usuario lleva el nivel delante y el material detrás, sin huecos", () => {
    assert.equal(usuarioDelPlan(plan), ["Nivel: practica", "Código:\nconst x = 1;"].join("\n\n"));
    assert.ok(!usuarioDelPlan(plan).includes("\n\n\n"), "queda un bloque vacío en medio");
  });

  it("sin nivel no hay línea de nivel, y sin skills no se alarga el sistema", () => {
    const sinNivel: PlanDeRespuesta = { ...plan, nivel: undefined, skills: [] };
    assert.equal(usuarioDelPlan(sinNivel), "Código:\nconst x = 1;");
    const sistema = sistemaDelPlan(sinNivel);
    assert.ok(!sistema.includes("Nivel:"), "el nivel se va al usuario, no al sistema");
    assert.ok(!sistema.includes("## "), "sin skills no hay bloques de skill");
    assert.ok(
      sistema.endsWith("Nada inventado presentado como ocurrido."),
      "las cierran las reglas",
    );
  });

  it("las cinco superficies construyen su pedido con el plan, no a mano", () => {
    for (const fichero of ["explain.ts", "debug.ts", "retos.ts", "incidentes.ts"]) {
      const texto = readFileSync(new URL(`./${fichero}`, import.meta.url), "utf8");
      assert.ok(texto.includes("callModel(plan"), `${fichero}: no pasa el plan a callModel`);
      assert.ok(!texto.includes("composeSkills("), `${fichero}: compone skills a mano`);
      assert.ok(
        !texto.includes('join("\\n\\n")'),
        `${fichero}: ensambla el pedido con un join suelto`,
      );
      assert.ok(!texto.includes("sistemaDelPlan("), `${fichero}: arma el sistema a mano`);
      assert.ok(!texto.includes("usuarioDelPlan("), `${fichero}: arma el usuario a mano`);
    }
  });

  it("el plan no nombra a ningún proveedor", () => {
    const texto = readFileSync(new URL("./plan.ts", import.meta.url), "utf8");
    for (const proveedor of ["xai", "openai", "anthropic", "google", "grok", "claude", "gemini"]) {
      assert.ok(
        !new RegExp(`\\b${proveedor}\\b`, "i").test(texto),
        `plan.ts nombra a ${proveedor}`,
      );
    }
  });
});
