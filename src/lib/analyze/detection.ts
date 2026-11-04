import { senalesCodigo, senalesMensaje, type Senal } from "../modulos/lenguajes/index.ts";
import type { LanguageId } from "./structure.ts";

/**
 * Detección del lenguaje por señales del código y del mensaje, sin modelo.
 * Conservadora: si las señales no bastan o empatan, se declara que no se puede
 * asegurar; nunca se marca como segura una sugerencia débil.
 */

export type Deteccion = { sugerencia: LanguageId | null; segura: boolean };

export function detectLanguage(codigo: string, mensaje: string): Deteccion {
  const puntos = new Map<LanguageId, number>();

  const sumar = (senales: readonly Senal[], texto: string, peso: number) => {
    for (const senal of senales) {
      if (senal.re.test(texto)) {
        puntos.set(senal.lenguaje, (puntos.get(senal.lenguaje) ?? 0) + peso);
      }
    }
  };

  sumar(senalesCodigo, codigo, 1);
  sumar(senalesMensaje, mensaje, 2);

  if (puntos.size === 0) return { sugerencia: null, segura: false };

  const clasificados = [...puntos.entries()].sort((a, b) => b[1] - a[1]);
  const [mejor, segundo] = clasificados;
  if (segundo && segundo[1] === mejor[1]) return { sugerencia: null, segura: false };
  const margen = segundo ? mejor[1] - segundo[1] : mejor[1];
  return { sugerencia: mejor[0], segura: mejor[1] >= 3 && margen >= 2 };
}
