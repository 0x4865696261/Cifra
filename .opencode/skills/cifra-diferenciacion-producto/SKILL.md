---
name: cifra-diferenciacion-producto
description: La lupa de producto de Cifra: lista de preguntas para pasar antes de cerrar cada funcionalidad, con registro de la respuesta en el commit o en el documento. Úsala al terminar cualquier funcionalidad nueva o cambio de alcance.
---

## Para qué sirve

Impedir que Cifra se parezca progresivamente a «un generador con la marca cambiada»:
cada funcionalidad se contrasta con lo que la diferencia antes de cerrarse.

## Cuándo usarla y cuándo no

- Sí: antes de dar por terminada CUALQUIER funcionalidad nueva, y de cada cambio
  que altere el alcance de una versión.
- No: en refactors puros sin cambio de comportamiento ni en commits de documentación.

## Antes de empezar

1. Lee `NOVEDADES_AI.md`: apartado 1 («Lo que la distingue», «Lo que Cifra NO es»),
   apartado 3 (principios) y apartado 9 («Lo que Cifra no promete»).
2. Ten claro en una frase qué funcionalidad cierras y qué usuario toca.

## Pasos

1. Responde por escrito estas preguntas, cada una sí/no con su por qué:
   - ¿Explica en vez de generar? (No entrega resultado a secas; guía hasta él.)
   - ¿Separa lo comprobado de lo deducido? (Procedencia visible y correcta.)
   - ¿El veredicto sale de pruebas y no del modelo? (Cero sentencias del texto de la IA.)
   - ¿Funciona en local y sin enviar el código fuera? (O lo que sale, está consentido y
     declarado.)
   - ¿Se entiende en dos clics desde un concepto? (Relación con la biblioteca si toca.)
   - ¿Mejora de verdad a lo que ya ofrecen las plataformas de retos y las
     herramientas de IA para programar? (Di en qué; si es paridad, dilo como paridad.)
2. Si alguna respuesta es «no» sin justificación, la funcionalidad no está lista:
   vuelve a la mesa o reduce su alcance hasta que sí lo esté.
3. La respuesta pedida sobre diferenciación se registra: en la primera línea del
   cuerpo del commit (apartado «diferenciación: ...») o, si el cambio toca los
   principios, en el apartado de `NOVEDADES_AI.md` que toque (1, 3 o 9).
4. Con la lista pasada, el cierre restante es el habitual: portón de calidad
   (`cifra-porton-de-calidad`) y sincronía documental
   (`cifra-sincronia-documental`).

## Reglas

- «Paridad con lo que hay» no es un objetivo: puede entrarse con ese registro por
  escrito, pero no se vende como diferenciación.
- Una funcionalidad que solo añade una opción de pantalla sin nada de esto es
  candidata a fuera de alcance (regla 4 del apartado 0).
- Si la funcionalidad coincide con algo que «Cifra no promete» (apartado 9), dilo
  en la respuesta; no prometas lo que no se cumple.

## Qué NO hacer

- No respondas la lista de memoria: cada «sí» tiene que poder señalarse en el
  comportamiento exacto de la web.
- No uses la lista para justificar a posteriori lo que ya se programó: se pasa
  ANTES de cerrar.
- No dejes la respuesta solo en el chat: va en el commit o en el documento.
- No confundas «novedad» con «diferenciación»: una demo nueva no es una mejora
  frente a lo que ya hay.

## Lista de comprobación final

- [ ] Las seis preguntas respondidas por escrito, cada «sí» señalable.
- [ ] Registro de la respuesta en el cuerpo del commit o en NOVEDADES_AI.md.
- [ ] Ningún punto de «Lo que Cifra no promete» comprometido en silencio.
- [ ] Portón de calidad pasado después de la lupa.

## Ejemplo breve

- Bien: al cerrar la traducción de errores del proveedor (fila 4 del plan 0.2.1),
  el cuerpo del commit dice: «diferenciación: el mensaje explica la causa y la
  acción, no devuelve el resultado; procedencia: comprobado-regla vía
  traducirError».
- Mal: añadir un botón «resuélvelo por mí» que manda el código al modelo y devuelve
  la solución completa, marcarlo como «mejora de retención» y fusionarlo sin pasar
  la lupa.
