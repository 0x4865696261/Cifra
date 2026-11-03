---
name: cifra-accesibilidad-rendimiento
description: Revisión de accesibilidad y rendimiento de Cifra (principio 8, criterios de portón y 0.9 de NOVEDADES_AI.md). Usar antes de terminar cualquier interfaz o componente nuevo, y como checklist de revisión al pulir pantallas en la 0.9. Cubre contraste, teclado, lector de pantalla, reducir movimiento y rendimiento en móvil.
---

# Accesibilidad y rendimiento (cifra-accesibilidad-rendimiento)

Cifra se pula en la 0.9 con esto, pero cada pantalla se construye bien desde el principio.

## Accesibilidad

- **Contraste:** texto legible sobre su fondo (WCAG AA como suelo). Un gris claro sobre blanco decorativo no sirve para contenido real.
- **Teclado:** todo lo alcanzable con clic lo es con Tab + Enter/Espacio; el foco siempre visible (nunca `outline: none` sin sustituto). El orden de tabulación sigue el orden visual.
- **Lector de pantalla:** nombres accesibles en botones, enlaces y controles; **aria-label en español** (ver `cifra-i18n-es`); estados comunicados (nada de cambios solo visuales para acciones importantes).
- **Reducir movimiento:** `prefers-reduced-motion` lleva versión reducida de las animaciones, no un borrón total (detalle en `cifra-animacion`).
- **Formularios:** cada input con su etiqueta asociada; el error se anuncia y se explica, con aviso claro y envío bloqueado cuando toca (como los límites del estudio, 0.2.1).

## Rendimiento

- **Móvil primero en la comprobación:** viewport ~390×844. Sin desbordamiento horizontal; los toques son cómodos (objetivos de toque ≥ ~44px).
- **Consola limpia** en escritorio y móvil — es parte del portón y también señal de rendimiento (errores, peticiones fallidas, renders en bucle).
- **Animaciones a 60 fps:** solo `transform`/`opacity` (ver `cifra-animacion`); nada de animar propiedades que causan layout.
- **Carga:** el código pesado (Pyodide, por ejemplo) carga bajo demanda y avisando del tiempo, ya decidido en 0.3; no difundir nuevos cargas diferidas sin avisar en la interfaz.

## Checklist rápido de cierre de componente

1. ¿Contraste correcto?
2. ¿Navegable y operable con teclado, con foco visible?
3. ¿Nombres accesibles correctos y en español?
4. ¿Se ve bien y funciona en ~390×844 y en escritorio?
5. ¿Consola limpia?
6. ¿Las animaciones respetan reducir movimiento?
