# CIFRA Roadmap

## Estado actual (0.7)
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

## 0.8 — Validación y endurecimiento
- Descripción: cerrar más pruebas de integración, validación de ejecución y reglas de seguridad defensiva.
- Prioridad: alta
- Estado: planificado
- Dependencias: `src/lib/ejecucion`, `src/lib/ai`, `src/lib/retos`, `src/lib/incidentes`
- Módulos afectados: ejecución, IA, material docente, retos y incidentes
- Criterio de finalización: pruebas automáticas cubriendo decisiones clave y flujo de veredicto sin ambigüedad

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
