---
name: cifra-editor-codigo
description: Sustituir progresivamente el cuadro de texto plano del estudio y del reto por un editor de código real (CodeMirror 6 por defecto). Usar al tocar los componentes de edición de código (src/components/studio/, src/components/retos/), al conectar el editor con el ejecutor, o antes de decidir añadir la dependencia de editor.
---

# Editor de código real (cifra-editor-codigo)

Cifra enseña a leer código: editar código en un cuadro de texto plano es lo que no corresponde. Objetivo: un editor real, en el mismo sitio, sin cambiar el diseño alrededor.

## Reglas

1. **CodeMirror 6 por defecto** (`@codemirror/*`, `@uiw/react-codemirror` como envoltorio React si hace falta). No montar un editor desde cero.
2. **Mismo contenedor, misma posición:** el editor sustituye al textarea en el lugar que ya ocupa (estudio y pantalla de reto). No se reordena la página ni se rediseña alrededor.
3. **Tema con los colores actuales:** el tema del editor usa la paleta que ya existe en el proyecto (tokens actuales: fondo, texto, acento cobre para resaltados como la marca de variables en la traza). Nada de un tema importado que pinte con sus colores.
4. **Conectado al ejecutor:** el contenido del editor es lo que llega a `RunRequest.codigo` (contrato 4.4) y al envío del reto; la numeración de líneas del editor coincide con los `lineasNombradas` del `FailureReport` (misma numeración 1-based).
5. **Límites de entrada intactos:** 20 000 caracteres de código con aviso en la interfaz y envío bloqueado hasta que quepa. El editor muestra el aviso, no lo silencia.

## Dependencia

- Antes de añadir la dependencia, justifícala en una línea en el commit (regla 6): qué resuelve y por qué no basta lo que hay.
- No añadir plugins de más: lo básico (resaltado del lenguaje, números de línea, plegado opcional y historial propio interno) está bien; nada de autocompletado con IA ni extensiones decorativas.

## Portón

- Al terminar: typecheck, pruebas y build en verdes; pantallas con consola limpia en escritorio y móvil (`cifra-porton-calidad`).
- Prueba real en navegador: escribir código con fallo en el editor, ejecutar, y comprobar que el mensaje señala la línea correcta en el editor.
- El diseño NO cambia (ver `cifra-i18n-es` para la regla equivalente en textos).
