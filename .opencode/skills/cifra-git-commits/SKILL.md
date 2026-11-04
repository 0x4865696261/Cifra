---
name: cifra-git-commits
description: Convenciones de commits y control de versiones de Cifra. Usar antes de crear cualquier commit y al gestionar ramas y reverts. Commits pequeños (uno por mejora), firmados, con mensaje claro, sin push sin confirmación explícita del usuario, y saber volver a un commit concreto si algo falla.
---

# Commits en Cifra (cifra-git-commits)

Cada versión y cada mejora se trabaja en commits pequeños que dejan el portón en verde.

## Convenciones

- **Un commit = una mejora.** Nada de commit-maleta. Si mezclas dos ideas, parte el commit.
- **Cada commit deja typecheck, pruebas (y build cuando toca) en verde** — es la regla de los planes de commits de NOVEDADES_AI.md.
- **Cada commit lleva la prueba de lo que añade:** el fichero de prueba nuevo entra en el mismo commit que la funcionalidad (práctica fija en 0.2.1-0.4).
- **Mensaje claro, estilo del proyecto** (los planes de commits los usan así):
  - `feat(ámbito): qué añade` — ej. `feat(ejecucion): ejecuta JavaScript en un Worker con corte y salida capturada`
  - `fix(ámbito): qué corrige` — ej. `fix(retos): la pantalla de reto responde a /retos/$id`
  - `test(ámbito):`, `refactor(ámbito):`, `docs(novedades): refleja el estado real de la 0.X`.
- **Commits firmados** (`git commit -S`; el repositorio lo lleva así, todos los planes lo piden).

## Ramas y push

- Las versiones trabajan en ramas `version/0.X` (0.3, 0.4, 0.5...). El plan de commits de cada versión se registra primero en NOVEDADES_AI.md.
- **Nunca `git push` (ni merge, ni PR) sin confirmación explícita del usuario.** Esto vale también aunque la rama «lo pida»: se prepara y se espera.
- No escribir claves ni contenido de usuario en mensajes de commit (`cifra-privacidad-secretos`).

## Volver atrás

Si algo falla tras un cambio:

1. Localiza el último commit en verde (`git log --oneline`).
2. Opción A — revert: `git revert <hash>` para deshacer sin reescribir historia.
3. Opción B — si la rama no está compartida: `git reset --hard <hash-en-verde>` y rehacer el cambio bien.
4. Tras volver atrás: pasar el `cifra-porton-calidad` de nuevo y anotar la decisión en NOVEDADES_AI.md si toca.
