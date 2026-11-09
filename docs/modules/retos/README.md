# Retos

## Responsabilidad
Este módulo gestiona la progresión académica del usuario: enunciados, semilla, pruebas, veredicto, integridad y nivel alcanzado.

## Archivos principales
- `src/routes/retos.*`
- `src/lib/retos/`
- `src/lib/ejecucion/`

## Relación con otros módulos
- Los retos dependen de la ejecución para validar resultados.
- La IA explica el resultado, pero el veredicto sale del entorno de pruebas.
- El módulo conecta progresión con contenido y bibliotecas conceptuales.

## Proyecto multiarchivo (0.8.1)

En Retos → Pedidos de una tienda, `src/pedido.js` calcula el total y `src/envio.js` calcula la tarifa. El editor ofrece árbol de archivos, pestañas, búsqueda, temas y borrador local. El ejecutor reutiliza las pruebas de JavaScript con un programa por caso y resuelve los módulos CommonJS relativos dentro del Worker. Cada resultado conserva el veredicto y la salida del ejecutor.

## Espacio de trabajo

En escritorio, el enunciado ocupa una mitad y el editor la otra. En móvil, el enlace Saltar al editor lleva directamente al código. Los retos de un archivo y los proyectos usan CodeMirror, con resaltado, numeración, búsqueda, historial, pantalla completa y ejecución desde la barra del editor o con Ctrl/⌘ + Intro. El veredicto permanece a la vista al ejecutar en pantalla completa. La tipografía del sistema cubre los caracteres del español y las transiciones respetan la preferencia de movimiento reducido.

## Estado
- Base funcional con pruebas para semilla, integridad y progreso.
- La evolución principal es reforzar la validación del criterio de superación y de la integridad del reto.
