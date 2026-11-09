---
name: cifra-diseno-y-movimiento
description: Cómo aplicar el sistema visual propio de Cifra (identidad, tipografía, espaciado, animaciones fluidas) cumpliendo accesibilidad y rendimiento, sin copiar interfaces de otros, y cómo verificar consola limpia en escritorio y móvil. Úsala al crear o tocar pantallas, y en 0.4.F y 0.9.
---

## Para qué sirve

Instalar el principio 8 del apartado 3 (diseño propio, animaciones suaves al nivel
de las mejores páginas de producto) como reglas verificables, no como gusto.

## Cuándo usarla y cuándo no

- Sí: al crear o modificar cualquier pantalla, componente o animación; en la
  primera versión del sistema visual (0.4.F) y en el pulido final (0.9).
- No: en tareas sin superficie visual (contratos, git, contenido de textos).

## Antes de empezar

1. Lee `NOVEDADES_AI.md`: apartado 3 (principio 8), apartado 0.4.F (primera
   versión del sistema visual) y apartado 0.9 (pulido y movimiento).
2. Lee `src/styles.css` y los componentes `src/components/ui/*` existentes:
   reutiliza tokens, no inventes paralelos.
3. Si ya existe un sistema visual (desde 0.4), respétalo; no lo reinventes por
   tarea.

## Pasos

1. Usa los tokens del sistema (paleta, tipografía, espaciado) en vez de valores
   sueltos. Los valores responden a una decisión anotada, no al día.
2. Tipografía: jerarquía con pocas tallas; el cuerpo se lee cómodo en pantallas
   grandes y en móvil (una línea de texto no desborda ni se alarga a 120 caracteres).
3. Animaciones: solo si ayudan a entender (transición, orden, foco). Duraciones
   cortas y en la misma escala en toda la web; nada de adiciones decorativas que
   retrasen el contenido.
4. Respeta `prefers-reduced-motion`: con el sistema pidiendo menos movimiento, se
   quita o se minimiza la animación; nunca se ignora.
5. Móvil primero en la comprobación: sin desborde horizontal a ~390 px, áreas de
   toque generosas y sin punto ciego en gestos.
6. Accesibilidad: contraste suficiente, navegación completa por teclado, lectores
   de pantalla que reciben nombres y estados (botón «Ejecutar», resultados,
   veredicto), y el foco visible.
7. Verifica el render: consola limpia en escritorio y móvil (parte del portón,
   apartado 6.4). El proyecto trae `scripts/browser-smoke.mjs`; usa ese veredicto y
   guarda las capturas en `screenshots/`.
8. Las animaciones no tapan contenido ni frenan el uso: con la animación desactivada
   la pantalla sigue siendo completa y utilizable.

## Reglas

- Identidad propia: ninguna pantalla imita el logo, la tipografía o los patrones
  característicos de otra plataforma.
- Cada pantalla nueva pasa consola limpia en escritorio y móvil (criterio de la 0.1,
  ya común a todas las versiones).
- La animación es un medio: si no ayuda a leer, entender o encontrar algo, sobra.

## Qué NO hacer

- No copies interfaces, iconos ni texturas de Apple/Linear/Vercel «porque quedan bien».
- No uses `setTimeout` para disparar animaciones de contenido: retrasan lo que
  importa.
- No añadas librerías de animación sin justificar dependencia (regla 6 del
  apartado 0) y sin medir su coste en móvil.
- No cambies el sistema visual según tarea: los retoques se proponen y se anotan.

## Lista de comprobación final

- [ ] Solo se usan tokens; cualquier valor nuevo tiene decisión anotada.
- [ ] `prefers-reduced-motion` respetado en cada animación nueva.
- [ ] Contraste, teclado y lector de pantalla revisados en lo tocado.
- [ ] A ~390 px de ancho sin desborde ni tapar contenido.
- [ ] Consola limpia en escritorio y móvil, con capturas en `screenshots/`.
- [ ] Con contenido en verde: la interfaz funciona con animaciones desactivadas.

## Ejemplo breve

- Bien: la entrada con dos planes (0.4) recibe la animación de la elección de plan
  con duración corta, salta con `prefers-reduced-motion: reduce` y deja la pantalla
  útil sin animación.
- Mal: poner un «fade de bienvenida» de 2 segundos que tapa el botón de empezar
  mientras corre.