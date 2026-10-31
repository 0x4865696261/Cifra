# Novedades — qué trae cada versión

Cifra enseña a programar para entender el código, también el que escribe una IA, y a leer la
arquitectura de un sistema. Va desde cero hasta nivel experto. No se construye de una vez: cada
versión tiene un objetivo, un criterio de terminación y decisiones que se toman antes de escribir
código. Lo que no está aquí todavía no está en la web: no se anuncia, no se deja un botón vacío.

## Cómo se numera

- Todas las versiones son **0.x**. Hasta la **1.0**, Cifra funciona **en el ordenador de quien la
  desarrolla** (local, sin despliegue público). Nada del código de nadie sale de esa máquina.
- La **1.0** es el primer lanzamiento público. Antes de ella no hay cuentas, ni ranking, ni servidor
  expuesto.
- Equivalencias con la numeración anterior: v1 → 0.1, v2 → 0.2, y las demás se reordenan y se
  ajustan abajo.

## Principios que atraviesan todas las versiones

1. **Lo comprobado, separado de lo deducido.** Un veredicto sale de una ejecución o de una regla
   verificable. Una opinión de la IA se marca como opinión.
2. **Explicar, no regalar.** Cifra no devuelve el código corregido a secas.
3. **Dos caminos, un mismo método.** Fundamentos (nada de copiar) y profesional (todo vale, también
   la IA).
4. **Material sintético.** Ningún reto toca sistemas reales ni ajenos. Todo lo que se analiza se
   inventa o se construye para la plataforma.
5. **Defensivo primero.** Los retos de seguridad enseñan a detectar, entender y corregir; no a
   atacar.
6. **Diseño propio.** Una web moderna, con identidad, tipografía cuidada y animaciones suaves al
   nivel de las mejores (la referencia es la sensación de las páginas de producto de Apple). Se
   empieza a diseñar desde la 0.3 y se pule en la 0.9. Las animaciones respetan «reducir movimiento»
   del sistema y no tapan el contenido.
7. **La IA de la web se defiende en capas.** Los prompts de sistema son una capa, no la defensa
   entera (ver «Defensas de la IA» al final).

## 0.1 — Leer un programa (hecha)

**Objetivo:** demostrar la idea central. Una plataforma que explica código en vez de generarlo, con
explicaciones honestas y contenido interconectado.

**Qué alcanza:**

- Estudio: analizador de texto local (sin IA), niveles de lectura, selección de líneas y tramos,
  pregunta libre, explicación del modelo con skills compuestas.
- Ocho skills escritas y componibles, con reglas de bloqueo por superficie (código y matemáticas).
- Puentes matemáticos (fórmula → significado → razonamiento → pseudocódigo → código) con
  experimentos de valores.
- Biblioteca con hilos conectados y ensayos de lenguajes con la comparación «mismo problema,
  distinta frase».
- Servidor frugal: una llamada al modelo por clic, validación, caché, límites por IP y global, clave
  solo en el servidor.

**Criterio de terminación:** typecheck, pruebas y build en verde; cada pantalla se renderiza con
consola limpia en escritorio y móvil.

## 0.2 — Depuración como método (base hecha; 0.2.1 completada, pendiente de revisión)

**Objetivo:** que un error deje de ser algo que la IA tapa. Estudio del fallo: qué falló, por qué
ocurrió, cómo se habría detectado antes y cómo reproducirlo.

**Qué alcanza:**

- Modo «Estudia el fallo»: pegas el código y el mensaje del compilador o del runtime juntos; un
  análisis local lee el mensaje (líneas que nombra, identificadores entre comillas, tipo de error
  reconocido) y el fragmento queda numerado con las líneas señaladas marcadas.
- Skill de depuración fija: leer el mensaje, localizar el sitio, hipótesis ordenadas de la más
  barata a la más cara con cómo comprobar cada una, una entrada que falla hoy y otra que debería
  seguir funcionando mañana, y cómo el fallo habría saltado antes.
- Límites de entrada del modo «Estudia el fallo», fijados en la 0.2.1: 20 000 caracteres de código y
  8 000 de mensaje, con aviso en la interfaz y envío bloqueado hasta que quepa.
- Ajustes: proveedor y modelo propios (xAI, OpenAI, Anthropic, Google) con clave propia. La clave se
  guarda solo en el navegador y viaja con cada petición; el servidor la usa en esa llamada y no la
  guarda ni la registra en logs.
- Hilo «Mensaje de error» en la biblioteca, junto a Compilador y Prueba.

**Criterio de terminación:** un fragmento con fallo y su mensaje producen una guía ordenada con
hipótesis verificables, no una versión corregida a secas.

## 0.3 — Ejecutar con seguridad

**Objetivo:** pasar de leer el texto a ver el programa correr, sin mentir sobre lo que se ejecuta.
Es la base de todos los retos.

**Qué se construye:**

- Entorno de ejecución aislado y acotado. Primero WebAssembly para JavaScript y Python, con límites
  de tiempo y memoria. Los lenguajes compilados (Rust incluido) se ejecutan en local dentro de un
  proceso aislado con límites, solo en la máquina de quien usa Cifra.
- Ejecutor de pruebas: un conjunto de pruebas fijas que se corre contra el código de la persona y
  devuelve un resultado estructurado (qué pasó, qué falló, con qué entrada). **El veredicto de un
  reto sale de aquí, no de la IA.**
- Trazas paso a paso del estado de las variables, integradas en el estudio. La explicación marca con
  claridad qué se obtuvo de una ejecución real.
- Comparación de mediciones: versión original frente a versión optimizada, con la diferencia real.

**Criterio de terminación:** ningún código del usuario sale del ordenador; una ejecución lenta o
enorme se corta sin degradar la plataforma; las trazas alimentan la explicación en lugar de
sustituirla.

## 0.4 — Dos caminos y retos de fundamentos

**Objetivo:** que alguien de primero de carrera entre, elija cómo empezar y tenga un recorrido real
de retos académicos, de fácil a muy difícil.

**Qué se construye:**

- **Entrada con dos planes:**
  - **Desde cero:** fundamentos → estructuras → algoritmos → arquitectura.
  - **Ya tengo experiencia:** una prueba de nivel corta que coloca a la persona en un punto del
    recorrido y le abre el camino profesional.
  - **Los dos a la vez:** el plan profesional se desbloquea al superar un nivel concreto del plan
    desde cero (el umbral se fija en esta versión, antes de escribir contenido).
- **Retos académicos de problem solving:** colección por familias, con niveles de dificultad
  explícitos y progresión (qué se ha superado y qué queda por revisar).
- **El flujo de un reto:**
  1. La web entrega el enunciado y el código de partida.
  2. La persona lo resuelve o lo corrige por su cuenta.
  3. Lo envía. Se ejecuta en el entorno aislado contra las pruebas fijas.
  4. La IA lee el código, el resultado de las pruebas y el enunciado, y explica qué cumple, qué no y
     por qué. No puede dar por bueno un código que falla las pruebas, ni suspender uno que las pasa;
     si aporta una observación de calidad, la marca como opinión.
  5. Resultado: superado o no, con la guía de qué mirar.
- **Integridad en los retos de fundamentos** (se explica en «Lo que Cifra no promete»):
  - Variantes por persona: los datos de cada reto se generan con una semilla distinta, de modo que
    una solución copiada de otro sitio no sirve tal cual.
  - Señales, nunca acusaciones: pérdida de foco de la pestaña, pegados grandes, ritmo de escritura
    imposible. Una señal no bloquea; activa una pregunta.
  - «Defiende tu solución»: tras superar un reto, la IA hace una o dos preguntas sobre el propio
    código de la persona. Si no puede explicarlo, el reto queda como «superado sin comprender» y
    sigue pendiente de repaso.
- **Diseño:** primera versión del sistema visual (tipografía, color, movimiento).

**Criterio de terminación:** una persona nueva elige un plan, resuelve un reto de cada nivel y recibe
un veredicto que sale de pruebas reales; copiar una solución ajena no basta para pasar.

## 0.5 — Retos profesionales: leer qué pasó

**Objetivo:** que alguien con experiencia (o que ha llegado a ese nivel) analice un sistema tal como
llegaría en el trabajo, y deduzca qué ocurrió.

**Qué se construye:**

- **Paquetes de incidente sintéticos:** código de una web o de infraestructura, configuración, logs,
  métricas y un síntoma (ha sido comprometida, va muy lenta, falla a ciertas horas, factura
  disparada). Todo inventado pero realista, con el fallo plantado.
- **Terminal simulada** sobre el paquete: se puede mirar, filtrar y comparar. No se conecta a ningún
  sistema real.
- **La persona escribe su análisis:** qué pasó, la evidencia, la línea o la configuración causante,
  cómo se habría detectado antes y cómo se corrige. Después lo compara con la guía del reto.
- **Aquí la IA es libre:** se puede usar cualquier IA, como en el trabajo. Lo que se evalúa es la
  calidad del análisis, no que no se haya usado ayuda.
- **Evaluación estructurada:** cada reto tiene una respuesta esperada (causa, evidencia, impacto,
  corrección). La comparación marca qué se acertó, qué se dedujo sin evidencia y qué se pasó por alto.
- **Familias del fallo:** límites de colección, valores nulos, nombres que no existen, estados
  intermedios corruptos, secretos expuestos, permisos de más, consultas lentas, bloqueos y
  diferencias entre lo que el mensaje dice y lo que ocurrió.
- Los retos se enlazan con los conceptos y los hilos de la biblioteca que sostienen el fallo. El
  progreso queda en el navegador.
- **Solo defensivo:** se enseña a detectar, entender y corregir. No hay retos de explotación.

**Criterio de terminación:** un paquete de incidente se puede leer, investigar con la terminal
simulada y entregar con un análisis, y la comparación separa lo comprobado de lo deducido sin
falsear el programa ni dar por bueno un intento solo por sonar convincente.

## 0.6 — Plataforma modular

**Objetivo:** que el crecimiento no requiera rehacer. Se hace antes de ampliar el contenido
(0.7) para no tener que reconstruirlo después.

**Qué se construye:**

- Registro común de módulos: un lenguaje se añade con su analizador, sus notas y sus ensayos sin
  editar la plataforma. Lo mismo para retos, entornos de ejecución y analizadores.
- Multi-modelo: el estudio construye el pedido desde el plan de respuesta y cada modelo tiene su
  adaptador; añadir un modelo es añadir un módulo.
- Pruebas de seguridad y de coste como parte del portón de calidad del proyecto.

**Criterio de terminación:** añadir un lenguaje completo no toca ningún componente de interfaz;
añadir un modelo no toca ninguna skill; los dos portones comparten el mismo criterio de paso.

## 0.7 — La red de conocimiento, completa

**Objetivo:** que la biblioteca sea de verdad una red: cualquier concepto se alcanza y se conecta con
los que lo sostienen.

**Qué se construye:**

- Un grafo de conceptos explícito (adelante, atrás y paralelo), no listas. Cada puente matemático se
  enlaza con el concepto de algoritmo y de lenguaje que lo hace código.
- Comparador de lenguajes como herramienta propia: el mismo problema en los lenguajes soportados,
  con un ensayo de por qué la traducción literal falla en cada caso (propiedad y préstamos, tipos,
  punteros y duración de objetos, concurrencia).
- Nuevos hilos: arquitectura de software, sistemas distribuidos, bases de datos, redes, seguridad
  defensiva ampliada, pruebas.
- Itinerarios con progreso recordado en el navegador, conceptos marcados como difíciles y
  recomendación de contenido según el recorrido y el plan elegido.

**Criterio de terminación:** desde cualquier concepto se llega a otro en dos clics sin recurrir a
buscadores externos; los itinerarios respetan quién empieza de cero y quién ya sabe.

## 0.8 — Un compilador que comprueba

**Objetivo:** un análisis que prometa algo. No ejecutar el código: comprobarlo, con las reglas que un
compilador real aplicaría antes de dejarlo pasar.

**Qué se construye:**

- Lenguaje propio de Cifra, pequeño y deliberado: un subconjunto razonado de tipos, colecciones y
  funciones, con sus reglas visibles. Sus reglas reflejan las de lenguajes reales para que lo
  aprendido se traslade.
- Análisis completo (front-end de compilador): lexing, parsing y comprobaciones (nombres que no
  existen, tipos que no encajan, uso de valores inexistentes, ramas sin camino de vuelta), con
  mensajes pedagógicos: qué regla se detuvo, qué se esperaba y qué llegó.
- Integración con el estudio y los retos: el fallo de compilación entra por el mismo sitio que un
  error real, y la guía del fallo trabaja sobre él.
- Retroalimentación con el puente matemático: si la regla violada es un invariante o una promesa del
  tipo, el mensaje enlaza al concepto que la sostiene.

**Criterio de terminación:** un programa inválido es rechazado con un mensaje que enseña la regla y
su ubicación; un programa válido es aceptado sin promesas de más.

## 0.9 — Pulido y endurecimiento

**Objetivo:** dejar Cifra lista para exponerse. Lo que antes funcionaba en una sola máquina ahora
debe aguantar a desconocidos.

**Qué se construye:**

- **Diseño y movimiento:** animaciones fluidas y coherentes en las transiciones, el scroll y los
  retos; rendimiento estable en móvil; accesibilidad (contraste, teclado, reducir movimiento).
- **Defensas de la IA puestas a prueba:** batería de ataques (inyección de instrucciones, intentos de
  sacar el prompt, de saltarse el veredicto, de usar la IA como chat general) con resultados
  registrados y corregidos.
- Revisión del coste por reto y de los límites por IP y globales.
- Revisión del aislamiento de ejecución con código deliberadamente hostil.
- Preparación del despliegue: dónde corre, qué claves, qué se registra y qué no.

**Criterio de terminación:** la batería de ataques no consigue alterar un veredicto ni extraer
instrucciones internas; una ejecución hostil no sale de su aislamiento; el coste por persona queda
acotado.

## 1.0 — Lanzamiento público

**Objetivo:** abrir Cifra al público con lo que hay en la 0.9, sin añadir funciones nuevas.

**Qué incluye:** despliegue, las dos vías de entrada, los retos de fundamentos y profesionales, la
biblioteca completa y el compilador. Todo el progreso sigue guardado en el navegador.

**Criterio de terminación:** una persona desconocida entra, elige plan, completa un reto y recibe su
veredicto sin intervención nuestra; el coste y los límites se mantienen bajo observación.

## Después de la 1.0 (todavía no es compromiso)

- **Cuentas con GitHub como único método de acceso**, para llevar el progreso entre dispositivos.
- **Clasificación de usuarios:** solo si se decide después de ver cómo se usan los retos. Un ranking
  cambia el incentivo y favorece el trampeo, por eso no entra antes.
- Nuevos lenguajes, familias de retos y paquetes de incidentes como módulos.

## Lo que Cifra no promete

- **Detectar otras pestañas.** Un navegador no deja a una web ver qué hay abierto en otras
  pestañas, ni su contenido. Cifra no lo hace ni lo finge. Lo que sí puede medir son señales de su
  propia pestaña (pérdida de foco, pegados, ritmo de escritura), que no prueban nada por sí solas.
  La protección real contra copiar son las variantes por persona y la pregunta «defiende tu
  solución». Una extensión de navegador sí podría ver pestañas, pero es intrusiva y no está prevista.
- **Que una IA decida un veredicto.** Si un reto tiene pruebas, manda la ejecución. Si no las tiene,
  el resultado se presenta como análisis comparado, no como sentencia.
- **Detectar con certeza el uso de IA.** En fundamentos se desincentiva y se verifica la comprensión;
  en el camino profesional se permite abiertamente.

## Defensas de la IA

Escribir buenos prompts de sistema reduce el abuso, pero no lo impide: una instrucción oculta
siempre puede acabar filtrada o esquivada. Por eso la defensa va en capas:

1. **Prompts de sistema estrictos:** la IA solo cumple una función por superficie (explicar, guiar,
   comparar), no actúa como chat general y no revela sus instrucciones.
2. **Entrada validada y acotada:** tamaño, formato y tipo. El código y los logs del usuario se tratan
   siempre como datos, nunca como instrucciones.
3. **Salida acotada:** la IA responde en un formato fijo que se valida antes de mostrarse.
4. **Veredictos fuera del modelo:** las pruebas deciden, no el texto de la IA.
5. **Sin acceso a nada sensible:** la IA no tiene claves, ficheros ni herramientas más allá de lo
   mínimo.
6. **Límites de uso y coste:** por IP, por persona y globales.
7. **Pruebas de ataque periódicas** (0.9 y en cada versión posterior).
