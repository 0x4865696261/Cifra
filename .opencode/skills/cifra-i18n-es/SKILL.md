---
name: cifra-i18n-es
description: Todos los textos visibles de Cifra están en español. Usar al escribir o modificar CUALQUIER texto de interfaz, componentes, pantallas, mensajes de error, tooltips, placeholders y aria-label, y al añadirlos o revisarlos en el fichero de traducciones es.json. El diseño no cambia: solo los textos, y hay que comprobar que textos más largos no rompen botones.
---

# Español en todo (cifra-i18n-es)

Cifra es una web en español. Todo lo que ve la persona se escribe en español y de forma cuidadosa.

## Regla base

- **Todos los textos visibles van en español** y, en la medida de lo posible, **sacados a un único fichero `es.json`** de traducciones (no cadenas dispersas por los componentes). Antes de añadir una cadena nueva, mira si ya existe algo equivalente en `es.json` y reutilízala.
- Cobertura completa: títulos, párrafos, botones, *placeholders* de inputs, mensajes de error tanto del código local como los traducidos del proveedor (401/403, 429, 5xx, tiempo agotado, contenido bloqueado, respuesta inesperada), *tooltips*, y **aria-label** y texto accesible — lo que oye un lector de pantalla también es texto visible.
- Nombres reservados que NO se traducen: nombres de campo del contrato (ej. `lineasNombradas`), identificadores de código, comandos, rutas, nombres de lenguajes/técnicos cuando sean el término correcto (jsDelivr, WebAssembly).

## Tono

- Explica, no regala. Frases directas, sin florituras ni jerga sin definir. Un error mensaje debe decir qué pasó, qué se esperaba y qué llegó (estilo 0.8).
- Coherente con los textos ya existentes: mismos términos para lo mismo (p. ej. «veredicto», «entrega», «estudia el fallo»), revisando pantallas similares antes de escribir.

## Al terminar un texto

1. Cadenas en `es.json`, no en el componente.
2. El diseño NO cambia: ni colores, ni tamaños, ni estructura — solo textos.
3. **Prueba el desbordamiento:** los textos en español son a menudo más largos que los borradores. Comprueba en escritorio y móvil (~390px) que los textos más largos no rompen botones, no se parten mal ni desalinean tarjetas (captura con Playwright para casos dudosos).
4. Pasa el `cifra-porton-calidad` (consola limpia incluida).
