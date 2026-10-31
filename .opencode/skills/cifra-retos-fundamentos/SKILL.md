---
name: cifra-retos-fundamentos
description: Cómo diseñar un reto de fundamentos de Cifra (ChallengeSpec, familia y nivel, pruebas que detectan el error típico, variantes por semilla y preguntas de defensa). Úsala en la 0.4 y en cualquier reto o variante nueva.
---

## Para qué sirve

Diseñar retos que enseñen a pensar los casos límite, con veredicto que sale de
pruebas reales y resistencia real a copiar soluciones.

## Cuándo usarla y cuándo no

- Sí: al escribir cualquier `ChallengeSpec` (0.4 y después), la prueba de nivel y
  cualquier variante por semilla.
- No: para paquetes de incidente (usa `cifra-incidentes-sinteticos`) ni para el
  contenido teórico (usa `cifra-contenido-biblioteca`).

## Antes de empezar

1. Lee `NOVEDADES_AI.md`: apartado 0.4 (A–F), contrato 4.5 (`ChallengeSpec`) y las
   decisiones abiertas que se fijan en la 0.4 (umbral del plan profesional, número
   de retos).
2. Revisa el ejecutor de la 0.3: tus pruebas serán `TestSpec` reales.

## Pasos

1. Elige familia (variables y tipos, condicionales, bucles, funciones, colecciones,
   cadenas, recursión, búsqueda y ordenación, complejidad, estructuras básicas) y
   nivel 1–10. Nivel = qué hilos del pensamiento hace subir el reto, no cuántas
   líneas tiene la solución.
2. Escribe el `ChallengeSpec`: `id`, `titulo`, `familia`, `nivel`, `enunciado`,
   `codigoDePartida`, `lenguajes`, `pruebas`, `conceptos`, `preguntasDefensa`.
   El enunciado se entiende sin pistas externas.3. Incluye al menos una prueba que falle con la solución «casi correcta más típica»
   (un límite mal puesto, un caso vacío, un fuera de rango). Sin esa prueba, el reto
   no enseña a pensar los límites.
4. `conceptos` apunta a slugs reales de la biblioteca (`src/lib/content/concepts.ts`);
   la biblioteca debe sostener cada idea que el reto exija.
5. Si la familia admite variantes, define `generador` con semilla «por-persona» y
   parámetros declarados y acotados (mismas familias de datos, tamaños acotados).
   Invariante: misma semilla ⇒ mismos datos, siempre.
6. Escribe `preguntasDefensa`: una o dos preguntas sobre el propio código de la
   persona (por qué este límite, qué pasa si la entrada está vacía).
7. Verifica el flujo completo (0.4.C): entrega → resolución propia → envío que
   ejecuta en el aislado (0.3) → IA que lee código + `RunResult` + enunciado y
   explica; no da por bueno lo que falla ni suspende lo que pasa.
8. Antes de dar por listo el reto, completa la lista de abajo.

## Reglas

- Mínimo de la versión 0.4: 5 familias × 3 niveles = 15 retos, escritos y probados
  (o lo que diga la decisión tomada en el apartado 8).
- El veredicto (superado / no superado) solo procede de un `RunResult` con todas las
  pruebas pasadas. La IA propone explicación; los resultados ya están.
- Una solución copiada no supera: la semilla por persona cambia los datos.
- Señales de integridad (foco, pegados, ritmo) nunca bloquean el envío: solo activan
  la pregunta de defensa.
- Tras superar, «defiende tu solución»: sin explicación suficiente queda «superado
  sin comprender» y pide repaso.

## Qué NO hacer

- No metas en el enunciado la solución disfrazada de ayuda.
- No uses datos del mundo real de nadie; todo es sintético (principio 4 del
  apartado 3).
- No dejes pruebas sin mensaje útil al fallar: una prueba que falla «en rojo sin más»
  no enseña.
- No publiques un reto sin haberlo resuelto tú y haber fallado su prueba de caso
  típica intencionadamente.
- No inventes conceptos: los ids deben existir en la biblioteca.

## Lista de comprobación final

- [ ] `ChallengeSpec` completo tal cual el 4.5, sin campos de más.
- [ ] Al menos una prueba del «casi correcta más típica».
- [ ] Semilla por persona reproducible: misma semilla ⇒ mismos datos.
- [ ] `conceptos` resueltos contra `src/lib/content/concepts.ts`.
- [ ] Flujo 0.4.C probado de punta a punta con un `RunResult`.
- [ ] «Superado» solo con pruebas pasadas; defensa tras superar.

## Ejemplo breve

- Bien: un reto de bucles con la variable de fin mal puesta por defecto pasa todas
  las pruebas de caso normal y falla solo en el extremo; la persona tiene que mirar
  el límite.
- Mal: un reto cuya solución que circula por internet pasa todas las pruebas
  igual — no hay semilla ni variante.
