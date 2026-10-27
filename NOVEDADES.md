# Novedades — qué trae cada versión

Cifra no se construye de una vez. Cada versión tiene un objetivo, un criterio de terminación y
decisiones que se toman antes de escribir código. Lo que no está aquí todavía no está en la web:
no se anuncia, no se deja un botón vacío.

## v1 — Leer un programa (publicada)

**Objetivo:** demostrar la idea central. Que exista una plataforma que explica código en vez de
generarlo, con explicaciones honestas (lo comprobado separado de lo deducido) y contenido
interconectado.

**Qué alcanza:**

- Estudio: analizador de texto local (sin IA), niveles de lectura, selección de líneas y tramos,
  pregunta libre, explicación del modelo con skills compuestas.
- Ocho skills escritas y componibles, con reglas de bloqueo por superficie (código y matemáticas).
- Puentes matemáticos (fórmula → significado → razonamiento → pseudocódigo → código) con
  experimentos de valores.
- Biblioteca con hilos conectados y ensayos de lenguajes con la comparación «mismo problema,
  distinta frase».
- Servidor frugal: una llamada al modelo por clic, validación, caché, límites por IP y global,
  clave solo en el servidor.

**Criterio de terminación:** typecheck, pruebas y build en verde; cada pantalla se renderiza con
consola limpia en escritorio y móvil.

## v2 — Depuración como método

**Objetivo:** que un error deje de ser algo que la IA tapa. Estudio del fallo: qué falló, por qué
ocurrió, cómo se habría detectado antes y cómo reproducirlo.

**Qué se construye:**

- Superficie nueva en el estudio: pegas el error del compilador o del runtime junto al código; una
  skill de depuración conduce el análisis por pasos (leer el mensaje, localizar la línea, plantear
  hipótesis, proponer la entrada mínima que reproduce el fallo).
- Sección de biblioteca sobre leer mensajes de compilador y de runtime en varios lenguajes.
- La explicación ordeal propón una prueba concretatable: entrada que falla hoy y entrada que
  debería seguir funcionando mañana.

**Criterio de terminación:** un fragmento con fallo y su mensaje producen una guía ordenada con
hipótesis verificables, no una versión corregida a secas.

## v3 — Ejecutar con seguridad

**Objetivo:** pasar de leer el texto a ver el programa correr, sin mentir sobre lo que se ejecuta.

**Qué se construye:**

- Entorno de ejecución aislado (primero WebAssembly para JavaScript y Python, con límites de tiempo
  y memoria acotados; más adelante contenedores efímeros para lenguajes compilados).
- Trazas paso a paso del estado de las variables, integradas en el estudio; la explicación marca
  ahora con total claridad qué se obtuvo de una ejecución real.
- Comparación de mediciones: versión original frente a versión optimizada, con la diferencia real.

**Criterio de terminación:** ningún código del usuario toca el servidor en claro; una ejecución
lenta o enorme no degrada la plataforma; las trazas alimentan la explicación en lugar de sustituirla.

## v4 — La red de conocimiento, completa

**Objetivo:** que la biblioteca sea de verdad una red: cualquier concepto se alcanza y se conecta
con los que lo sostienen.

**Qué se construye:**

-grafo de conceptos explícito (adelante, atrás y paralelo), no listas; cada puente matemático se
  enlaza con el concepto de algoritmo y de lenguaje que lo hace código.
- Comparador de lenguajes como herramienta propia: el mismo problema en los lenguajes soportados,
  con un ensayo de por qué la traducción literal falla en cada caso (propiedad y préstamos, tipos,
  punteros y duración de objetos, concurrencia).
- Nuevos hilos: arquitectura de software, sistemas distribuidos, bases de datos, redes, seguridad
  defensiva ampliada, pruebas.
- Itinerarios con progreso recordado en el navegador, conceptos marcados como difíciles y
  recomendación de contenido en función del recorrido.

**Criterio de terminación:** desde cualquier concepto se puede llegar a otro en dos clics sin
voltio buscadores externos; los itinerarios respetan quién empieza de cero y quién ya sabe.

## v5 — Plataforma modular

**Objetivo:** que el crecimiento no requiera rehacer. Nuevos lenguajes, modelos, skills, analizadores
y entornos de ejecución se incorporan como módulos, no como parches.

**Qué se construye:**

- Registro común de módulos: un lenguaje se añade con su analizador, sus notas y sus ensayos sin
  editar la plataforma.
- Multi-modelo: el prompt del estudio construye el pedido desde el plan respuesta, y cada modelo
  tiene su adaptador; añadir uno es un módulo.
- Cuentas opcionales para el progreso entre dispositivos, con migraciones propias y datos mínimos;
  sin cuentas, todo sigue en el navegador.
- Pruebas de seguridad y de coste como parte del portón de calidad del proyecto.

**Criterio de terminación:** añadir un lenguaje completo no toca ningún componente de interfaz;
añadir un modelo no toca ninguna skill; los dos portones comparten el mismo criterio de pas.
