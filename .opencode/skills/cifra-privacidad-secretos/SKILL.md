---
name: cifra-privacidad-secretos
description: Privacidad por defecto y gestión de secretos de Cifra (principios 6-7 y reglas 6-7 de NOVEDADES_AI.md, y 0.2.D). Úsalo al tocar cualquier parte que maneje claves de API, logs, peticiones al modelo, caché o contenido de usuario, y antes de añadir cualquier registro (log) nuevo. También aplica a los paquetes de incidente (0.5): ningún secreto real.
---

# Privacidad y secretos

Fuente: reglas 6-7 del apartado 0, principios 6-7 y apartado 0.2.D de `NOVEDADES_AI.md`.

## Claves de API

- **Nunca en ficheros del repositorio, nunca en la consola, nunca en registros** — ni siquiera parcialmente. Aplica a claves propias, del servidor y del proveedor.
- Hay una **prueba automática** en el portón de calidad: la clave no aparece en ningún log ni en el cuerpo de ninguna respuesta (0.2, prueba «la clave de API no aparece en logs ni respuestas»).
- En Cifra (modelo 0.2.D): **la clave se guarda solo en el navegador** y viaja con cada petición; el servidor la usa en esa llamada y no la guarda, no la devuelve y no la escribe en logs.
- Sin clave propia, solo la de plataforma si el servidor la trae; si no, se dice con claridad qué falta. Nada silencioso.
- Mientras Cifra es local (hasta 1.0), la clave de plataforma es la del propio desarrollador y no se sirve a otros.
- Detalles de transporte: la clave de Google dejó de viajar en la query (0.2.1); no reintroducir patrones parecidos.

## Datos del usuario

- **El código y los datos de la persona se quedan en su ordenador.** Nada de ejecución del usuario en servidor. El progreso vive en el navegador, con export/import.
- El servidor guarda lo mínimo y nunca claves. Local antes que remoto: lo que pueda correr en el navegador o en la máquina, no pasa por el servidor.
- El código del usuario es MATERIAL A ANALIZAR para la IA, nunca sale de su máquina y nunca alimenta nada más allá de la explicación pedida.

## Paquetes de incidente (0.5)

- Todo inventado pero realista. **Ningún paquete contiene credenciales reales, direcciones reales ni código de explotación funcional** (comprobación automática de patrones — prueba existente).
- Los «secretos expuestos» de un paquete son cadenas sintéticas creadas para el reto.

## Al añadir cualquier log

Pásalo por este filtro antes de terminar: ¿puede contener una clave (completa o parcial), un token, un fragmento de código de usuario o un dato personal? Si la respuesta es sí o «quizá», no se registra, se recorta, o se ofusca — y se añade caso a la prueba del portón.
