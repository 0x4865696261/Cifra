---
name: cifra-porton-de-calidad
description: Pasar el portón de calidad de Cifra (typecheck, pruebas, build, consola limpia), escribir la prueba de una funcionalidad, inscribirla en el script test y actuar si algo falla. Úsala antes de dar cualquier tarea o versión por terminada.
---

## Para qué sirve

Convertir el apartado 6 de NOVEDADES_AI.md («Portón de calidad») en una ronda
concreta de órdenes con salida real, y escribir las pruebas que ese apartado exige.

## Cuándo usarla y cuándo no

- Sí: al cerrar cada tarea, cada commit funcional y cada versión; y tras cualquier
  refactor.
- No: en tareas puramente documentales salvo comprobación final (en ese caso basta
  `npm run typecheck` para confirmar que no rompiste nada).

## Antes de empezar

1. Lee `NOVEDADES_AI.md` apartado 6 y el criterio de terminación de tu versión.
2. Ten claro qué prueba debe existir para tu funcionalidad (cada versión tiene una
   lista «Pruebas que deben existir»).

## Pasos

1. Arranca el portón en este orden y no sigas con la siguiente orden hasta que la
   actual pase sin errores:
   - `npm run typecheck`
   - `npm test`
   - `npm run build`
2. Comprueba el render con consola limpia en escritorio y móvil: el proyecto trae
   `scripts/browser-smoke.mjs` para eso; ejecutalo según su cabecera y no des por
   buena ninguna pantalla sin su captura limpia. Un 200 de la orden no demuestra que
   haya contenido visible.
3. Escribe la prueba de la funcionalidad en el mismo commit, junto al fichero que
   prueba (patrón del repo: `failure.test.ts` junto a `failure.ts`).
4. Registra el fichero de prueba nuevo en el script `test` de `package.json`: ahí
   los ficheros van listados uno a uno. Nada de glob para `src/`: si no está en la
   lista, no corre.
5. Nombra cada caso de prueba como una frase comprobable: qué comportamiento se
   debe cumplir y con qué condición. Un caso por regla; añade los casos límite que
   la regla declara (entrada vacía, fuera de rango, mensaje irreconocible →
   `desconocido`).
6. Si algo del portón falla: para. Lee el error completo, arregla solo lo que toca
   a tu tarea, re-corre el portón desde el paso que falló. Si el fallo no depende de
   tu cambio, repórtalo con la salida real y no lo vendas como tuyo.
7. Usa la salida real al informar: pega el fragmento del error (nombre del test,
   línea, mensaje) y la orden exacta que lo reproduce.

## Reglas

- Sin prueba, la funcionalidad no está terminada (regla 8 del apartado 0).
- Un fichero de prueba solo corre si está inscrito en el script `test` en el mismo
  commit que lo crea.
- Los tests corren con `node --test` y los TypeScript vía
  `node --experimental-strip-types --test`; no introduzcas un runner nuevo sin
  justificarlo según la regla 6 del apartado 0.
- El portón incluye: ninguna clave ni dato personal en logs (prueba automática, ver
  `src/lib/ai/secret.test.ts` como patrón).
- Si el criterio de terminación de tu versión no se cumple, dilo; no lo des por
  cumplido (regla 10 del apartado 0).

## Qué NO hacer

- No alteres las pruebas para que pasen; si el test señala un fallo real,
  arréglalo o, si el criterio cambió, anota el cambio primero.
- No te salte ninguna de las tres puertas: typecheck, pruebas y build van las tres.
- No salte el paso de consola limpia ni el de escritorio+móvil.
- No dejes un test `it.skip` o `describe.skip` en el commit.
- No pongas en el commit que la 0.X está «hecha» sin haber pasado el portón y la
  revisión (ver `cifra-sincronia-documental`).

## Lista de comprobación final

- [ ] `npm run typecheck` sin errores.
- [ ] `npm test` en verde, incluido el fichero de prueba nuevo.
- [ ] `npm run build` correcto.
- [ ] Consola limpia en escritorio y móvil en las pantallas tocadas (capturas en
      `screenshots/`).
- [ ] Todo fichero de prueba nuevo está inscrito en el script `test` de `package.json`.
- [ ] El informe si hubo fallos lleva la salida real.

## Ejemplo breve

- Bien: al añadir el análisis del mensaje, la prueba `failure.test.ts` se escribió
  fila por fila para la tabla de tipos de error del apartado 0.2.B y se inscribió
  en el script `test` en el mismo commit (`7870534 feat(analisis): añade el contrato
  FailureReport...`).
- Mal: escribir una función nueva sin registro en `test` y proclamar «todo pasa»
  porque el build pasa.
