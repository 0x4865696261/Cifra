# Retos — arquitectura

El flujo de reto se orienta a una evaluación real y no a la opinión del modelo.

1. El sistema entrega el enunciado y el código inicial.
2. El usuario resuelve o corrige el programa.
3. Se ejecuta en un entorno acotado.
4. Las pruebas estructuradas devuelven un veredicto.
5. La IA explica qué pasó y qué debería revisarse.

En la 1.0 el editor ofrece once lenguajes de algoritmos. Ejecutar comprueba los ejemplos de la variante. Enviar genera casos adicionales en servidor y es la única acción que puede aprobar el reto. SQL y HTML/CSS tienen retos propios. Los borradores se guardan localmente por reto y lenguaje. Las solicitudes autenticadas se evalúan en Vercel Sandbox. Consulta [el despliegue de Cifra 1.0](../../cifra-1.0-vercel.md).

Esta separación es esencial: el modelo no decide la validación del reto.
