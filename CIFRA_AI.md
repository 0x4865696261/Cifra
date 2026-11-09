# CIFRA AI

Cifra es una plataforma web para aprender a programar entendiendo el código, no solo generándolo. La idea central es separar lo comprobado de lo inferido, y usar la IA como apoyo pedagógico, no como sustituto del criterio técnico.

## Estado actual

- Estado: comprobador estático implementado y validado localmente.
- Alcance principal: estudio de código, retos, biblioteca, matemáticas, lenguajes, incidentes, documentación modular y flujo de evaluación local.

## Tecnologías principales
- TypeScript
- React 19
- TanStack Start / Router
- Vite
- Tailwind v4
- xAI como proveedor de modelos en el servidor
- Ejecución aislada local para JavaScript, Python y Rust
- Pruebas automatizadas con Node test runner

## Arquitectura general
- `src/routes/`: capas de navegación y vistas.
- `src/components/`: UI reutilizable y contenedores.
- `src/lib/`: dominio funcional del producto: IA, análisis, retos, incidentes, ejecución, módulos y contenido.
- `scripts/`: automatización, validaciones, preview, migraciones y portones de seguridad.
- `migrations/`: esquema de datos persistentes.
- `public/`: assets estáticos y branding.
- `screenshots/`: referencia visual del estado del proyecto.

## Índice de módulos
- Estudio: `src/routes/estudio.tsx`, `src/lib/analyze`, `src/lib/reading.ts`
- Retos: `src/routes/retos.*`, `src/lib/retos`
- Incidentes: `src/routes/incidentes.*`, `src/lib/incidentes`
- Biblioteca: `src/routes/biblioteca.*`, `src/lib/content`
- Matemáticas: `src/routes/matematicas.*`, `src/lib/content`, `src/lib/modulos`
- Lenguajes: `src/routes/lenguajes.tsx`, `src/lib/modulos/lenguajes`
- IA y políticas: `src/lib/ai` y `src/lib/skills`
- Ejecución segura: `src/lib/ejecucion`
- Datos y autenticación: `src/lib/app-data`, `src/lib/auth`, `src/lib/db.ts`
- Registros y módulos: `src/lib/modulos`

## Mapas y documentación central
- Documentación histórica: `NOVEDADES.md`, `NOVEDADES_AI.md`
- Arquitectura: `CIFRA_ARCHITECTURE.md`
- Hoja de ruta: `CIFRA_ROADMAP.md`
- Documentación modular: `docs/modules/README.md`
- Historial estructurado: `docs/history/README.md`

## Estado general del desarrollo
- La base del producto está construida y la funcionalidad principal está en marcha.
- La prioridad actual es reducir la carga cognitiva de los agentes y organizar la documentación para que la navegación sea más eficiente.
- No se asume que cada nueva funcionalidad esté ya aprobada: se diferencia entre hecho, en curso y propuesta.

## Roadmap principal
- 0.7: red de conocimiento, navegación documental y módulos centralizados.
- 0.8: comprobador estático del lenguaje Cifra en Estudio y Retos.

- 0.9: endurecer la experiencia, limpieza y calidad.
- 1.0: lanzamiento público.

## Cómo localizar información adicional
1. Leer primero `CIFRA_AI.md` y la sección relevante de `docs/modules/README.md`.
2. Mirar el módulo concreto y la documentación del área afectada.
3. Reforzar con el código real en `src/` y solo después tocar dependencias.
4. Mantener los documentos históricos como referencia, no como fuente de diseño actual.
