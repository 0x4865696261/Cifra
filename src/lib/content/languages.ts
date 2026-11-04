/**
 * La página de lenguajes lee el registro común (0.6): las notas y los ensayos
 * viven en el módulo del lenguaje del que hablan, y aquí solo salen con los
 * nombres que la interfaz ya usa. Añadir un lenguaje no toca este fichero.
 */
export type { NotaLenguaje as LanguageNote } from "../modulos/lenguajes/index.ts";
export {
  ensayosDeLenguajes as languageEssays,
  notasDeLenguajes as wordCountNotes,
} from "../modulos/lenguajes/index.ts";
