# CIFRA Architecture

## Visión general
Cifra está construido como una aplicación web de aprendizaje técnico con una capa de presentación React, una capa de dominio TypeScript y un conjunto de servicios locales para análisis, ejecución y evaluación. La arquitectura principal busca dos cosas simultáneamente:

1. explicar el código con rigor pedagógico;
2. mantener veredictos basados en pruebas, ejecución real o reglas verificables.

## Capas principales

### 1. Presentación
- `src/routes/`: páginas de navegación y vistas del producto.
- `src/components/`: componentes reutilizables y UI esperada por la aplicación.
- `src/styles.css`: estilos globales y base visual.

### 2. Dominio y lógica funcional
- `src/lib/ai/`: diseño de prompts, adaptadores, parsing y validaciones del modelo.
- `src/lib/analyze/`: lectura y clasificación del código.
- `src/lib/retos/`: flujo de ejercicios y progreso del usuario.
- `src/lib/incidentes/`: análisis de paquetes de incidente y evaluación.
- `src/lib/ejecucion/`: ejecución aislada de código y mediciones.
- `src/lib/modulos/`: registro y organización de módulos del producto.
- `src/lib/content/`: contenido educativo y materiales compartidos.

### 3. Datos y persistencia
- `src/lib/app-data/`: estado local y datos del navegador.
- `src/lib/db.ts`: acceso a datos persistentes de la app.
- `migrations/`: esquema y cambios de base de datos.
- `src/lib/auth/`: autenticación y control de gates cuando aplica.

### 4. Automatización y validación
- `scripts/`: build, preview, portón de seguridad, migración, validación de brand y smoke QA.
- `src/lib/*/*.test.ts`: pruebas unitarias del sistema central.

## Relación entre módulos
- El flujo de estudio toma una pieza de código, la analiza y la convierte en una explicación con origen y nivel de confianza.
- Los retos usan la ejecución y las pruebas como veredicto, y la IA solo como apoyo explicativo.
- Los incidentes reutilizan la lógica de análisis y de evaluación, pero con un formato orientado a diagnóstico y corrección.
- La biblioteca y los módulos de matemáticas y lenguajes actúan como capa de contenido interconectado y de referencia pedagógica.

## Dependencias clave
- La capa de UI depende de la lógica del dominio, pero no debería acoplarse a detalles del modelo o de ejecución.
- La IA depende de adaptadores y parseos, no de rutas concretas ni de componentes.
- La ejecución depende de límites y trazabilidad; la evaluación la usa como fuente válida de veredicto.
- Los módulos se combinan a través de `src/lib/modulos` y de los contenidos enlazados desde las rutas.

## Acoplamientos importantes
- UI ↔ `src/lib/*`: fuerte y necesario; la app es principalmente un frontend reactivo.
- `retos` ↔ `ejecucion`: acoplamiento funcional central para el criterio de resultado.
- `incidentes` ↔ `ai`: la explicación y el diagnóstico se basan en formatos semiestructurados.
- `modulos` ↔ `routes`: los módulos se exponen de forma navegable por rutas.

## Principio de diseño
La arquitectura no pretende ser una monolítica de negocio; más bien es una colección de especialidades pedagógicas que comparten criterios y validaciones comunes. Por eso la documentacion modular y la seccion de historia están tan importantes: permiten que un agente entienda el sistema sin leer todo el repo.
