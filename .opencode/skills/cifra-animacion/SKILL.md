---
name: cifra-animacion
description: Mover la interfaz de Cifra con intención, fluida y a nivel de las mejores páginas de producto. Usar SIEMPRE antes de añadir o modificar cualquier animación, transición de pantalla, hover, entrada por scroll o movimiento del grafo de conceptos, y al terminar cualquier animación para verificarla (una animación no está hecha hasta verla funcionar).
---

# Animación en Cifra (cifra-animacion)

Referencia: principios 6 y 8 de `NOVEDADES_AI.md` — animaciones suaves con identidad propia, al nivel de las mejores páginas de producto (la sensación de las páginas de producto de Apple).

## Principios

- **Movimiento con intención:** cada animación comunica algo (jerarquía, cambio de estado, relación causa-efecto). Si no comunica, no existe.
- **Fluida y con identidad propia:** easing coherente, tiempos no genéricos. Nunca tapa contenido ni frena el uso.
- **Tokens en un único fichero:** duraciones, easings, distancias y retardos escalonados (stagger) definidos en un solo sitio y reutilizados. Nada de números sueltos por componente.
- **Sin dependencias nuevas sin justificación de una línea** (regla 6). El CSS الوar de Cifra ya cubre mucho; las librerías de skills (GSAP, etc.) son guía de diseño, no motivo para añadir paquetes.

## Qué animar

- Entrada de secciones al hacer scroll.
- Transiciones entre pantallas.
- Hover y foco de botones y tarjetas.
- Aparición del editor de código.
- Resultados de ejecución y veredictos (con la claridad de lo comprobado/deducido del resultado).
- Navegación del grafo de conceptos.

## Rendimiento

- **Solo `transform` y `opacity`.** Nada de animar `width`, `height`, `top/left` ni propiedades que paguen layout/paint.
- Evitar layout thrashing (sin lecturas/escrituras de layout interleavadas en cada fotograma).
- Objetivo **60 fps también en móvil**; compruébalo en viewport móvil (~390×844), no solo en escritorio.

## Accesibilidad

- Respetar `prefers-reduced-motion` **con una versión reducida, no eliminada**: se mantienen los cambios de estado (opacidad breve, sin desplazamientos largos), para que la interfaz siga comprensible.

## VERIFICACIÓN OBLIGATORIA (no negociable)

**Una animación no está hecha hasta verla funcionar.**

1. Abre la app en un navegador real (Playwright, que ya está en devDependencies) y haz scroll o dispara el estado.
2. Captura **varios fotogramas** y confirma que algo cambia entre ellos (visualmente, no con la imaginación).
3. Si nada se mueve, **antes de culpar al código**, comprueba si el sistema o el navegador tiene «reducir movimiento» activado (Windows: Accesibilidad > Efectos visuales > Efectos de animación; macOS: Accesibilidad > Pantalla > Reducir movimiento). Cifra lo respeta y eso hace que no se vea nada.
4. Si la causa es esa, **PROPÓN (sin implementarlo)** un interruptor en la app con tres posiciones: Animaciones automáticas / siempre / reducidas.
