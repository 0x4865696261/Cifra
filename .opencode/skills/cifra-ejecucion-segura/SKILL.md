---
name: cifra-ejecucion-segura
description: Cómo construir y mantener la ejecución aislada de código en Cifra (Workers, Pyodide, Rust local, RunRequest/RunResult, ejecutor de pruebas, trazas, mediciones) y el catálogo de pruebas de límites y código hostil. Úsala en tareas de la 0.3, la 0.9 y cualquier cambio en el entorno de ejecución.
---

## Para qué sirve

Recordar los requisitos fijos del apartado 0.3 (aislamiento, límites, sello de
procedencia) y no quitarse por el camino ninguno: toda ejecución devuelve un
`RunResult` fiable y el código de la persona nunca sale del ordenador.

## Cuándo usarla y cuándo no

- Sí: en la 0.3 (ejecutar con seguridad), en el endurecimiento de la 0.9, y en
  cualquier parche del ejecutor de pruebas o de las trazas.
- No: al diseñar retos o paquetes (usa `cifra-retos-fundamentos` o
  `cifra-incidentes-sinteticos`).

## Antes de empezar

1. Lee `NOVEDADES_AI.md`: apartado 0.3 completo (A–H) y contrato 4.4. Comprueba el
   apartado 9 («Lo que Cifra no promete») para no sobre-vender.
2. Lee el fichero único de límites y tipos de la 0.3 (aparece con la tarea 1; en
   `version/0.2.1` aún no existe). Los números nunca van a mano por el código.

## Pasos

1. Escribe primero el fichero único de límites y tipos `RunRequest` / `RunResult` /
   `TestSpec` / `TraceStep` según 4.4. Los límites por defecto (0.3.B): 5 000 ms,
   128 MB, 64 KB de salida, 2 000 pasos de traza, 200 caracteres por valor.
2. Para JavaScript: un Web Worker sin DOM; cancela `fetch`, `XMLHttpRequest`,
   `WebSocket` e `importScripts` antes de ejecutar; redirige `console.log` a la
   captura de salida; mata el Worker al pasar el tiempo.
3. Para Python: Pyodide en un Worker aparte, sin red, con lista cerrada de
   paquetes, carga bajo demanda con aviso del tiempo de carga.
4. Para Rust: solo proceso local en desarrollo, en directorio temporal, con tope de
   tiempo y memoria, matando el árbol de procesos, y borrado total al terminar.
   Nunca en la web pública (1.0: solo análisis a menos que se decida lo contrario
   en «Decisiones abiertas»).
5. Ejecutor de pruebas: un `TestSpec` por `TestResult`; comparación definida en un
   solo sitio (igualdad estricta por defecto, tolerancia configurable para
   decimales); cada prueba aislada de las demás; las `visible: false` no muestran
   entrada ni esperado hasta la entrega.
6. Trazas (0.3.E): con `trazar: true`; JS instrumentado antes de ejecutar, Python
   con el mecanismo de seguimiento del intérprete; recorte en `pasosTraza`; si se
   corta, marca truncada.
7. Mediciones (0.3.F): calentamiento descartado, varias repeticiones (10),
   mediana y dispersión; nunca declara ganador a quien cae dentro de la dispersión;
   dice siempre «medido en este equipo con estos límites».
8. Todo `RunResult` incluye `origen: "ejecucion-real"` y motor con versión. Si un
   lenguaje no está soportado, estado `no-soportado`: no se simula salida.
9. Integra en el estudio (0.3.G): botón «Ejecutar», puente de error a «Estudia el
   fallo» con un clic.

## Reglas

- Comprobación mínima del portón para esta área (0.3, «Pruebas que deben existir»):
  bucle infinito → `tiempo`; reserva sin fin → `memoria`; impresión sin fin →
  `salida-excedida`; `fetch`/WebSocket bloqueados y nada a la red; intento de tocar
  el DOM fracasa; el fallo de una prueba no tumba a las demás; traza truncada
  marcada como tal; la comparación no declara ganador dentro de la dispersión.
- El veredicto del reto nace del ejecutor. Nada del sistema puede marcar un reto
  superado sin un `RunResult` con todas sus pruebas pasadas.
- Una ejecución cortada no degrada la web: se explica y se libera.

## Qué NO hacer

- Nada de ejecución en servidor ni contenedores: fuera de alcance (0.3).
- No simules una salida ni «aproximes» un resultado cuando no se pudo ejecutar.
- No dejes números de límites incrustados fuera del fichero único de configuración.
- No amplíes los límites «para que pase el test hostil» sin registrar la decisión
  y sus consecuencias.
- No dejes que el código del usuario importe paquetes fuera de la lista cerrada.

## Lista de comprobación final

- [ ] Límites y tipos en el fichero único; sin cifra suelta fuera de él.
- [ ] Catálogo de pruebas de límites en verde para cada motor implementado.
- [ ] Nada del código del usuario viaja por la red.
- [ ] `RunResult` completo: `origen`, motor y versión presentes.
- [ ] Trazas truncadas marcadas; mediciones con mediana y dispersión.
- [ ] El portón de calidad completo en verde (ver `cifra-porton-de-calidad`).

## Ejemplo breve

- Bien: en el catálogo de la 0.9 un `while(true)` ejecutando en JS termina con
  estado `tiempo` y la web sigue respondiendo; el test lo verifica con el límite del
  fichero único de configuración.
- Mal: subir el tiempo por defecto a 30 segundos «para que el test del bucle
  infinito pase más rápido».
