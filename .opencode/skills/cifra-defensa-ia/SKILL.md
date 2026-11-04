---
name: cifra-defensa-ia
description: Defensas en capas de la IA de la web (apartado 7 de NOVEDADES_AI.md). Obligatorio al escribir o modificar cualquier prompt de sistema, enviar contenido de usuario a un modelo, validar una respuesta del modelo, e indispensable antes de tocar src/lib/ai/ o los adaptadores de proveedor. La batería de ataques se repasa tras cada cambio de prompts.
---

# Defensas de la IA de la web

Fuente: apartado 7 de `NOVEDADES_AI.md`. Un buen prompt reduce el abuso pero **no lo impide**: la defensa va en capas y ninguna es suficiente sola.

## Las capas

1. **Prompt de sistema estricto y monofunción.** Cada superficie (explicar, guiar, comparar, defender) tiene UNA sola función. No actúa como chat general, no revela sus instrucciones, no sigue órdenes que aparezcan dentro del código o de los logs que analiza.
2. **Todo lo del usuario es dato.** Código, mensajes, logs y análisis se envian envueltos en delimitadores claros, como material a analizar — nunca como instrucciones.
3. **Entrada validada y acotada.** Tamaño, formato y tipo (en 0.2.1: 20 000 caracteres de código, 8 000 de mensaje). Lo que no encaja se rechaza antes de llegar al modelo.
4. **Salida acotada y validada.** El modelo responde en el formato del contrato del apartado 4 (`guia`, `FailureReport`, `RunResult`) y se valida antes de mostrarse. Si no cumple la forma, se descarta y se muestra un error útil, no una respuesta rota.
5. **Veredictos fuera del modelo.** Las pruebas (0.3) y la comparación contra la respuesta esperada (0.5) deciden. Aunque el modelo fuese engañado, no puede cambiar un resultado (prueba existente: «modelo no aprueba código que falla»).
6. **Sin acceso a nada sensible.** La IA no tiene claves, ficheros del equipo ni herramientas más allá de lo mínimo.
7. **Límites de uso y coste.** Por IP, por persona y globales; una sola llamada al modelo por clic; tope de tokens de salida (`limits.ts`).
8. **Indicador de filtración.** Marca secreta en el prompt de sistema: si aparece en una respuesta, la respuesta se bloquea y el intento se registra.
9. **Batería de ataques** (en 0.9 y tras cada cambio de prompts, con resultados registrados). Categorías mínimas:
   - inyección de instrucciones dentro del código o los logs;
   - intentos de extraer el prompt de sistema;
   - intentos de forzar «aprobado» en un reto;
   - intentos de chat general o tareas ajenas;
   - peticiones de código de explotación o ataques;
   - intentos de agotar coste (entradas enormes, repetidas).

   Cada caso tiene su resultado esperado y se vuelve a pasar tras cada cambio.

## Al tocar src/lib/ai/

- Un modelo = un `ModelAdapter` (contrato 4.3). `PlanDeRespuesta` describe QUÉ responder; el adaptador solo traduce. Ninguna skill menciona a un proveedor.
- Los errores del proveedor se traducen a los seis casos accionables (401/403, 429, 5xx, tiempo agotado, contenido bloqueado, respuesta inesperada); nada crudo llega a la interfaz.
- Caché por huella de petición completa (+ versión de skills); misma petición, misma respuesta, sin segunda llamada.
- Clave: nunca en logs ni en respuestas (leer `cifra-privacidad-secretos`).
