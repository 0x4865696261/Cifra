/**
 * Contrato de la 0.6: registro común de módulos (§0.6). Un módulo declara en su
 * manifiesto qué aporta, qué versión del contrato usa y qué necesita. Un módulo
 * que no cumple el manifiesto no se carga: la comprobación está en registro.ts.
 */

export type TipoModulo = "lenguaje" | "modelo" | "reto" | "incidente";

export type ManifiestoModulo = {
  readonly id: string;
  readonly tipo: TipoModulo;
  /** Qué aporta este módulo, en palabras: "analizador", "familia:bucles", ... */
  readonly aporta: readonly string[];
  /** Versión del contrato de su tipo que este módulo habla. */
  readonly versionContrato: number;
  /** Contratos (`contrato:4.x`) o ids de módulos cargados antes en el mismo lote. */
  readonly necesita: readonly string[];
};

export type Modulo<Contenido> = {
  readonly manifiesto: ManifiestoModulo;
  readonly contenido: Contenido;
};

/** La sección de este documento que fija el contrato de cada tipo, y su versión vigente. */
export const contratosDeModulo = {
  lenguaje: { seccion: "módulo de lenguaje (0.6)", version: 1 },
  modelo: { seccion: "4.3", version: 1 },
  reto: { seccion: "4.5", version: 1 },
  incidente: { seccion: "4.6", version: 1 },
} as const;

/** Las secciones del apartado 4 que un módulo puede declarar en `necesita`. */
export const seccionesDeContrato = ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"] as const;

export type RechazoModulo = {
  readonly id: string;
  readonly tipo: string;
  readonly motivo: string;
};

export type CargaDeModulos<Contenido> = {
  readonly cargados: Array<Modulo<Contenido>>;
  readonly rechazados: Array<RechazoModulo>;
};
