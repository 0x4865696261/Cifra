# Guía de trabajo para agentes de Cifra

## Objetivo principal
Cifra es una aplicación de aprendizaje técnico orientada a comprender código, debug, matemáticas, retos, incidentes y bibliotecas conceptuales. El trabajo del agente debe ser preciso, modular y basado en la documentación y el código relevantes.

## Orden de lectura obligatoria
1. Leer `CIFRA_AI.md`.
2. Releer el índice del módulo afectado en `docs/modules/README.md`.
3. Leer solo la documentación del área concreta antes de tocar código.
4. Localizar los archivos reales en `src/`.
5. Comprobar dependencias, pruebas y contratos antes de cambiar comportamiento.

## Reglas del repositorio
- No elimines funcionalidad existente sin una razón técnica clara.
- No inventes módulos, modelos ni dependencias nuevas si ya existe una solución equivalente.
- No toques contenido de skills ni documentación ajena salvo la afectada por el cambio.
- No hagas una reestructuración grande ni una refactorización sin un objetivo claro.
- Mantén compatibilidad con la arquitectura actual.
- Preserva la documentación histórica; no la destruyas, solo la reordenas y contextualizas.

## Flujo de trabajo recomendado
1. Identificar el módulo relacionado con la tarea.
2. Leer exclusivamente su documentación y los archivos del módulo.
3. Comprobar si la tarea afecta a rutas, contenido, lógica o ejecución.
4. Implementar solo lo indispensable.
5. Actualizar la documentación del área si el cambio afecta a la API, flujo o comportamiento visible.
6. Ejecutar las comprobaciones relevantes y dejar el repositorio en un estado consistente.

## Mapa de navegación rápido
- Documentación central: `CIFRA_AI.md`, `CIFRA_ARCHITECTURE.md`, `CIFRA_ROADMAP.md`
- Índice de módulos: `docs/modules/README.md`
- Historial estructurado: `docs/history/README.md`
- Historial legado: `NOVEDADES.md`, `NOVEDADES_AI.md`

## Regla de cierre
La tarea no está terminada si no se ha dejado una documentación mínima actualizada y se ha verificado que el cambio no rompe el comportamiento esperado del módulo.
