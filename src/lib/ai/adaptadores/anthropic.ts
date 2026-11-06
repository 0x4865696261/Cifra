import { topeSalidaTokens } from "../limits.ts";
import { contratosDeModulo, type Modulo } from "../../modulos/tipos.ts";
import { sistemaDelPlan, usuarioDelPlan, type PlanDeRespuesta } from "../plan.ts";
import { traducirFallo } from "./transporte.ts";
import type { ModelAdapter, PeticionProveedor } from "./tipos.ts";

const etiqueta = "Anthropic (Claude)";

export const anthropic = {
  manifiesto: {
    id: "anthropic",
    tipo: "modelo",
    aporta: ["adaptador"],
    versionContrato: contratosDeModulo.modelo.version,
    necesita: ["contrato:4.3"],
  },
  contenido: {
    id: "anthropic",
    label: etiqueta,
    defaultModel: "claude-sonnet-4-5",
    nota: "API de mensajes. La clave empieza por sk-ant-.",
    clave: (clave: string) => clave.startsWith("sk-ant-"),
    modelosSoportados: ["claude-sonnet-4-5"],
    construirPeticion(
      plan: PlanDeRespuesta,
      opciones: { modelo: string; clave?: string },
    ): PeticionProveedor {
      return {
        url: "https://api.anthropic.com/v1/messages",
        headers: {
          "x-api-key": opciones.clave ?? "",
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        cuerpo: {
          model: opciones.modelo,
          max_tokens: topeSalidaTokens,
          temperature: 0.3,
          system: sistemaDelPlan(plan),
          messages: [{ role: "user", content: usuarioDelPlan(plan) }],
        },
      };
    },
    leerRespuesta(cruda: unknown): { texto: string } {
      const cuerpo = cruda as { content?: { text?: string }[] };
      return { texto: cuerpo.content?.map((parte) => parte?.text ?? "").join("") ?? "" };
    },
    traducirError(cruda: unknown) {
      return traducirFallo(etiqueta, cruda);
    },
  },
} as const satisfies Modulo<ModelAdapter>;
