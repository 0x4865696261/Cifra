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

## Estado
- Base funcional con pruebas para semilla, integridad y progreso.
- La evolución principal es reforzar la validación del criterio de superación y de la integridad del reto.
