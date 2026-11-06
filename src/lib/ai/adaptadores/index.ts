import { cargarModulos } from "../../modulos/registro.ts";
import type { Modulo, RechazoModulo } from "../../modulos/tipos.ts";
import { anthropic } from "./anthropic.ts";
import { google } from "./google.ts";
import { openai } from "./openai.ts";
import { xai } from "./xai.ts";
import type { ModelAdapter } from "./tipos.ts";

/**
 * Catálogo de la 0.6: un proveedor es un módulo con su adaptador. El orden de
 * esta lista es el orden de Ajustes. Un módulo que no cumple su manifiesto no
 * se carga: queda en `adaptadoresRechazados` con el motivo.
 */
export const catalogoAdaptadores = [xai, openai, anthropic, google] as const;

/** Unión literal derivada del catálogo: `ProviderId` ya no se escribe a mano. */
export type AdaptadorCatalogo = (typeof catalogoAdaptadores)[number]["contenido"];
export type ProviderId = AdaptadorCatalogo["id"];

/** Lo que sale de juntar un lote de módulos de modelo, sin ningún filtro propio. */
export type AgregadoAdaptadores = {
  readonly lista: ModelAdapter[];
  readonly porId: Record<string, ModelAdapter>;
};

/** Agrega en el orden del lote lo que cada módulo aporta. Pura: no mira el catálogo. */
export function agregarAdaptadores(modulos: readonly Modulo<ModelAdapter>[]): AgregadoAdaptadores {
  const lista: ModelAdapter[] = [];
  const porId: Record<string, ModelAdapter> = {};
  for (const modulo of modulos) {
    lista.push(modulo.contenido);
    porId[modulo.contenido.id] = modulo.contenido;
  }
  return { lista, porId };
}

const carga = cargarModulos<ModelAdapter>(catalogoAdaptadores);

/** Lo que el registro dejó fuera del catálogo; una prueba afirma que no hay nada. */
export const adaptadoresRechazados: readonly RechazoModulo[] = carga.rechazados;

const agregado = agregarAdaptadores(carga.cargados);

/**
 * Los adaptadores cargados, en orden de catálogo: el catálogo de Ajustes. El
 * filtro es del registro (los rechazados no entran) y los ids siguen siendo los
 * literales del catálogo, igual que `languageIds` en los lenguajes.
 */
export const providers: readonly AdaptadorCatalogo[] = catalogoAdaptadores
  .filter((adaptador) => agregado.lista.includes(adaptador.contenido))
  .map((adaptador) => adaptador.contenido);

/** El adaptador de ese proveedor; `undefined` si su módulo no está cargado. */
export function adaptadorDe(id: string): ModelAdapter | undefined {
  return agregado.porId[id];
}

export function isProviderId(value: string): value is ProviderId {
  return adaptadorDe(value) !== undefined;
}

/** El adaptador de ese proveedor; si su módulo falló, el primero del catálogo. */
export function providerInfo(id: ProviderId): ModelAdapter {
  return adaptadorDe(id) ?? providers[0];
}
