# Estudio

## Responsabilidad
El módulo de estudio es la capa de explicación y comprensión del código: toma un fragmento, lo analiza, distingue qué está escrito y qué se infiere, y facilita la narrativa pedagógica.

## Archivos principales
- `src/routes/estudio.tsx`
- `src/lib/analyze/`
- `src/lib/reading.ts`
- `src/lib/skills/`

## Relación con otros módulos
- Reutiliza la lógica de análisis local y de procedencia.
- Alimenta la explicación que luego usan retos y incidentes.
- Se apoya en contenido de biblioteca y en la IA con promps limitados.

## Estado
- Funcional como eje principal del producto.
- La evolución central es la mejora de trazabilidad y de separación entre comprobado/inferido/opinión.

## Limitaciones conocidas
- El análisis sigue siendo dependiente del formato del código y del contexto que se aporta.
- La claridad pedagógica requiere que cada respuesta explique su origen.
