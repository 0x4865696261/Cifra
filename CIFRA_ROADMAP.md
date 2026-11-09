# CIFRA Roadmap

## Estado actual (0.8.3)
- Estado: funcional y consolidado en la parte de navegación documental y red de conocimiento.
- Base consolidada en estudio, retos, incidentes, matemática, biblioteca, módulos y ejecución segura.
- La prioridad actual es cerrar validación, endurecimiento y preparación para la 1.0.

## 0.7 — Red de conocimiento
- Descripción: unificar documentación, módulos y reglas operativas para que cualquier agente encuentre la información precisa rápidamente y la biblioteca funcione como red de conceptos.
- Prioridad: alta
- Estado: completa
- Dependencias: `NOVEDADES_AI.md`, `NOVEDADES.md`, `src/lib/modulos`, `src/routes`, `src/lib/content`
- Módulos afectados: documentación, IA, módulos, biblioteca y navegación
- Criterio de finalización: docs centralizadas, módulo index funcional, rutas de navegación consistentes y la biblioteca como red de conceptos con conexiones explícitas

## 0.8 — Un compilador que comprueba
- Comprobación local del lenguaje Cifra con diagnósticos pedagógicos, desde Estudio y Retos.
- Prioridad: alta
- Estado: completa y validada localmente.
- Dependencias: Estudio, Retos y Biblioteca.
- Criterio de finalización: acepta programas válidos, ubica y explica los errores de los inválidos, y lleva el diagnóstico a Estudia el fallo.

## 0.8.1 — Editor de código para ejercicios y retos reales

- Estado: implementada. El reto Pedidos de una tienda estrena el editor multiarchivo y las entregas con pruebas locales.
- Editor integrado con árbol de carpetas, pestañas y búsqueda de archivos.
- Borradores locales por reto. Cambiar de archivo o recargar conserva los cambios.
- Resaltado por lenguaje, números de línea, atajos y acceso al archivo y línea de un diagnóstico.
- Temas claro, oscuro y de alto contraste, con tamaño de letra configurable.
- Primer reto realista con dos archivos que editar. Sus pruebas usarán el ejecutor aislado con límites y un contrato de entrega para proyectos multiarchivo.
- Criterio de finalización: resolver el reto editando ambos archivos, recuperar el borrador tras recargar, cambiar de tema y obtener un veredicto de las pruebas.

## 0.8.2 — Portal de tutoriales

La portada reúne accesos, itinerarios y temas con la navegación editorial de la referencia visual. Biblioteca sirve el artículo y el ejemplo desde el servidor. El editor avanzado se carga por separado y el ejemplo se puede seguir leyendo y editando con el editor básico si falla esa carga. El progreso local es opcional para la lectura.

## 0.8.3 — Animaciones y detalles de interacción

La portada incorpora entradas escalonadas y realce de tarjetas con ratón y teclado. Biblioteca muestra el avance de lectura y el editor distingue la ejecución en curso. Las animaciones respetan la preferencia de movimiento reducido.

## 0.9 — Pulido y robustez
- Descripción: mejorar UX, rendimiento, claridad y consistencia visual antes del primer lanzamiento público.
- Prioridad: media-alta
- Estado: planificado
- Dependencias: UI, bibliotecas, contenido y modelos
- Módulos afectados: rutas, estilos, documentación y módulos de aprendizaje
- Criterio de finalización: experiencia coherente en escritorio y móvil, sin errores de render y con narrativa clara

## 1.0 — Lanzamiento público
- Descripción: primer despliegue público con la promesa pedagógica establecida.
- Prioridad: crítica
- Estado: no iniciada
- Dependencias: 0.7–0.9, validación, seguridad y preparación operativa
- Módulos afectados: toda la app
- Criterio de finalización: lanzamiento consistente, pruebas de flujo cubiertas y documentación final verificada

## Post-1.0 — evolución
- Descripción: expansión de módulos y profundidad del contenido, sin perder la política de explicación honesta.
- Prioridad: media
- Estado: propuesta
- Dependencias: evolución del contenido y mejora de la pedagogía
- Módulos afectados: biblioteca, lenguajes, matemáticas y retos
- Criterio de finalización: nueva capacidad documentada y validada sin romper la base existente

## 2.0 — visión de largo plazo
- Descripción: Cifra como plataforma de enseñanza técnica con un sistema de conocimiento más amplio, más automatizado y más traceable.
- Prioridad: media
- Estado: visión de largo plazo
- Dependencias: evolución del modelo educativo, calidad y escalabilidad
- Módulos afectados: IA, contenido, infraestructura y herramientas de revisión
- Criterio de finalización: arquitectura sostenible, accesible y ampliable para más niveles, lenguajes y áreas de conocimiento

## Separación entre propuesta y compromiso
- Los elementos de este roadmap se clasifican por Estado.
- Las ideas aún no aprobadas aparecen como propuestas o visión futura, no como entregas cerradas.
- Las decisiones reales del producto siguen estando registradas en `NOVEDADES.md` y `NOVEDADES_AI.md`.
