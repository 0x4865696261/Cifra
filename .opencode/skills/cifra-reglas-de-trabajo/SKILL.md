---
name: cifra-reglas-de-trabajo
description: Reglas de trabajo de Cifra (apartado 0 de NOVEDADES_AI.md) que valen para TODAS las tareas de este repositorio, humano o IA. Usar SIEMPRE al empezar cualquier tarea: recupera primero la memoria de dónde se quedó la última sesión, una tarea a la vez, leer antes de escribir, no inventar, no ampliar alcance, no borrar nada del repo sin permiso y cambios pequeños. Si un skill instalado contradice NOVEDADES_AI.md o NOVEDADES.md, ganan los documentos.
---

# Reglas de trabajo de Cifra

Fuente: apartado 0 de `NOVEDADES_AI.md`. Variar estas reglas requiere cambiar el documento, no el código.

## Al empezar (siempre, cualquier encargo)

1. **Recupera la memoria de la última sesión ANTES de escribir:** lee `NOVEDADES.md`, el apartado 0 y los apartados «El estado real de la 0.X» / «Decisiones abiertas» de `NOVEDADES_AI.md`, y revisa el `git log --oneline` reciente y la rama activa. Ahí vive «dónde se quedó la última vez», no en adivinanzas.
2. **Recorre la tabla de skills de `AGENTS.md`** y Decide cuáles aplican a esta tarea; lelos antes de empezar.
3. **NOVEDADES_AI.md + NOVEDADES.md mandan sobre cualquier skill instalado.** Si hay conflicto, gana el documento.

## Lo prohibido

- **Borrar o dejar vacío nada del repositorio** (ficheros, código, documentación, skills, scripts, assets) **sin permiso explícito del usuario**. Si algo parece sobrar: propón el borrado y espera la confirmación. NOVEDADES*.md y AGENTS.md no se borran ni se sobrescriben a secas.
- `git push`, merge, PR o `reset --hard` sin confirmación explícita (ver `cifra-git-commits`).

## Las diez reglas

1. **Una tarea a la vez.** Termina una, pasa el portón de calidad (`cifra-porton-calidad`) y solo entonces empieza la siguiente.
2. **Lee antes de escribir.** Antes de tocar un fichero, léelo entero. Antes de crear algo, busca si existe algo parecido y reutilízalo.
3. **No inventes.** Si un dato, un nombre de función o una decisión no está en NOVEDADES_AI.md ni en el código, no lo supongas: para y pregunta, o anótalo en «Decisiones abiertas» (apartado 8 del documento).
4. **No amplíes el alcance.** Haz lo que dice la tarea. Nada de «ya que estoy». Lo que ves que se puede mejorar se anota aparte, no se mezcla.
5. **No cambies un contrato sin avisar** (ver `cifra-contratos-datos`).
6. **Ningún secret ni dependencia por la cara:** cada dependencia nueva se justifica en una línea (regla 6); ninguna clave en código ni en logs (`cifra-privacidad-secretos`).
7. **Cada comportamiento nuevo lleva su prueba.** Una función sin prueba no está terminada.
8. **Cambios pequeños y comprobables.** Un cambio = una idea. Nada de reescribir ficheros enteros que ya funcionan.
9. **Si no puedes cumplir el criterio de terminación, dilo.** Nunca lo des por cumplido ni simules éxito.
10. **Nada de lo que no está en el documento está en la web.** No se anuncia y no se deja un botón vacío.

## Encargo a la IA ejecutora

Las tareas se encargan con esta plantilla, que se rellena y se pega tal cual:

```
Versión: 0.X, tarea N.
Lee primero: NOVEDADES_AI.md (apartados 0, 4 y la versión indicada) y los ficheros: [lista].
Haz: [descripción exacta].
No hagas: [límites].
Contratos que debes respetar: [nombres].
Pruebas que deben existir al terminar: [lista].
Termina cuando: [criterio].
Si algo no está claro, pregunta antes de escribir código.
```

## Antes de dar una tarea por terminada

- Un solo lugar de la verdad: el estado de la versión se refleja en NOVEDADES_AI.md, no en comentarios ni en el chat.
- Sin respuestas simuladas ni resultados «de mentira»: si algo no se pudo ejecutar o medir, se declara.
- Sin `git push` sin confirmación explícita (`cifra-git-commits`).
