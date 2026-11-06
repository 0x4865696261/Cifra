/**
 * Contrato 4.3 de la 0.6: el adaptador de un proveedor. Recibe el plan (QUÉ se
 * quiere responder) y lo traduce a su API; no decide nada del contenido. Un
 * adaptador que no cumple este formato no se registra: la comprobación está en
 * `registro.ts`.
 */

import type { PlanDeRespuesta } from "../plan.ts";
import type { ErrorDeProveedor } from "./transporte.ts";

/** Lo que el adaptador pide a la red: la clave viaja en headers, nunca en la URL ni en el cuerpo. */
export type PeticionProveedor = {
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly cuerpo: unknown;
};

export type ModelAdapter = {
  readonly id: string;
  /** Nombre del proveedor para Ajustes. */
  readonly label: string;
  /** Modelo por defecto, cuando la persona no eligió ninguno. */
  readonly defaultModel: string;
  /** Línea de ayuda que muestra Ajustes bajo el selector. */
  readonly nota: string;
  /** Reglas propias del proveedor para validar la forma de la clave; si no trae, solo las comunes. */
  readonly clave?: (clave: string) => boolean;
  readonly modelosSoportados: readonly string[];
  /** El plan convertido en petición de este proveedor. */
  construirPeticion(
    plan: PlanDeRespuesta,
    opciones: { modelo: string; clave?: string },
  ): PeticionProveedor;
  /** La respuesta bruta del proveedor convertida en texto; vacío si no trae el aspecto esperado. */
  leerRespuesta(cruda: unknown): { texto: string; tokensEntrada?: number; tokensSalida?: number };
  /** El fallo bruto traducido al mensaje que ve la persona (401, 429, 5xx, tiempo agotado, bloqueo). */
  traducirError(cruda: unknown): ErrorDeProveedor;
};
