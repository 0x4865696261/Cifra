---
name: cifra-contenido-biblioteca
description: Cómo escribir contenido para la biblioteca de Cifra (hilos, conceptos, puentes matemáticos y ensayos de lenguajes): formato de Concept, enlaces del grafo en ambos sentidos, sin conceptos huérfanos, tono claro y ejemplos comprobables. Úsala en cualquier tarea de src/lib/content y en la 0.7.
---

## Para qué sirve

Escribir contenido que se engancha en red (todo concepto lleva a los que lo
sostienen), se entiende desde cero y no promete lo que no se comprueba.

## Cuándo usarla y cuándo no

- Sí: al añadir o editar conceptos, hilos y `see`/`also` en
  `src/lib/content/concepts.ts`, puentes matemáticos (`math.ts`, `math-run.ts`) y
  ensayos de lenguajes (`languages.ts`); en la 0.7 (grafo completo).
- No: para retos (usa `cifra-retos-fundamentos`).

## Antes de empezar

1. Lee `NOVEDADES_AI.md`: apartado 1 (qué es Cifra), apartado 0.1 (biblioteca de la
   0.1) y apartado 0.7 (red de conocimiento completa): dos clics entre conceptos, sin
   huérfanos, relaciones tipificadas.
2. Lee `src/lib/content/concepts.ts` entero: el tipo `Concept` (slug, título, hilo,
   resumen, cuerpo, código opcional, `see`, `also`) y los `threads` existentes.
   Todos los slugs que cites deben existir ahí.

## Pasos

1. Elige (o crea) el hilo al que pertenece el concepto. Un concepto pertenece a un
   hilo; si parece de dos, es señal de que son dos conceptos o de que el hilo hay
   que reformularlo.
2. Escribe el concepto con el formato de `Concept`:
   - `slug` en minúsculas sin acentos, estable: es la llave del grafo.
   - `title` claro; `summary` de una frase que ya enseñe algo por sí sola.
   - `body`: párrafos cortos que avanzan una idea por párrafo, del uso al coste.
   - `code` opcional: ejemplo mínimo, correcto, con pie que diga qué demostrar.
3. Enlaza en AMBOS sentidos: si A `see` B, revisa que B te lleva a A vía `see` o
   `also` tipo «paralela». `see` es para conceptos que lo sostienen.
4. Ejemplos comprobables: si el ejemplo se puede ejecutar, ejecútalo tú mismo.
   «compila y pasa» es un hecho; «esperado» es una promesa.
5. Puentes matemáticos (0.1): fórmula → significado → razonamiento → pseudocódigo →
   código, con experimentos de valores; cada paso enlaza con el concepto de
   algoritmo o de lenguaje que lo hace código.
6. Ensayos de lenguajes (0.1, luego comparador en 0.7): «mismo problema, distinta
   frase»; explica por qué traducir literalmente falla (propiedad y préstamos,
   tipos, punteros y duración de objetos, concurrencia).
7. Nivel por plan (0.4): escribe para quien empieza (palabras llanas, una idea cada
   vez, término nuevo definido en el sitio) y marca lo difícil para el itinerario
   del plan con experiencia (sin explicación de lo elemental al pasar).
8. Comprueba el grafo: no dejes huérfanos, verifica que desde cualquier concepto
   nuevo se alcanza y llega otro en dos clics, y pasa el portón de calidad
   (ver `cifra-porton-de-calidad`).

## Reglas

- Tono del proyecto (skill «pedagogia» de la web): español concreto, sin elogios,
  sin jerga sin definir. Tras leerte, la persona puede hacer mejores preguntas.
- Lo comprobado se distingue de lo deducido también aquí (ver
  `cifra-explicacion-honesta`): si algo es valoración, déjalo claro.
- Sin conceptos huérfanos: todo concepto nuevo entra ya conectado; la comprobación
  automática del grafo es criterio de la 0.7.
- Los ejemplos se pueden ejecutar si la tecnología lo permite; si no, demuestra con
  el puente matemático o la traza.
- El contenido jamás usa material de nadie: el código de ejemplo es inventado o
  está en la biblioteca.

## Qué NO hacer

- No dejes concepto sin hilo ni sin `see` a lo que lo sostiene.
- No reescribas todo el fichero para «ordenar mejor»: edita siguiendo la
  convención y el orden actuales.
- No metas listas largas de lo que «sería interesante»: el contenido enseña una
  cosa y la deja clara.
- No añadas conceptos que solo digan lo mismo con otras palabras que otro ya
  existente.
- No excedas el alcance de tu versión (por ejemplo, la 0.7 añade hilos nuevos; la
  0.4 no necesita la red completa).

## Lista de comprobación final

- [ ] El concepto aparece en su hilo y con slug estable.
- [ ] Enlaces en ambos sentidos revisados; ningún huérfano.
- [ ] Ejemplos comprobables y ejecutados o verificados.
- [ ] Lenguaje claro para quien empieza; marcado lo difícil.
- [ ] Portón de calidad (typecheck y build) en verde.
- [ ] `NOVEDADES_AI.md` anota el contenido nuevo si abre apartado nuevo (ej. hilo
      del 0.2.F «Mensaje de error»).

## Ejemplo breve

- Bien: añadir el concepto `recursion` al hilo «vuelta» con `see` a `funcion` y
  `pila-de-llamadas` (que ya existen) y un cuerpo que explica con la pila por qué
  una recursión sin caso base revienta.
- Mal: crear `pila-de-llamadas` en la racha sin cambiar `see` de `recursion`,
  dejándolo aislado (huérfano).
