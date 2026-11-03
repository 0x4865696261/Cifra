---
name: cifra-contratos-datos
description: Contratos de datos de Cifra (apartado 4 de NOVEDADES_AI.md) y regla de cambio único. Comparten varias versiones. Usar SIEMPRE antes de tocar los tipos de Procedencia/Afirmacion, FailureReport, ModelAdapter, RunRequest/RunResult/TestSpec/TraceStep, ChallengeSpec o IncidentSpec, y antes de cualquier refactor de src/lib que los mueva o renombre.
---

# Contratos de datos de Cifra

Fuente: apartado 4 de `NOVEDADES_AI.md`. Están escritos como tipos TypeScript en el proyecto (el que pasa `typecheck`) y comparten todas las versiones.

## La regla única

**Si un contrato cambia, cambia en un solo lugar.** Después: se actualizan TODOS sus usos y se anota el cambio en NOVEDADES_AI.md. Nunca una modificación parcial en varios ficheros ni duplicados divergentes.

Los seis contratos:

1. **4.1 `Procedencia` / `Afirmacion`** — procedencia de toda afirmación: `comprobado-ejecucion`, `comprobado-regla`, `deducido`, `opinion` (ver `cifra-comprobado-deducido-opinion`).
2. **4.2 `FailureReport`** — informe del fallo (0.2): mensaje (crudo, tipo de la tabla de errores, `lineasNombradas`, `identificadoresCitados`), fragmento numerado con `marcada`, y `guia` del modelo validada. Signature local: `src/lib/analyze/`.
3. **4.3 `ModelAdapter`** — adaptador por proveedor (0.2): `construirPeticion(plan, opciones)`, `leerRespuesta`, `traducirError`. Ninguna skill menciona a un proveedor.
4. **4.4 `RunRequest` / `RunResult` / `Limites` / `TestSpec` / `TraceStep`** — ejecución aislada (0.3). `RunResult` lleva siempre `origen: "ejecucion-real"`. Ficheros: `src/lib/ejecucion/tipos.ts` y `limites.ts` (límites en un único fichero).
5. **4.5 `ChallengeSpec`** — reto de fundamentos (0.4): familia, nivel 1-10, `generador` con semilla `"por-persona"`, `pruebas`, `conceptos`, `preguntasDefensa`.
6. **4.6 `IncidentSpec`** — paquete de incidente (0.5): `ficheros` (sistema de ficheros virtual), `respuestaEsperada` con evidencia como `ruta:cadena`, `familia`, nivel 1-10.

## Antes de tocar uno

1. Localiza el sitio exacto donde ya vive el tipo (lee el fichero entero primero).
2. Cambia SOLO ese sitio; propaga a todos los usos en el mismo commit.
3. Comprueba que nada queda sin usar ni duplicado (busca el nombre del tipo en todo `src/`).
4. Registra el cambio en NOVEDADES_AI.md (apartado 4 o nota de la versión).
5. Pasa el `cifra-porton-calidad`.
