import type { TipoError } from "../../analyze/failure.ts";
import type { MotorLenguaje } from "../../ejecucion/tipos.ts";

/**
 * Contrato del módulo de lenguaje (0.6): la forma que `registro.ts` comprueba y
 * que las agregaciones de `index.ts` leen. Los datos concretos de cada lenguaje
 * viven en su fichero; aquí no hay ninguno.
 */

/** Familias del analizador de estructura: qué forma tiene el bloque de este lenguaje. */
export type Familia = "python" | "ruby" | "brace" | "sql" | "html" | "css";

/** Regla del contrato 4.2: encaja en el mensaje de error y le da su tipo. */
export type ReglaTipo = { readonly tipo: TipoError; readonly encaja: RegExp };

/** Señales de detección (0.2.B), separadas por dónde se mira: el código o el mensaje. */
export type SenalesLenguaje = {
  readonly codigo: readonly RegExp[];
  readonly mensaje: readonly RegExp[];
};

/** Lo que publica la página de lenguajes para este lenguaje (id y label salen del módulo). */
export type NotaLenguaje = {
  readonly id: string;
  readonly label: string;
  readonly code: string;
  readonly changed: readonly string[];
};

/** Ensayo que habla de este lenguaje; `id` es el ancla de la sección, no el lenguaje. */
export type EnsayoLenguaje = {
  readonly id: string;
  readonly title: string;
  readonly body: readonly string[];
  readonly see: string;
};

/** Contenido del módulo: lo mínimo es id, label y familia; el resto es opcional. */
export type Lenguaje = {
  readonly id: string;
  readonly label: string;
  readonly familia: Familia;
  readonly senales?: SenalesLenguaje;
  readonly reglasError?: readonly ReglaTipo[];
  readonly nota?: Omit<NotaLenguaje, "id" | "label">;
  readonly ensayo?: EnsayoLenguaje;
  /** Ejecutor de este lenguaje (0.6): quien lo tenga puede correr código; quien no, no-soportado. */
  readonly motor?: MotorLenguaje;
};
