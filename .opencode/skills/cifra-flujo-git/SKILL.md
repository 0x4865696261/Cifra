---
name: cifra-flujo-git
description: Cómo commitear en Cifra: ramas por versión, un commit por mejora, Conventional Commits en español, commits firmados con verificación, revisión del diff, push, revert y deshacer sin destruir. Úsala antes del primer commit de cualquier tarea.
---

## Para qué sirve

Dejar un historial limpio, firmado y reversible en el que el mensaje dice qué mejora
es y la prueba viaja en el mismo commit.

## Cuándo usarla y cuándo no

- Sí: antes de crear la rama de la tarea y antes de cada commit.
- No: para reescribir el historial publicado (prohibido) ni para limpiar ficheros ajenos.

## Antes de empezar

1. Lee `NOVEDADES_AI.md` apartado 0 y el «Plan de commits X.Y» vigente: las filas
   pendientes ya llevan el mensaje de commit propuesto, respétalo.
2. Lee la skill `cifra-orientacion` si no la pasaste.

## Pasos

1. Crea la rama de la versión desde la rama vigente si no existe. Patrón actual:
   `version/<X.Y>` (ejemplo real: `version/0.2.1`); para tareas de documentación,
   `chore/skills`. Nunca trabajes en `main`.
2. Trabaja la tarea entera: código, contrato y su prueba en el mismo commit.
3. Añade con `git add` ficheros concretos (`git add src/lib/analyze/failure.ts
   src/lib/analyze/failure.test.ts`). Nunca `git add .`.
4. Revisa `git diff --staged`: debe contener solo tu mejora. Busca claves, tokens,
   rutas personales y ficheros que no te tocan. Si aparece algo, sácalo con
   `git restore --staged <fichero>` y ajusta.
5. Commitea firmado: `git commit -S -m "<tipo>(<ámbito>): <mejora en español>"`.
6. Verifica la firma: `git cat-file commit HEAD` debe mostrar un bloque `gpgsig`.
   Si no aparece, para: es un bloqueo real, no lo des por hecho.
7. Marca la fila del plan de commits como «hecha» en `NOVEDADES_AI.md` (apéndice) en
   este commit o en el inmediato.
8. Push a tu rama: `git push` (o `git push -u origin <rama>` la primera vez), tras
   cada commit.

## Reglas

- Un commit = una mejora. Nada de mezclar «arreglo X y de paso reordeno Y».
- Tipos válidos en Conventional Commits (español): `feat`, `fix`, `test`, `docs`,
  `refactor`, `chore`. Ámbito en minúsculas: `estudio`, `analisis`, `modelo`,
  `novedades`, `skills`.
- El mensaje no acaba en punto y no empieza por mayúscula tras los dos puntos.
- Para deshacer un commit ya publicado: `git revert <hash>` con mensaje descriptivo.
- Para deshacer trabajo local sin commitear: `git restore <fichero>` o
  `git restore --staged <fichero>`.

## Qué NO hacer

- Nunca `--force`, ni `origin --force`, ni alias relacionados.
- Nunca `git reset --hard` sobre commits subidos; sobre trabajo local solo si los
  ficheros son claramente descartables y comprobado dos veces.
- Nunca comitées en `main` ni fusiones `main` tú mismo.
- Nunca firmes con una clave ajena a `~/.ssh` configurada; este repo firma con SSH
  (`gpg.format=ssh`, clave en `~/.ssh/id_ed25519.pub`).
- No uses `gpg`: este equipo firma vía SSH; la verificación del bloque `gpgsig` es
  igual de válida.

## Lista de comprobación final

- [ ] La rama no es `main`.
- [ ] `git diff --staged` revisado y sin secretos ni ficheros ajenos.
- [ ] Commit firmado; `git cat-file commit HEAD` muestra `gpgsig`.
- [ ] Mensaje Conventional Commit en español, una mejora, coincide con la fila del plan.
- [ ] Prueba de la funcionalidad incluida en el mismo commit.
- [ ] Push hecho y fila del plan actualizada.

## Ejemplo breve

- Bien: `git commit -S -m "feat(estudio): límites de entrada 20.000 y 8.000 con aviso
  en la interfaz"` — es exactamente la fila 2 del plan de commits 0.2.1 y llegó en el
  commit `b373a05`.
- Mal: `git commit -m "varios arreglos"` sin firma, con el fichero de prueba de otra
  persona incluido en el diff.
