---
name: cifra-ejecucion-aislada
description: Cómo se ejecuta código de la persona en Cifra (versión 0.3 de NOVEDADES_AI.md) aislamiento, límites y honestidad. Usar SIEMPRE antes de tocar el ejecutor (src/lib/ejecucion/), los Workers, Pyodide, la traza, el ejecutor de pruebas o la comparación de mediciones, y antes de cualquier cambio a RunResult, TestSpec o TraceStep.
---

# Ejecución aislada y acotada

Fuente: versión 0.3 de `NOVEDADES_AI.md` y contrato 4.4 (contratos vivos: `cifra-contratos-datos`).

## Los cinco principios

1. **El código de la persona nunca sale de su ordenador.** No hay ejecución en servidor. (Compilados como Rust, solo local con `CIFRA_RUST_LOCAL=1`; nunca en la web publicada.)
2. **Todo se ejecuta aislado y acotado.** Sin red, sin ficheros del equipo, con tiempo, memoria y salida limitados.
3. **Una ejecución que pasa límites se corta y se explica.** No queda colgada ni degrada la web.
4. **El resultado es siempre un `RunResult`** con `origen: "ejecucion-real"` y motor con versión. Nada más lleva ese sello.
5. **Lo que no se pudo ejecutar se dice.** `estado: "no-soportado"`. Nunca se simula una salida. Si `memoriaMBUsada` no es medible por el motor, queda ausente; no se simula un corte.

## Límites por defecto (fijos en UN fichero: `src/lib/ejecucion/limites.ts`)

| Límite | Valor | Al superarlo |
|---|---|---|
| Tiempo | 5 000 ms | estado `tiempo` |
| Memoria | 128 MB (solo donde hay lectura de heap) | estado `memoria` |
| Salida (stdout + stderr) | 64 KB | estado `salida-excedida` |
| Pasos de traza | 2 000 | marca `truncada: true` |
| Valor de variable en traza | 200 caracteres | recorte con `…` |

## aislamiento por motor

- **JS (Worker):** sin DOM. Bloquear antes de ejecutar `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts` y demás accesos a red. `console.log` → captura de salida. Corte por tiempo: terminar el Worker a la fuerza. Asincrónico no se cubre; si quedan callbacks pendientes, se dice.
- **Python (Pyodide):** Worker aparte, carga por CDN bajo demanda (avisa del tiempo de carga; cuenta dentro del tope de la primera ejecución). Lista de paquetes cerrada — biblioteca estándar, nada de `pip install`. Traza con `sys.settrace`.
- **Pruebas:** cada `TestSpec` corre en su propia corrida con sus propios límites; una en bucle infinito no tumba al resto. `visible: false` no revela entrada ni esperado antes de entregar. Comparación de resultados en un solo sitio (`sonIguales`), tolerancia numérica opcional.
- **Trazas:** alimentan la explicación (citan pasos con `comprobado-ejecucion`), nunca la sustituyen. No se instrumenta el anidamiento completo de llamadas.
- **Mediciones:** 2 de calentamiento descartadas + 10 válidas; mediana y MAD. Solo «más rápida» si la diferencia supera el doble del mayor MAD.

## En la práctica

- Nada de números sueltos por el código: todos los límites viven en `limites.ts`.
- Cualquier cambio aquí pasa por `cifra-porton-calidad` e incluye las pruebas de límites (bucle sin fin, memoria, salida enorme, traza truncada) reales, no simuladas.
