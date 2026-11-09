---
name: cifra-orientacion
description: Reconstruye el estado del proyecto Cifra al empezar una sesión. Úsala SIEMPRE como primera skill de cualquier tarea, de cualquier tipo, en cualquier versión.
---

## Para qué sirve

Levantar el contexto del proyecto en pocos minutos: qué versión está en marcha, qué
tarea toca, en qué rama se trabaja y si el portón de calidad inicial está en verde.

## Cuándo usarla y cuándo no

- Sí: al principio de TODA sesión y antes de decidir qué hacer. Es la primera skill,
  siempre, sin excepción.
- No: a mitad de tarea para «mirar algo rápido». Si llegaste sin pasarla, páralo todo
  y pásala antes de seguir.

## Antes de empezar

Nada. Esta skill es siempre la primera.

## Pasos

1. Lee `NOVEDADES_AI.md` entero. Es la fuente de verdad. Presta atención a apartado 0
   («Reglas para quien construye»), apartado 2 (mapa de versiones), apartado 8
   («Decisiones abiertas») y el apéndice «Plan de commits X.Y» del final si existe.
2. Ejecuta `git status` y `git log --oneline -15`. Toma nota de la rama activa.

3. Comprueba si `NOVEDADES.md` y `NOVEDADES_AI.md` se contradicen en lo que toca tu
   tarea. Si se contradicen, manda `NOVEDADES_AI.md` y anota la incoherencia en el
   apartado 8 o en tu informe.
4. Decide la versión vigente combinando dos fuentes:
   - el mapa de versiones del apartado 2 (estado: hecha, siguiente, pendiente),
   - el «Plan de commits X.Y» vigente (filas hecha / pendiente).
   Cuando haya plan de commits activo, la tarea es la primera fila pendiente, en
   orden. No te saltes filas.
5. Compara el plan de commits con `git log`: los commits de las filas «hecha» deben
   existir en el historial con el mismo mensaje. Si falta alguno o el mensaje no
   encaja, no continúes: anótalo y avisa.
6. Pasa el portón de calidad inicial antes de escribir nada:
   `npm run typecheck` && `npm test` && `npm run build`. Si algo falla, no añadas
   trabajo encima: reporta el fallo con su salida real y para ahí salvo que la tarea
   sea arreglarlo.
7. Si hay cambios sin commitear de otra sesión, no los toques ni los deshagas.
   Avisa y trabaja alrededor (p. ej., en un worktree o rama aparte).
8. Escribe un resumen de tres líneas: rama, versión y tarea que toca, estado del
   portón.

## Reglas

- La fuente de verdad es `NOVEDADES_AI.md`. Si el código la contradice, el código
  manda solo cuando NOVEDADES_AI declara una decisión por defecto aplicada (apartado 8);
  en cualquier otro caso, para y pregunta o anótalo en «Decisiones abiertas».
- Las tareas se encargan con la plantilla del apartado 0 («Cómo se encarga una tarea a
  la IA ejecutora»). Rellénala aunque seas tú quien ejecute.
- Toda decisión que no esté en NOVEDADES_AI.md se anota en el apartado 8 antes de
  programar.

## Qué NO hacer

- No asumas cuál es la versión vigente por el número de la rama: confírmalo con el
  documento y el historial.
- No empieces una tarea si el portón inicial no está en verde (excepto si tu tarea es
  arreglar ese fallo).
- No commitees cambios ajenos que encuentres sin commitear.
- No marques una fila del plan como «hecha» si su commit no existe.

## Lista de comprobación final

- [ ] `NOVEDADES_AI.md` leído; contradictorio con `NOVEDADES.md` detectado y anotado si lo hay.
- [ ] Versión vigente decidida y dicha en una frase.
- [ ] Plan de commits contrastado con `git log` (filas «hecha» = commits existentes).
- [ ] Portón de calidad inicial en verde, con la salida a mano si falló.
- [ ] Cambios ajenos sin commitear, si los hay, identificados y intactos.

## Ejemplo breve

- Bien: `git log` muestra `ac3ce8e fix(modelo): versiona las skills en la huella de caché…`,
  que coincide con la fila 5 del «Plan de commits 0.2.1». La tarea es la fila pendiente
  siguiente. Es correcto empezar por ella.
- Mal: empiezas «la 0.3 porque el mapa la marca 'siguiente'» sin revisar el plan de
  commits 0.2.1, que aún tiene filas pendientes. La 0.3 no debe empezar antes de cerrar
  0.2.1 (apartado 5, «0.2»).
