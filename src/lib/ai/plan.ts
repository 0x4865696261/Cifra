import { composeSkills, type SkillId } from "../skills/registry.ts";

/**
 * El pedido al modelo como plan (0.6, junto al contrato 4.3): describe QUÉ se
 * quiere responder, no cómo se lo pide a un proveedor. `sistemaDelPlan` arma el
 * mensaje de sistema (proposito, formato, reglas y skills) y `usuarioDelPlan` el
 * de usuario (nivel y material). Ninguno de los dos nombra a un proveedor: eso
 * es trabajo del adaptador, en el commit siguiente.
 */

/** Las cinco superficies de Cifra que piden algo al modelo. */
export type SuperficiePlan = "explicar" | "depurar" | "veredicto" | "defensa" | "comparacion";

export type PlanDeRespuesta = {
  readonly superficie: SuperficiePlan;
  /** Quién habla y qué trabajo tiene; siempre al principio del sistema. */
  readonly proposito: readonly string[];
  /** Nivel de lectura, cuando la superficie lo pide. */
  readonly nivel?: string;
  /** Instrucciones activas del registro de skills, en su orden. */
  readonly skills: readonly SkillId[];
  /** Esquema de salida y qué significa cada campo. */
  readonly formato: readonly string[];
  /** Límites que van tras el formato: qué no se hace. */
  readonly reglas: readonly string[];
  /** El contenido: código, mensaje, pruebas, material de la plataforma. */
  readonly material: readonly string[];
};

/** Sistema: proposito, formato, reglas y, al final, las skills compuestas. */
export function sistemaDelPlan(plan: PlanDeRespuesta): string {
  return [...plan.proposito, ...plan.formato, ...plan.reglas, composeSkills([...plan.skills])]
    .filter((bloque) => bloque.trim().length > 0)
    .join("\n\n");
}

/** Usuario: el nivel delante (si lo hay) y el material detrás, sin huecos. */
export function usuarioDelPlan(plan: PlanDeRespuesta): string {
  return [plan.nivel ? `Nivel: ${plan.nivel}` : "", ...plan.material]
    .filter((bloque) => bloque.trim().length > 0)
    .join("\n\n");
}
