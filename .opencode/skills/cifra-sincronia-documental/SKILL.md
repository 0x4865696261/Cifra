---
name: cifra-sincronia-documental
description: Cómo mantener NOVEDADES.md y NOVEDADES_AI.md sincronizados, escribir y actualizar el «Plan de commits X.Y», marcar estados de versión terminada-pendiente-de-revisión y registrar decisiones por defecto y bloqueos. Úsala al actualizar los documentos o al cerrar versión o tarea.
---

## Para qué sirve

Que los documentos sean el espejo fiel de lo que existe, sin contarse los estados
por adelantado.

## Cuándo usarla y cuándo no

- Sí: al cerrar una tarea o versión, al abrir un plan de commits, al tomar una
  decisión por defecto (apartado 8) y al toparse con una incoherencia entre
  documentos.
- No: sustituye el informe al usuario; lo complementa con el registro en el sitio
  correcto.

## Antes de empezar

1. Ten a mano los dos documentos completos. `NOVEDADES_AI.md` manda si se
   contradicen; cada contradicción se anota como incoherencia (aquí o el informe).
2. Comprueba `git log` reciente para describir el estado REAL, no el deseado.

## Pasos

1. «Plan de commits X.Y»: cada versión grande se puede descomponer en filas `#`,
   mensaje de commit y estado (`pendiente` → `hecha`). El plan se anota en
   `NOVEDADES_AI.md` como apéndice (modelo: «Plan de commits 0.2.1») cuando la
   versión ya marcada «hecha» tiene huecos por cubrir, y se actualiza fila por
   fila en el mismo commit que deja «hecha» cada fila.
2. Estados de versión: una versión es «terminada, pendiente de revisión» cuando
   cumple su criterio de terminación y el portón, pero no ha pasado revisión
   (humano o revisión cruzada). Solo tras esa revisión es «hecha». Nunca uses
   «hecha» sin revisión: es la regla heredada del caso 0.2 (apareció «hecha» y
   luego nació 0.2.1 para cubrir los huecos).
3. Si al cerrar encuentras huecos frente a lo prometido, crea el plan de commits
   X.Y.1 por escrito (como se hizo con 0.2.1) y actualiza el estado del mapa:
   «hecha, con ampliaciones pendientes en X.Y.1» (el mapa actual de la 0.2 es el
   ejemplo).
4. Decisiones por defecto (apartado 8): cuando apliques una propuesta por defecto
   porque la versión la necesita, anota ahí: usada la propuesta o decidido algo
   distinto, con el motivo. Las decisiones cerradas se afirman en su apartado de
   versión y se borra de abiertas.
5. Incoherencias entre `NOVEDADES.md` y `NOVEDADES_AI.md`: corrígelas donde vivan
   (suelen ser duplicados más pequeños en `NOVEDADES.md`) y anótalas en el informe
   de la sesión.
6. Cada commit que cambia código que los documentos describen lleva la
   actualización del documento en el mismo commit o en uno inmediato; si solo
   cambia el estado, el mensaje tipo `docs(novedades): ...`.

## Reglas

- Los documentos dicen QUÉ; las skills (`cifra-orientacion` y demás) dicen CÓMO. No
  copies apartados de NOVEDADES_AI.md dentro de las skills: refiérelos por número y
  nombre para no crear una segunda fuente de verdad.
- Nada de estados futuros («la siguiente versión traerá») en descripciones del
  presente: lo que no existe no se anuncia.
- Los registros en NOVEDADES_AI.md se hacen en el idioma del documento (español) y
  en el formato de tabla que ya usa.

## Qué NO hacer

- No dejes el mapa marcando «hecha» una versión con huecos documentados; sí con
  su nota «con ampliaciones» o plan 0.X.1 apuntando a ellas.
- No abras un plan de commits para versiones que no se han empezado.
- No borres decisiones del apartado 8 sin migrarlas a su sitio definitivo.
- No registres en NOVEDADES.md nada que NOVEDADES_AI.md no registre (para no
  duplicar verdad).

## Lista de comprobación final

- [ ] El mapa de versiones refleja el estado real del plan y del portón.
- [ ] Las filas del plan vigente coinciden con `git log`.
- [ ] Las decisiones aplicadas están registradas en el apartado 8.
- [ ] Una versión sin revisión está marcada «terminada, pendiente de revisión».
- [ ] No hay duplicado definicional fuera del apartado de contratos y versiones.

## Ejemplo breve

- Bien: la 0.2 pasó a «hecha» en el momento en que se descubrieron huecos; se
  registró el plan de commits 0.2.1 con sus ocho filas y estados, y el mapa quedó
  «hecha (con ampliaciones de base)». Así es como se documenta un paso y su deuda.
- Mal: dejar la fila 6 del plan «hecha» en el documento cuando el commit de la
  prueba no está en `git log`.
