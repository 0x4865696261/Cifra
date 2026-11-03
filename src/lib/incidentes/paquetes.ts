import { paquetesDeDatos } from "./contenido/datos.ts";
import { paquetesDeRecursos } from "./contenido/recursos.ts";
import type { DefinicionIncidente } from "./tipos.ts";

/**
 * El registro de paquetes de incidente de la 0.5 (0.5.A): 8 paquetes, uno por familia del
 * mínimo acordado en las notas de la versión. Familias nuevas llegarán como contenido nuevo,
 * no reutilizando estos paquetes.
 */

export const definicionesIncidentes: DefinicionIncidente[] = [
  ...paquetesDeDatos,
  ...paquetesDeRecursos,
];

/** En orden de dificultad, para el listado de la ruta de incidentes. */
export function incidentesEnOrden(): Array<{ id: string; nivel: number; titulo: string; familia: string }> {
  return [...definicionesIncidentes]
    .sort((a, b) => a.nivel - b.nivel || a.familia.localeCompare(b.familia))
    .map(({ id, nivel, titulo, familia }) => ({ id, nivel, titulo, familia }));
}

export function definicionIncidentePorId(id: string): DefinicionIncidente | undefined {
  return definicionesIncidentes.find((paquete) => paquete.id === id);
}

/** Las familias del mínimo de la 0.5, en el orden que sale del registro. */
export const familiasDeIncidentes: string[] = [
  ...new Set(definicionesIncidentes.map((paquete) => paquete.familia)),
];

/** La nota de cada familia del registro: la lleva el primer paquete escrito de esa familia. */
export const notasFamiliasIncidentes: Record<string, string> = Object.fromEntries(
  familiasDeIncidentes.map((familia) => [
    familia,
    definicionesIncidentes.find((paquete) => paquete.familia === familia)?.notaFamilia ?? "",
  ]),
);
