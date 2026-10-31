---
name: cifra-codigo-profesional
description: Cómo debe escribirse el código de Cifra (nombres, funciones pequeñas, comentarios de porqué, sin código muerto, reutilización, dependencias). Úsala al escribir o revisar cualquier fichero de código o contenido.
---

## Para qué sirve

Que el código parezca escrito por una persona del equipo: legible, pequeño, sin
florituras y sin sorpresas, de modo que otra sesión (humano o IA) pueda
continuarlo sin reescribirlo.

## Cuándo usarla y cuándo no

- Sí: al añadir o modificar cualquier fichero de `src/`, `scripts/` o contenido.
- No: para contenidos de la biblioteca (usa `cifra-contenido-biblioteca`) ni para
  decisiones de producto (usa `cifra-diferenciacion-producto`).

## Antes de empezar

1. Lee `NOVEDADES_AI.md` apartado 0 («Reglas para quien construye») y apartado 4
   (contratos de datos, si tu tarea toca uno).
2. Lee entero cada fichero que vayas a modificar; nunca edites a ciegas.

## Pasos

1. Busca si ya existe algo parecido y reutilízalo. En este proyecto:
   tipos de contratos en `src/lib/analyze/failure.ts` y `src/lib/ai/*.ts`,
   skills de la web en `src/lib/skills/registry.ts`, contenido en
   `src/lib/content/`. Duplicar lo que existe es un fallo de revisión.
2. Escribe funciones pequeñas y de un propósito. Si una función necesita comentarios
   para explicarse por secciones, divídela.
3. Pon nombres del dominio del proyecto, en español cuando el dominio lo pida
   (`lineasNombradas`, `respuestaEsperada`, `topeSalidaTokens`) y en inglés técnico
   solo si es convenio del fichero vecino. Sigue el estilo del fichero que editas.
4. Comenta solo el porqué (una decisión, un límite, una regla que no se ve);
   nunca el qué. El código explica el qué.
5. Trata los errores: toda operación que puede fallar (parse de JSON, red, fichero)
   define qué pasa si falla y muestra un mensaje accionable (ver
   `cifra-explicacion-honesta`).
6. Borra: código muerto, imports sin uso, TODO sueltos, logs de depuración y
   cualquier hueco «temporal». Si falta algo por decidir, anótalo en el apartado 8
   de NOVEDADES_AI.md, no en el código.
7. Cada dependencia nueva: para, justifica en el commit en una línea (qué resuelve y
   por qué no basta lo que ya hay, regla 6 del apartado 0) y usa solo paquetes
   necesarios. Sin esa línea, la dependencia no entra.

## Reglas

- Un cambio = una idea (regla 9 del apartado 0). Nada de reescribir ficheros que ya
  funcionan.
- Si ves algo mejorable fuera del alcance de tu tarea, anótalo aparte; no lo mezcles
  (regla 4 del apartado 0).
- Los tipos de los contratos del apartado 4 son la única fuente: si un dato atraviesa
  pantallas, vive en un fichero de contratos, no duplicado en la pantalla.
- `typecheck` sin `any` innecesarios: el proyecto pasa `tsc --noEmit`.

## Qué NO hacer

- No inventes funciones ni datos que no existen: si no está en el documento o en el
  código, para y pregunta (regla 3 del apartado 0).
- No amplíes el alcance con «ya que estoy».
- No dejes comentario que diga «DESPUÉS: ...», ni código comentado por si acaso.
- No añadas `try/catch` vacíos que traguen errores en silencio.
- No pongas logs ni cadenas en claro con datos personales.

## Lista de comprobación final

- [ ] Cada fichero leído entero antes de editarlo.
- [ ] Funciones pequeñas; ninguna necesita un mapa mental para seguirse.
- [ ] Comentarios solo de porqué; cero TODO y cero código muerto.
- [ ] Reutilizado lo existente (o razonado en el commit por qué se creó algo nuevo).
- [ ] Toda dependencia nueva justificada en el cuerpo o mensaje del commit.
- [ ] typecheck y pruebas del fichero tocado en verde.

## Ejemplo breve

- Bien: `src/lib/analyze/failure.ts` define `Procedencia` en un sitio y el análisis
  local es una función pura sin llamadas de red; sus pruebas en `failure.test.ts`
  cubren fila por fila la tabla del apartado 0.2.B.
- Mal: copiar el tipo `Afirmacion` a un componente de UI en vez de importarlo desde
  el fichero de contratos.
