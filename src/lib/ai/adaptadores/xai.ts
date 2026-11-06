import { topeSalidaTokens } from "../limits.ts";
import { contratosDeModulo, type Modulo } from "../../modulos/tipos.ts";
import { sistemaDelPlan, usuarioDelPlan, type PlanDeRespuesta } from "../plan.ts";
import { traducirFallo } from "./transporte.ts";
import type { ModelAdapter, PeticionProveedor } from "./tipos.ts";

const etiqueta = "xAI (Grok)";

export const xai = {
  manifiesto: {
    id: "xai",
    tipo: "modelo",
    aporta: ["adaptador"],
    versionContrato: contratosDeModulo.modelo.version,
    necesita: ["contrato:4.3"],
  },
  contenido: {
    id: "xai",
    label: etiqueta,
    defaultModel: "grok-4.5",
    nota: "La misma API que usa la clave de plataforma.",
    modelosSoportados: ["grok-4.5"],
    construirPeticion(
      plan: PlanDeRespuesta,
      opciones: { modelo: string; clave?: string },
    ): PeticionProveedor {
      return {
        url: "https://api.x.ai/v1/chat/completions",
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
