---
name: cifra-comprobado-deducido-opinion
description: Principio de procedencia de Cifra (principio 1 de NOVEDADES_AI.md y contrato 4.1). Toda afirmación de una explicación o interfaz lleva su sello comprobado-ejecucion / comprobado-regla / deducido / opinion. Usar al escribir o revisar CUALQUIER texto generado por IA, análisis o presentación de resultados, y al validar salidas del modelo contra Afirmacion.
---

# Comprobado, deducido, opinión

Fuente: principios 1 y 3 de `NOVEDADES_AI.md` y contrato 4.1. Cifra se distingue por esto: no mezcla verdad con veredicto.

## Las cuatro etiquetas

| Etiqueta | Cuándo usarla |
|---|---|
| `comprobado-ejecucion` | Solo si hay un `RunResult` concreto detrás (contrato 4.4). Si no hay ejecución, NO puede llevar esta etiqueta. |
| `comprobado-regla` | Salida de una regla o análisis local verificable: `analyzeFailure` (0.2.B), la evaluación de la terminal (0.5.D), la comparación campo a campo. |
| `deducido` | Razonamiento sin comprobar. **Todo lo que escribe el modelo lleva esta etiqueta por defecto.** |
| `opinion` | Valoración subjetiva (una observación de calidad, por ejemplo). Nunca se presenta como hecho. |

## Reglas duras

- Todo `Afirmacion` lleva `procedencia`. Un texto sin sello no se muestra.
- Una afirmación `comprobado-ejecucion` debe poder **enlazarse a un `RunResult`**. Lo contrario es mentir sobre la ejecución.
- La IA nunca decide un veredicto: las pruebas y la comparación contra la respuesta esperada deciden (0.4.C, 0.5.D). Aunque el modelo suene convincente, eso no es evidencia.
- La skill de depuración no afirma una causa como cierta si solo se dedujo; no inventa líneas que no están en el código (0.2.C).
- La comparación de mediciones no declara ganadora una versión cuando la diferencia cae dentro de la dispersión (0.3.F): «medido en este equipo con estos límites», nunca valor universal.
- Si el análisis local no reconoce un mensaje: `tipo = "desconocido"`. Nunca se fuerza un tipo.
- Explicar, no regalar: no se devuelve el código corregido a secas.

## En la práctica, al revisar código propio

Cada enunciado que veas en UI o en textos generados por IA debe poder responder: ¿de dónde sale esto? Si la respuesta no es una ejecución real, una regla local verificable, o una opinión marcada, arréglalo antes de terminar.
