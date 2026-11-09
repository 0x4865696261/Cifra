---
name: cifra-explicacion-honesta
description: Cómo redactar cualquier explicación o salida de la IA de la web de Cifra con procedencia obligatoria (comprobado-ejecucion, comprobado-regla, deducido, opinion), sin entregar código corregido a secas y con la estructura de la guía de depuración. Úsala al escribir prompts de la web, componentes de respuesta o el propio contenido de guías.
---

## Para qué sirve

Que cualquier texto que produce la IA de la web distinga lo comprobado de lo deducido
y de lo opinado, y que nunca regale el resultado mientras enseña a llegar a él.

## Cuándo usarla y cuándo no

- Sí: al escribir o modificar cualquier prompt de sistema de la web, cualquier
  componente que muestre una respuesta del modelo, y al redactar guías o
  explicaciones de ejemplo.
- No: al redactar documentación interna del repo (usa `cifra-sincronia-documental`)
  ni preguntas de retos (usa `cifra-retos-fundamentos`).

## Antes de empezar

1. Lee `NOVEDADES_AI.md`: apartado 3 (principios 1-3), apartado 4.1 (`Procedencia`)
   y apartado 0.2.C (skill de depuración fija, sus 5 pasos y sus prohibiciones).
2. Lee `src/lib/analyze/failure.ts` (definición de `Procedencia` y `Afirmacion`) y
   `src/lib/ai/debug-parse.ts` con su prueba `debug-parse.test.ts`.

## Pasos

1. Para cada afirmación que la salida incluirá, decide su procedencia ANTES de
   escribirla:
   - `comprobado-ejecucion`: solo si hay un `RunResult` concreto (4.4) al que
     enlazar. Sin ejecución, prohibida esta etiqueta.
   - `comprobado-regla`: salió de una regla aplicada sobre el texto (el análisis
     local del mensaje, la comparación de evidencia de 0.5.D).
   - `deducido`: razonamiento plausible sin comprobación.
   - `opinion`: valoración subjetiva, se marca siempre.
2. En la guía de depuración, respeta el orden fijo del apartado 0.2.C:
   1) leer el mensaje sin interpretar, 2) localizar el sitio, 3) hipótesis de la
   más barata a la más cara, cada una con «cómo comprobarla», 4) una entrada que
   falla hoy y otra que debería seguir funcionando mañana, 5) cómo habría saltado
   antes.
3. Cada hipótesis lleva campo `coste` (1|2|3) y `comoComprobarla` con una acción
   concreta (una prueba, un `console.log` de esa variable, una ejecución).
4. Si una línea no está en el código pegado, se indica literalmente que no existe;
   no se inventa.
5. Cuando el resultado de una ejecución esté disponible, la explicación cita pasos
   concretos de la traza (paso, línea, variables) y los marca como
   `comprobado-ejecucion`.
6. Si ninguna regla encaja con el mensaje, deja `tipo: "desconocido"` y dilo en el
   texto; nunca fuerzas un tipo que encaja «más o menos».

## Reglas

- Nunca devuelvas el código corregido a secas. Muestra como máximo el fragmento
  mínimo necesario para ilustrar una idea, nunca el fichero resuelto.
- Un veredicto de reto jamás sale del texto del modelo (apartado 7.5); el texto
  explica el resultado de las pruebas, no lo sustituye.
- La salida que no cumple la forma del contrato se rechaza ante la persona con un
  error útil, no se muestra rota (apartado 0.2, «Pruebas que deben existir»).
- Toda marca de calidad sobre el código de alguien es `opinion`.

## Qué NO hacer

- No etiquetes como «comprobado» nada que no venga de ejecución o de una regla
  verificable.
- No sugerir la corrección completa «para ahorrar tiempo» aunque la persona lo pida:
  eso es exactamente lo que Cifra no hace (apartado 1, «Lo que la distingue»).
- No conviertas una afirmación deducida en comprobada porque «suena bien» con la
  evidencia.
- No interpretes por la persona el mensaje de error sin decir qué copiaste tal cual
  y qué interpretaste.

## Lista de comprobación final

- [ ] Cada afirmación de la salida lleva su `procedencia`.
- [ ] Ninguna «comprobada» carece de `RunResult` o de regla verificable.
- [ ] La guía de depuración sigue los 5 pasos en orden.
- [ ] No se entrega código corregido a secas.
- [ ] Las líneas citadas existen en el código pegado.

## Ejemplo breve

- Bien: «El mensaje cita la línea 12 (comprobado-regla); ahí se llama a
  `calcularDescuento`, que no está definida (comprobado-regla). Dudo entre un fallo
  de nombre (deducido) o que el import falte (deducido); se comprueba buscando
  'calcularDescuento' en el fichero. 3. Hipótesis barata: variable mal escrita
  (coste 1)...».
- Mal: «El error está en la línea 12 porque falta un import que he corregido ya: te
  dejo el fichero completo debajo».
