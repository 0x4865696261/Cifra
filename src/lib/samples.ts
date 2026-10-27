import type { LanguageId } from "@/lib/analyze/structure";

export type Sample = {
  id: string;
  title: string;
  language: LanguageId;
  hint: string;
  suggestedQuestion: string;
  code: string;
};

export const samples: Sample[] = [
  {
    id: "palabras",
    title: "Contar palabras",
    language: "python",
    hint: "Un diccionario y un bucle. Sirve para ver cómo se lee un programa pequeño de principio a fin.",
    suggestedQuestion: "¿Por qué un diccionario y no una lista de pares?",
    code: `def frecuencias(texto):
    conteo = {}
    for palabra in texto.lower().split():
        conteo[palabra] = conteo.get(palabra, 0) + 1
    return conteo
`,
  },
  {
    id: "media",
    title: "Una media frágil",
    language: "javascript",
    hint: "La operación es simple. La pregunta interesante es qué pasa con una lista vacía.",
    suggestedQuestion: "¿Qué pasa si numeros está vacío, y cómo lo descubriría sin que nadie me lo diga?",
    code: `function media(numeros) {
  let suma = 0;
  for (const n of numeros) {
    suma += n;
  }
  return suma / numeros.length;
}
`,
  },
  {
    id: "parejas",
    title: "Todas las parejas",
    language: "python",
    hint: "Dos bucles, uno dentro del otro. La forma del código ya dice algo del coste.",
    suggestedQuestion: "¿Hace falta recorrer la lista dos veces así? ¿Cuándo sí y cuándo no?",
    code: `def parejas(nombres):
    resultado = []
    for i in range(len(nombres)):
        for j in range(len(nombres)):
            if i != j:
                resultado.append((nombres[i], nombres[j]))
    return resultado
`,
  },
];
