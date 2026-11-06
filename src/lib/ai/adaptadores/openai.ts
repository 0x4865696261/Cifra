import { topeSalidaTokens } from "../limits.ts";
import { contratosDeModulo, type Modulo } from "../../modulos/tipos.ts";
import { sistemaDelPlan, usuarioDelPlan, type PlanDeRespuesta } from "../plan.ts";
import { traducirFallo } from "./transporte.ts";
import type { ModelAdapter, PeticionProveedor } from "./tipos.ts";

const etiqueta = "OpenAI";

export const openai = {
  manifiesto: {
    id: "openai",
    tipo: "modelo",
    aporta: ["adaptador"],
    versionContrato: contratosDeModulo.modelo.version,
    necesita: ["contrato:4.3"],
  },
  contenido: {
    id: "openai",
    label: etiqueta,
    defaultModel: "gpt-4.1-mini",
    nota: "Endpoint de chat completions. Un modelo mini vale para leer código.",
    modelosSoportados: ["gpt-4.1-mini"],
    construirPeticion(
      plan: PlanDeRespuesta,
      opciones: { modelo: string; clave?: string },
    ): PeticionProveedor {
      return {
        url: "https://api.openai.com/v1/chat/completions",
        headers: {
          Authorization: `Bearer ${opciones.clave ?? ""}`,
          "Content-Type": "application/json",
        },
        cuerpo: {
          model: opciones.modelo,
          temperature: 0.3,
          max_tokens: topeSalidaTokens,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: sistemaDelPlan(plan) },
            { role: "user", content: usuarioDelPlan(plan) },
          ],
        },
      };
    },
    leerRespuesta(cruda: unknown): { texto: string } {
      const cuerpo = cruda as { choices?: { message?: { content?: string } }[] };
      return { texto: cuerpo.choices?.[0]?.message?.content ?? "" };
    },
    traducirError(cruda: unknown) {
      return traducirFallo(etiqueta, cruda);
    },
  },
} as const satisfies Modulo<ModelAdapter>;
