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

## Comprueba (0.8)

La pestaña Comprueba analiza programas del lenguaje Cifra en el navegador. Usa la sintaxis de TypeScript con un conjunto acotado de tipos básicos, listas, funciones con firmas explícitas y condiciones. Devuelve regla, mensaje, línea, columna y concepto de biblioteca. Los diagnósticos se pueden abrir en Estudia el fallo. La práctica de tipos se enlaza desde Retos, donde cada reto ejecutable conserva su veredicto basado en pruebas.

## Editor y ejecución

El acceso Ejecutar código abre directamente el editor de Estudio. Los ejemplos de JavaScript y Python pueden editarse y ejecutarse en el navegador desde la propia página. Los ejemplos de Rust se pueden editar y copiar, y enlazan a Rust Playground para la ejecución.

## Limitaciones conocidas
- El análisis sigue siendo dependiente del formato del código y del contexto que se aporta.
- La claridad pedagógica requiere que cada respuesta explique su origen.
