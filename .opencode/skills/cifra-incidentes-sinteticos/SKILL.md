---
name: cifra-incidentes-sinteticos
description: Cómo diseñar un paquete de incidente sintético de Cifra (IncidentSpec, fallo plantado realista, síntoma, terminal simulada con lista cerrada de comandos, respuesta esperada y evaluación de la evidencia). Úsala en la 0.5 y en cualquier paquete nuevo.
---

## Para qué sirve

Diseñar paquetes de incidente que se investiguen como en el trabajo: un sistema
sintético, un fallo plantado y una evaluación que separa lo comprobado de lo
deducido. Solo defensa: nada de explotación.

## Cuándo usarla y cuándo no

- Sí: al escribir cualquier `IncidentSpec` (0.5), la terminal simulada o la
  evaluación estructurada.
- No: para retos de fundamentos (usa `cifra-retos-fundamentos`).

## Antes de empezar

1. Lee `NOVEDADES_AI.md`: apartado 0.5 (A–H), contrato 4.6 (`IncidentSpec`) y las
   familias del fallo (0.5.F).
2. Revisa los principios 4-5 del apartado 3 (material sintético, defensivo primero).

## Pasos

1. Elige familia de 0.5.F y nivel 1–10. Un paquete = una causa raíz clara, con
   ruido suficiente para exigir leer, no para ocultar lo imposible.
2. Escribe el `IncidentSpec`: `id`, `titulo`, `nivel`, `familia`, `sintoma`,
   `ficheros`, `respuestaEsperada`, `conceptos`.
3. Planta el fallo de forma realista: código y configuración de una web o de
   infraestructura, logs y métricas coherentes con el síntoma. El síntoma
   (`comprometida`, muy lenta, falla a ciertas horas, factura disparada, datos
   corruptos) debe poder investigarse solo con la evidencia de los ficheros.
4. Crea el sistema de ficheros virtual: rutas plausibles, tamaños verosímiles,
   logs con marcas de tiempo que encajen con la historia. Cada línea citada en
   `respuestaEsperada.evidencia` existe y dice exactamente lo que se afirma.
5. La terminal simulada (0.5.B): intérprete propio de solo lectura sobre el
   sistema de ficheros virtual. Lista cerrada de comandos: `ls`, `cat`, `head`,
   `tail`, `grep`, `wc`, `sort`, `uniq`, `diff`, `find`, `cut`. Todo lo demás
   responde «no disponible» y no se ejecuta. Historial revisable.
   Cada comando tiene su prueba; la terminal no puede salir fuera del sistema
   de ficheros virtual (prueba con rutas `../`).
6. `respuestaEsperada` completa: `causa`, `evidencia` (rutas y líneas que lo
   prueban), `impacto`, `corrección`, `comoDetectarlo` (cómo habría saltado antes:
   una alarma, un test, una revisión).
7. Evaluación estructurada (0.5.D): comparación campo a campo; la evidencia se
   comprueba contra los ficheros — quien cita una línea que no dice eso se marca;
   un análisis que suena bien sin evidencia se evalúa como «deducido sin
   evidencia». Esto es `comprobado-regla`. La IA redacta la explicación a partir
   de esa comparación; no decide por sí sola si el análisis es correcto.
8. Enlaza `conceptos` con slugs reales de la biblioteca.
9. Registro del paquete: los paquetes se añaden como módulos (0.6); no hagas
   parches sueltos en la plataforma.

## Reglas (duras)

- Solo defensivo: el paquete enseña a detectar, entender y corregir. Si el
  problema es un ataque, el reto es reconstruir qué pasó y cómo se cierra.
- Ningún paquete contiene credenciales reales, direcciones reales ni código de
  explotación funcional. Los secretos aparecen como plantillas vacías o
  marcadores, nunca como valores.
- Comprobación automática de patrones de credenciales reales está en las
  pruebas del apartado 0.5 y debe pasar por cada paquete.
- Mínimo de la versión 0.5: 8 paquetes, uno por familia, nivel mixto.
- La persona puede usar cualquier IA libremente (0.5.E); lo que se evalúa es la
  calidad del análisis, no el uso de ayuda.

## Qué NO hacer

- No escribas pasos de explotación ni instrucciones para atacar.
- No copies configuraciones, nombres de dominio ni árboles de ficheros de sistemas
  reales.
- No dejes huecos sin resolver en el paquete: quien investiga debe poder llegar
  con la evidencia disponible a una causa razonada y una corrección.
- No añadas comandos fuera de la lista cerrada ni amplíes la lista sin pantalla,
  pruebas y anotación en los documentos.

## Lista de comprobación final

- [ ] `IncidentSpec` completo según 4.6, sin campos de más.
- [ ] El análisis de ejemplo correcto del paquete se evalúa todo como acertado.
- [ ] Un análisis plausible pero sin evidencia se evalúa como «deducido sin evidencia».
- [ ] Comandos de la lista cerrada probados uno a uno; fuera de la lista, nunca
      se ejecutan.
- [ ] Rutas `../` no salen del sistema de ficheros virtual.
- [ ] Sin credenciales ni direcciones reales (chequeo de patrones en verde).
- [ ] `conceptos` resueltos contra la biblioteca.

## Ejemplo breve

- Bien: un paquete «factura disparada» cuyo síntoma se resuelve con un `grep` en
  los logs de la aplicación de los pagos; la causa es un cambio de índice, la
  evidencia son dos rutas concretas y la corrección, una única línea.
- Mal: un paquete con un «ataque» al sistema y credenciales reales en los ficheros
  para «verosimilitud».
