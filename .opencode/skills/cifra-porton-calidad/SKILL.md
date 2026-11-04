---
name: cifra-porton-calidad
description: Portón de calidad de Cifra (apartado 6 de NOVEDADES_AI.md). obligatorio antes de dar por terminada CUALQUIER tarea o versión. Comprueba typecheck, pruebas, build, consola limpia en escritorio y móvil, ausencia de claves o datos personales en logs, criterios de terminación y estado del documento NOVEDADES_AI.md. Usar justo antes de cerrar cualquier tarea.
---

# Portón de calidad de Cifra

Fuente: apartado 6 de `NOVEDADES_AI.md`. Una tarea o versión **no está terminada** hasta que pasa todo esto.

## Los siete pasos

1. **`typecheck` sin errores** (`npm run typecheck`).
2. **Todas las pruebas en verde** (`npm run test`; el script lista los ficheros uno a uno — cada fichero de prueba nuevo entra en el mismo commit que la funcionalidad).
3. **`build` correcto** (`npm run build`). El aviso no fatal de rolldown sobre `module level directive` se ignora a propósito.
4. **Cada pantalla con consola limpia en escritorio y en móvil.** Capturas reales; un aviso 200 de curl no es render. Ver screenshots en `screenshots/`.
5. **Ninguna clave ni dato personal en logs** (prueba automática; ver `cifra-privacidad-secretos`).
6. **Criterios de terminación de la versión** cumplidos: si alguno no se cumple, no está terminada y se declara.
7. **NOVEDADES_AI.md actualizado:** estado, contratos y decisiones tomadas.

## Prueba de render (paso 4 en la práctica)

- Playwright está en devDependencies. Scripts de humo existentes: `scripts/browser-smoke.mjs` (escritorio + móvil en una pasada).
- Se verifica que hay contenido visible y **cero errores no capturados de consola** (módulos, hidratación, runtime). Una página en blanco y una captura no son verificables.
- QA de interacción real: abrir, hacer scroll, hacer clic y comprobar estado.

## Regla dura

Si el portón no pasa, la tarea no se cierra. No se consuela con «casi»: se arregla, se registra en NOVEDADES_AI.md lo que falla, o se confiesa que no se puede cumplir el criterio (regla 9 de cifra-reglas-de-trabajo).
