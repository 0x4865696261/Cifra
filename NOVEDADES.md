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

## v2 — Depuración como método (publicada)

**Objetivo:** que un error deje de ser algo que la IA tapa. Estudio del fallo: qué falló, por qué
ocurrió, cómo se habría detectado antes y cómo reproducirlo. Con tu API o con cualquiera de las
IA más comunes.

**Qué se construyó:**

- Modo «Estudia el fallo» en el estudio: pegas el código y el mensaje del compilador o del runtime
  juntos; un análisis local lee el mensaje (líneas que nombra, identificadores entre comillas,
  tipo de error reconocido) y el fragmento queda numerado con las líneas señaladas marcadas.
- Skill de depuración fija en la guía: leer el mensaje, localizar el sitio, hipótesis ordenadas de
  la más barata a la más cara con cómo comprobar cada una, una entrada que falla hoy y otra que
  debería seguir funcionando mañana, y cómo el fallo habría saltado antes. No devuelve el código
  corregido a secas.
- Ajustes: elige proveedor y modelo propios — xAI (Grok), OpenAI, Anthropic (Claude), Google
  (Gemini) — y pega tu clave. La clave se guarda solo en el navegador y viaja con cada petición;
  el servidor la usa en esa llamada y no la guarda. Sin clave tuya, se usa la clave de plataforma
  si el servidor la trae.
- Hilo nuevo en la biblioteca: «Mensaje de error», junto a Compilador y Prueba.

**Criterio de terminación:** un fragmento con fallo y su mensaje producen una guía ordenada con
hipótesis verificables, no una versión corregida a secas. Publicada con typecheck, pruebas y build
en verde.

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
añadir un modelo no toca ninguna skill; los dos portones comparten el mismo criterio de paso.

## v6 — Problemas reales para resolver

**Objetivo:** que leer y depurar no se quede solo en ejemplos bonitos. La plataforma pone problemas
reales — con fallos plantados, requisitos incompletos y datos sucios — y la persona los ataca
tal como llegarían en el trabajo.

**Qué se construye:**

- Colección de problemas publicados: una situación, el código tal como está, un mensaje o un
  resultado que no cuadra, y una promesa que el programa debería cumplir. Cada problema vive con un
  fallo real, no con un guiño didáctico.
- La resolución no se corrige sola. La persona propone el análisis, ejecuta el estudio del fallo
  sobre el problema y compara su lectura con la guía; lo comprobado se separa de lo deducido, como
  siempre en Cifra.
- Problemas de aumento de dificultad y por familia del fallo: límites de colección, valores nulos,
  nombres que no existen, estados intermedios corruptos, diferencias entre lo que el mensaje dice y
  lo que ocurrió.
- Al resolver: queda registrado en el navegador qué se atacó y qué quedó sin volver a mirar; los
  problemas enlazan con los conceptos y los hilos de la biblioteca que sostienen su fallo.

**Criterio de terminación:** un problema se puede leer, atacar con el estudio del fallo y dejar
medio resuelto sin que nada falsifique el programa ni corone el intento.

## v7 — Un compilador que comprueba

**Objetivo:** un análisis que prometa algo. No ejecutar el código: comprobarlo, con las reglas que
un compilador real aplicaría antes de dejarlo pasar. La diferencia entre leer la forma y verificar
la forma.

**Qué se construye:**

- Lenguaje propio de Cifra, pequeño y deliberado: un subconjunto razonado de tipos, colecciones y
  funciones, con sus reglas en la mano y visibles; ningún detalle escondido en un estándar.
- Análisis completo (front-end de compilador): lexing, parsing y comprobaciones — nombres que no
  existen, tipos que no encajan, usos de un valor inexistente, ramas prometidas sin camino de
  vuelta — con mensajes pedagógicos: qué regla se detuvo, qué se esperaba y qué llegó, en el
  lenguaje de la plataforma.
- Integración con el estudio: el fallo de compilación entra por el mismo sitio que un error real,
  y la guía del fallo trabaja sobre él. La comparación con lenguajes reales aprende la lección de
  ahí, no de un ensayo.
- Retroalimentación con el puente matemático: si la regla violada es un invariante o una promesa
  del tipo, el mensaje enlaza al concepto que la sostiene.

**Criterio de terminación:** un programa inválido rechazado con un mensaje que enseña la regla y
su ubicación, y un programa válido aceptado sin promesas de más — sin ejecución, sin milagros.
