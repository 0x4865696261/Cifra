---
name: cifra-codigo-profesional
description: CÃ³mo debe escribirse el cÃ³digo de Cifra (nombres, funciones pequeÃ±as, comentarios de porquÃ©, sin cÃ³digo muerto, reutilizaciÃ³n, dependencias). Ãšsala al escribir o revisar cualquier fichero de cÃ³digo o contenido.
---

## Para quÃ© sirve

Que el cÃ³digo parezca escrito por una persona del equipo: legible, pequeÃ±o, sin
florituras y sin sorpresas, de modo que otra sesiÃ³n (humano o IA) pueda
continuarlo sin reescribirlo.

## CuÃ¡ndo usarla y cuÃ¡ndo no

- SÃ­: al aÃ±adir o modificar cualquier fichero de `src/`, `scripts/` o contenido.
- No: para contenidos de la biblioteca (usa `cifra-contenido-biblioteca`) ni para
  decisiones de producto (usa `cifra-diferenciacion-producto`).

## Antes de empezar

1. Lee `NOVEDADES_AI.md` apartado 0 (Â«Reglas para quien construyeÂ») y apartado 4
   (contratos de datos, si tu tarea toca uno).
2. Lee entero cada fichero que vayas a modificar; nunca edites a ciegas.

## Pasos

1. Busca si ya existe algo parecido y reutilÃ­zalo. En este proyecto:
   tipos de contratos en `src/lib/analyze/failure.ts` y `src/lib/ai/*.ts`,
   skills de la web en `src/lib/skills/registry.ts`, contenido en
   `src/lib/content/`. Duplicar lo que existe es un fallo de revisiÃ³n.
2. Escribe funciones pequeÃ±as y de un propÃ³sito. Si una funciÃ³n necesita comentarios
   para explicarse por secciones, divÃ­dela.
3. Pon nombres del dominio del proyecto, en espaÃ±ol cuando el dominio lo pida
   (`lineasNombradas`, `respuestaEsperada`, `topeSalidaTokens`) y en inglÃ©s tÃ©cnico
   solo si es convenio del fichero vecino. Sigue el estilo del fichero que editas.
4. Comenta solo el porquÃ© (una decisiÃ³n, un lÃ­mite, un porquÃ© de una regla);
   nunca el quÃ©. El cÃ³digo explica el quÃ©.
5. Trata los errores: toda operaciÃ³n que puede fallar (parse de JSON, red, fichero)
   define quÃ© pasa si falla y muestra un mensaje accionable (ver
   `cifra-explicacion-honesta`).
6. Borra: cÃ³digo muerto, imports sin uso, TODO sueltos, logs de depuraciÃ³n y
   cualquier hueco Â«temporalÂ». Si falta algo por decidir, anÃ³talo en el apartado 8
   de NOVEDADES_AI.md, no en el cÃ³digo.
7. Cada dependencia nueva: para, justifica en el commit en una lÃ­nea (quÃ© resuelve y
   por quÃ© no basta lo que ya hay, regla 6 del apartado 0) y usa solo paquetes
   necesarios. Sin esta lÃ­nea, la dependencia no entra.

## Reglas

- Un cambio = una idea (regla 9 del apartado 0). Nada de reescribir ficheros que ya
  funcionan.
- Si ves algo mejorable fuera del alcance de tu tarea, anÃ³talo aparte; no lo mezcles
  (regla 4 del apartado 0).
- Los tipos de los contratos del apartado 4 son la Ãºnica fuente: si un dato atraviesa
  pantallas, existe en un fichero de contratos, no duplicado en la pantalla.
- `typecheck` sin `any` innecesarios: el proyecto pasa `tsc --noEmit`.

## QuÃ© NO hacer

- No inventes funciones ni datos que no existen: si no estÃ¡ en el documento o en el
  cÃ³digo, para y pregunta (regla 3 del apartado 0).
- No amplÃ­es el alcance con Â«ya que estoyÂ».
- No pongas comentarios de historia o fecha, ni ruido de este tipo.
- No aÃ±adas `try/catch` vacÃ­os que traguen errores a silencio.
- No dejes alertas, logs ni cadenas en claro con datos personales.

## Lista de comprobaciÃ³n final

- [ ] Cada fichero leÃ­do entero antes de editarlo.
- [ ] Funciones pequeÃ±as; ninguna necesita un mapa mental para seguirse.
- [ ] Comentarios solo de porquÃ©; cero TODO y cero cÃ³digo muerto.
- [ ] Reutilizado lo existente (o razonado en el commit por quÃ© se creÃ³ algo nuevo).
- [ ] Toda dependencia nueva justificada en el cuerpo o mensaje del commit.
- [ ] typecheck y pruebas del fichero tocado en verde.

## Ejemplo breve

- Bien: `src/lib/analyze/failure.ts` define `Procedencia` en un sitio y el anÃ¡lisis
  local es una funciÃ³n pura sin llamadas de red; sus pruebas en `failure.test.ts`
  van fila por fila de la tabla del apartado 0.2.B.
- Mal: copiar el tipo `Afirmacion` a un componente de UI en vez de importarlo desde
  el fichero de contratos.
