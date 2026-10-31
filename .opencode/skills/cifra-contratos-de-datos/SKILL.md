---
name: cifra-contratos-de-datos
description: Cómo respetar y cambiar los contratos de datos del apartado 4 de NOVEDADES_AI.md (Procedencia, FailureReport, ModelAdapter, RunRequest/RunResult, ChallengeSpec, IncidentSpec) sin romper sus usos. Úsala cuando tu tarea toque un tipo de esos contratos.
---

## Para qué sirve

Los contratos de datos los comparten varias versiones. Esta skill enseña a cambiar
uno en un solo sitio, migrar todos sus usos y anotarlo, sin roturas ocultas.

## Cuándo usarla y cuándo no

- Sí: al añadir, modificar o mover cualquier tipo de los de apartado 4; al leer un
  contrato para implementarlo por primera vez.
- No: para tipos internos de un módulo que no salen de él.

## Antes de empezar

1. Lee `NOVEDADES_AI.md` apartado 4 entero y regla 5 del apartado 0 («No cambies un
   contrato sin avisar»).
2. Localiza dónde vive hoy el contrato (o dónde vivirá):
   - 4.1 Procedencia y 4.2 FailureReport: `src/lib/analyze/failure.ts`.
   - 4.3 ModelAdapter: alrededor de `src/lib/ai/providers.ts` (0.2).
   - 4.4 RunRequest/RunResult/TestSpec/TraceStep: se crea en la 0.3 en un fichero
     único de tipos y límites (tarea 1 del apartado 0.3).
   - 4.5 ChallengeSpec: llega en la 0.4. — 4.6 IncidentSpec: llega en la 0.5.
3. Si el contrato todavía no existe en el código (0.3, 0.4, 0.5), lo crearás tal y
   como lo traza el apartado: no cambies nombres de campos sin anotar la decisión.

## Pasos

1. Define el cambio en una frase: qué campo cambia, qué usos legítimos se quedan
   fuera y qué tareas de las versiones dependen de él.
2. Cambia el contrato en su sitio único (un fichero, un `type`/`interface`).
3. Migración exhaustiva: busca los usos con el nombre del tipo y de cada campo y
   actualiza todos: pantallas, adaptadores, skills de la web, contenido y pruebas.
4. Añade o ajusta las pruebas que cubren el contrato (una por regla nueva).
5. Pasa la prueba del portón (`cifra-porton-de-calidad`).
6. Anota en `NOVEDADES_AI.md`, en el mismo apartado del contrato, si cambió algo
   trascendente (nuevo campo, valor obtenido, semántica) y, si toca una decisión
   abierta, actualízala con la nota «usada la propuesta por defecto» o «decidido: …».
7. Si tu versión necesitó algo que el apartado no contempla, propón el cambio de
   contrato en la revisión; no lo implementes de facto solo en tu pantalla.

## Reglas

- Si cambia, cambia en un solo lugar (apartado 4, primera línea).
- Campos nuevos prohibidos sin anotación: cada campo de `FailureReport`,
  `RunResult`, `ChallengeSpec` e `IncidentSpec` tiene destino en la UI o en pruebas;
  si no lo sabes, no lo añadas.
- `Procedencia` tiene cuatro valores cerrados; la lista no se amplía sin tocar el
  apartado 4.1 y las defensas (apartado 7).
- `RunResult.origen` siempre es `"ejecucion-real"`; ningún otro sello puede
  presentarse como ejecución.
- Un `TestSpec` con `visible: false` oculta su entrada y su esperado hasta la
  entrega.

## Qué NO hacer

- No dupliques el contrato en el módulo que lo usa: impórtalo desde el fichero de
  contratos.
- No cambies un nombre de campo «por claridad» sin migrar todos sus usos y anotar
  el cambio.
- No añadas valores por defecto a escondidas: por ejemplo, los límites del 0.3.F
  van solo al fichero único de configuración de límites.
- No ampliar `lenguaje` (4.4) más allá de `"javascript" | "python" | "rust"` hasta
  la 0.6 (llega por módulos).

## Lista de comprobación final

- [ ] El contrato se definió o cambie en un único fichero.
- [ ] Grep del tipo y de sus campos: cero usos sin migrar (o anotados como de otra
      versión futura).
- [ ] Pruebas del contrato actualizadas y pasando.
- [ ] `NOVEDADES_AI.md` apartado del contrato actualizado si toca decisión.
- [ ] Portón de calidad en verde.

## Ejemplo breve

- Bien: al crear el contrato 4.2, `failure.ts` lo definió con un comentario que cita
  el apartado («contrato 4.2 de NOVEDADES_AI.md») y el tipo `desconocido` quedó
  prohibido de forzarse en `failure.test.ts`.
- Mal: duplicar `TestSpec` en un componente de retos para «no depender» del fichero
  de ejecución.
