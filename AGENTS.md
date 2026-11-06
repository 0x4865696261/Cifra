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

6. **Brand-asset pass** — a subagent, never waited for. When the app needs its share card or identity, dispatch the brand-asset pass as a `task` subagent and keep building. While the pass keeps `/workspace/.grok/og-pending` fresh, brand checks say nothing about the card: in flight is not a finding. The marker goes stale after 10 minutes, so a very long pass lets the warning through — but a brand warning while it runs is never a cue to redo its work. No `wait_tasks`, and never `get_task_output` on the brand task: reading a task's output consumes it, and a consumed task sends no completion notification, so the result — a failure included — would reach nobody. Answer as soon as the app renders; the pass wakes you later with one short sentence at most asking for a republish.

7. **Verify before closing** — run the relevant tests and checks for the module, confirm the UI renders correctly, and make sure the change does not break expected behavior.
debes leer novedades.md 
para hacer la version indicada 
Debes Leer Novedades_Ai.md