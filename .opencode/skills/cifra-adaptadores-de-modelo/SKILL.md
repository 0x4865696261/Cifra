---
name: cifra-adaptadores-de-modelo
description: Cómo añadir o modificar un proveedor de modelo con ModelAdapter en Cifra (construcción de petición, lectura de respuesta, traducción de errores, clave solo en el navegador, caché y límites, pruebas por adaptador). Úsala en tareas de src/lib/ai y en la 0.6 (multi-modelo).
---

## Para qué sirve

Añadir o corregir un proveedor (xAI, OpenAI, Anthropic, Google, u otro con API
compatible) sin romper el contrato 4.3, la honestidad del coste ni la privacidad.

## Cuándo usarla y cuándo no

- Sí: al tocar `src/lib/ai/providers.ts`, `limits.ts`, `guia-cache.ts` o los ajustes
  de proveedor; al añadir un proveedor en la 0.6.
- No: para el contenido o tono de las respuestas (usa `cifra-explicacion-honesta`).

## Antes de empezar

1. Lee `NOVEDADES_AI.md`: apartado 4.3 (`ModelAdapter`, `PlanDeRespuesta`),
   apartados 0.2.D (proveedores y claves) y 0.2.E (caché y límites), y las pruebas
   del apartado 0.2 («Pruebas que deben existir»).
2. Lee `src/lib/ai/providers.ts`, `src/lib/ai/limits.ts`, `src/lib/ai/guia-cache.ts`
   y `src/lib/ai/providers.test.ts` con su prueba actual.

## Pasos

1. Declara el proveedor una sola vez en la lista del módulo (`id`, etiqueta, modelo
   por defecto). El `id` es único y en minúsculas.
2. Implementa las tres capacidades del contrato 4.3:
   - `construirPeticion`: parte siempre de un `PlanDeRespuesta` (qué se quiere
     responder: skills activas, nivel de lectura, formato), no del texto final.
     Ninguna skill menciona a un proveedor.
   - `leerRespuesta`: devuelve `texto` y, si la API los da, tokens de entrada y
     salida. Tolera campos ausentes sin romper el typecheck (opcional).
   - `traducirError`: traduce 401 (clave inválida), 429 (límite), 5xx (servicio
     caído), tiempo agotado y contenido bloqueado, cada uno a un mensaje claro y
     accionable.
3. Claves: la clave llega en la petición del navegador, se usa para esa llamada y se
   olvida. No se escribe en logs, ni en respuestas, ni parcialmente. Con
   `cleanApiKey` y `keyLooksValid` revisa formato antes de enviar.
4. Caché: la huella incluye código + mensaje + lenguaje + proveedor + modelo +
   VERSIÓN de las skills (0.2.E). Si tocas los prompts o el formato, sube la versión
   en la huella o la caché servirá respuestas viejas.
5. Límites: el tope de salida por petición está en `src/lib/ai/limits.ts`
   (`topeSalidaTokens`). No repartas cifras sueltas por el código.
6. Una llamada al modelo por clic. Nunca cascadas ni reintentos automáticos en
   bucle: si reintenta, decláralo por escrito y con tope.
7. Escribe las pruebas del adaptador (ver «Reglas») en el mismo commit y añade su
   fichero al script `test` de `package.json`.

## Reglas

- Un adaptador nuevo tiene como mínimo: prueba de 401, de 429 y de 5xx simulados
  (apartado 0.2, pruebas), más su prueba de construcción de petición y lectura.
- La clave de la persona vive en el navegador; la de plataforma solo en el servidor
  y nunca se sirve a otros (0.2.D).
- La huella de caché completa: misma petición ⇒ misma respuesta, sin segunda llamada.
- `providers.test.ts` sirve de madera de comparación: sigue su estilo.

## Qué NO hacer

- No escribas la clave en la consola, en el historial de errores ni en la caché
  (con `src/lib/ai/secret.test.ts` se vigilará).
- No dejes que el adaptador decida el veredicto ni el resultado: solo transporta y
  traduce.
- No añadas un proveedor sin reducir las mismas garantías (errores traducidos,
  límites, caché).
- No llames al proveedor en cascada ni anides llamadas por clic.

## Lista de comprobación final

- [ ] Las tres capacidades del 4.3 implementadas y con nombre del contrato.
- [ ] Pruebas 401 / 429 / 5xx simuladas pasando.
- [ ] La clave no aparece en ningún log ni cuerpo de respuesta (recorrido de
      registros incluido en las pruebas).
- [ ] Huella de caché completa y versionada incluidas al cambiar prompts/skills.
- [ ] Tope de salida tomado desde `limits.ts`.
- [ ] Fichero de prueba nuevo inscrito en el script `test` en el mismo commit.

## Ejemplo breve

- Bien: el commit `0bf0b54 feat(modelo): traduce los errores del proveedor a
  mensajes accionables` añadió traducción por tipo de error con mensaje accionable
  por proveedor, sin tocar el resto del estudio.
- Mal: meter la URL del proveedor y la clave en la caché de respuestas como parte
  de la huella y olvidar el versionado de skills.
