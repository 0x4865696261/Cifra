import { topeSalidaTokens } from "../limits.ts";
import { contratosDeModulo, type Modulo } from "../../modulos/tipos.ts";
import { sistemaDelPlan, usuarioDelPlan, type PlanDeRespuesta } from "../plan.ts";
import { traducirFallo } from "./transporte.ts";
import type { ModelAdapter, PeticionProveedor } from "./tipos.ts";

const etiqueta = "Google (Gemini)";

export const google = {
  manifiesto: {
    id: "google",
    tipo: "modelo",
    aporta: ["adaptador"],
    versionContrato: contratosDeModulo.modelo.version,
    necesita: ["contrato:4.3"],
  },
  contenido: {
    id: "google",
    label: etiqueta,
    defaultModel: "gemini-2.5-flash",
    nota: "API de generateContent. Se pide respuesta en JSON.",
    modelosSoportados: ["gemini-2.5-flash"],
    construirPeticion(
      plan: PlanDeRespuesta,
      opciones: { modelo: string; clave?: string },
    ): PeticionProveedor {
      // La clave va en cabecera: en la URL quedaría registrada en cualquier log del origen.
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opciones.modelo)}:generateContent`;
      return {
        url,
        headers: {
          "x-goog-api-key": opciones.clave ?? "",
          "Content-Type": "application/json",
        },
        cuerpo: {
          systemInstruction: { parts: [{ text: sistemaDelPlan(plan) }] },
          contents: [{ role: "user", parts: [{ text: usuarioDelPlan(plan) }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: topeSalidaTokens,
            responseMimeType: "application/json",
          },
        },
      };
    },
    leerRespuesta(cruda: unknown): { texto: string } {
      const cuerpo = cruda as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      return {
        texto:
          cuerpo.candidates?.[0]?.content?.parts?.map((parte) => parte?.text ?? "").join("") ?? "",
      };
    },
    traducirError(cruda: unknown) {
      return traducirFallo(etiqueta, cruda);
    },
  },
} as const satisfies Modulo<ModelAdapter>;
