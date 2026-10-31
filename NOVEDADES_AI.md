# Cifra — Novedades y hoja de ruta

Este documento es la fuente de verdad del proyecto. Dice qué es Cifra, adónde va, qué trae cada
versión, qué decisiones ya están tomadas y cómo se sabe que una versión está terminada.

Está escrito para que lo pueda ejecutar una IA (por ejemplo, un modelo rápido tipo GLM Flash) sin
tener que adivinar. Por eso es explícito: cada versión tiene objetivo, alcance, contratos de datos,
tareas en orden, pruebas, lo que NO se hace y un criterio de terminación. Si algo no está aquí,
todavía no existe: no se anuncia y no se deja un botón vacío.

---

## 0. Reglas para quien construye (humano o IA)

Estas reglas valen para todas las versiones.

1. **Trabaja una tarea a la vez.** Termina una, pasa el portón de calidad (apartado 6) y solo
   entonces empieza la siguiente.
2. **Lee antes de escribir.** Antes de tocar un fichero, léelo entero. Antes de crear algo, busca si
   ya existe algo parecido y reutilízalo.
3. **No inventes.** Si un dato, un nombre de función o una decisión no está en este documento ni en
   el código, no lo supongas: para y pregunta, o anótalo en «Decisiones abiertas» (apartado 8).
4. **No amplíes el alcance.** Haz lo que dice la tarea. Nada de «ya que estoy». Si ves algo que
   mejorar, anótalo aparte, no lo mezcles.
5. **No cambies un contrato sin avisar.** Los contratos de datos (apartado 4) los usan varias
   versiones. Si hace falta cambiar uno, se cambia en un solo sitio, se actualizan todos sus usos y
   se anota en este documento.
6. **No añadas dependencias sin motivo.** Cada dependencia nueva se justifica en una línea: qué
   resuelve y por qué no basta lo que ya hay.
7. **Ningún secreto en el código ni en logs.** Las claves de API nunca se escriben en ficheros del
   repositorio ni en la consola ni en registros.
8. **Cada comportamiento nuevo lleva su prueba.** Una función sin prueba no está terminada.
9. **Cambios pequeños y comprobables.** Un cambio = una idea. Nada de reescribir ficheros enteros
   que ya funcionan.
10. **Si no puedes cumplir el criterio de terminación, dilo.** No lo des por cumplido.

### Cómo se encarga una tarea a la IA ejecutora

Plantilla (se rellena y se pega tal cual):

```
Versión: 0.X, tarea N.
Lee primero: este documento (apartados 0, 4 y la versión indicada) y los ficheros: [lista].
Haz: [descripción exacta].
No hagas: [lista de límites].
Contratos que debes respetar: [nombres].
Pruebas que deben existir al terminar: [lista].
Termina cuando: [criterio].
Si algo no está claro, pregunta antes de escribir código.
```

---

## 1. Qué es Cifra y adónde va

**Cifra es una web que enseña a programar para que puedas entender el código, incluido el que
escribe una IA, y leer la arquitectura de un sistema.** Va desde cero hasta nivel experto.

**Para quién:**
- Quien empieza (por ejemplo, alguien de primero de carrera) y necesita fundamentos sólidos.
- Quien ya programa y quiere leer, depurar y auditar lo que otros, o una IA, escribieron.

**Lo que la distingue:**
- Explica código en vez de generarlo. No devuelve el código corregido a secas.
- Separa siempre lo **comprobado** (salió de una ejecución o de una regla verificable) de lo
  **deducido** (razonamiento) y de lo que es **opinión**.
- Dos caminos: **fundamentos** (retos sin copiar) y **profesional** (retos de incidentes reales
  simulados, con libertad de usar IA).
- Todo el contenido está conectado: un concepto lleva a los que lo sostienen.

**Lo que Cifra NO es:**
- No es un generador de código ni un chat general.
- No es una plataforma de ataque: la seguridad se enseña desde la defensa.
- No es una academia de vídeo: aquí se lee, se ejecuta y se resuelve.

**Objetivos finales (a la 1.0):**
1. Una persona nueva elige su plan, resuelve retos de dificultad creciente y recibe un veredicto
   que sale de pruebas reales, no de la opinión de una IA.
2. Una persona con experiencia analiza paquetes de incidente (qué ha pasado, por qué, cómo se
   corrige) y compara su análisis con una guía honesta.
3. Cualquier concepto de la biblioteca se alcanza en dos clics y enlaza con lo que lo sostiene.
4. Ningún código de nadie sale de su ordenador. La IA de la web no se puede usar para otra cosa ni
   alterar un veredicto.
5. La web es moderna, con identidad propia, animaciones fluidas y buen rendimiento en móvil.

---

## 2. Cómo se numera

- Todas las versiones son **0.x**. La **1.0** es el primer lanzamiento público.
- **Hasta la 1.0, Cifra funciona en el ordenador de quien la desarrolla**: local, sin despliegue
  público, sin cuentas, sin ranking. Todo el progreso vive en el navegador.
- Equivalencias con la numeración antigua: v1 → 0.1, v2 → 0.2, v3 → 0.3. El resto se reordena.
- Cada versión sigue el mismo formato: objetivo, por qué existe, alcance, contratos, tareas,
  pruebas, fuera de alcance y criterio de terminación.
- Una versión solo se marca «hecha» cuando cumple su criterio de terminación **y** el portón de
  calidad.

**Mapa de versiones:**

| Versión | Nombre | Estado |
|---|---|---|
| 0.1 | Leer un programa | hecha |
| 0.2 | Depuración como método | base hecha; 0.2.1 terminada, pendiente de revisión |
| 0.3 | Ejecutar con seguridad | siguiente |
| 0.4 | Dos caminos y retos de fundamentos | pendiente |
| 0.5 | Retos profesionales: leer qué pasó | pendiente |
| 0.6 | Plataforma modular | pendiente |
| 0.7 | La red de conocimiento, completa | pendiente |
| 0.8 | Un compilador que comprueba | pendiente |
| 0.9 | Pulido y endurecimiento | pendiente |
| 1.0 | Lanzamiento público | pendiente |

**Las versiones 0.2 y 0.3 son la base de todo lo que viene después.** Los retos de fundamentos
(0.4) necesitan ejecutar código y comprobar pruebas (0.3). Los retos profesionales (0.5)
reutilizan el estudio del fallo (0.2) y el informe estructurado. El compilador (0.8) entra por la
misma puerta que un error real (0.2). Por eso estas dos versiones se describen con más detalle y
con contratos exactos.

---

## 3. Principios que atraviesan todas las versiones

1. **Comprobado, deducido, opinión.** Todo enunciado de una explicación lleva su procedencia.
   «Comprobado» solo se usa si hay una ejecución real o una regla verificable detrás.
2. **El veredicto no lo da el modelo.** Si un reto tiene pruebas, manda la ejecución. La IA explica
   el resultado, no lo decide.
3. **Explicar, no regalar.** Cifra no entrega el código corregido a secas.
4. **Material sintético.** Ningún reto toca sistemas reales ni ajenos. Lo que se analiza se inventa
   o se construye dentro de la plataforma.
5. **Defensivo primero.** Los retos de seguridad enseñan a detectar, entender y corregir. No hay
   retos de explotación.
6. **Privacidad por defecto.** El código y los datos de la persona se quedan en su ordenador. El
   servidor guarda lo mínimo y nunca claves.
7. **Local antes que remoto.** Lo que pueda hacerse en el navegador o en la máquina, no pasa por un
   servidor.
8. **Diseño propio.** Identidad visual, tipografía cuidada y animaciones suaves, con referencia en
   la sensación de las mejores páginas de producto. Se respeta «reducir movimiento» del sistema y
   las animaciones nunca tapan contenido ni frenan el uso.
9. **La IA de la web se defiende en capas.** Los prompts de sistema son una capa, no la defensa
   entera (apartado 7).
10. **Modular.** Lo nuevo (lenguajes, modelos, retos) se añade como módulo, no como parche.

---

## 4. Contratos de datos (lo que comparten todas las versiones)

Estos contratos se escriben como tipos en el lenguaje que ya usa el proyecto (el que pasa
`typecheck`). Aquí van en notación TypeScript. Si cambian, cambian en un solo lugar.

### 4.1 Procedencia de una afirmación

```ts
type Procedencia =
  | "comprobado-ejecucion"   // salió de una ejecución real
  | "comprobado-regla"       // salió de una regla o análisis local verificable
  | "deducido"               // razonamiento sin comprobar
  | "opinion";               // valoración subjetiva

type Afirmacion = { texto: string; procedencia: Procedencia };
```

Regla: una afirmación con `comprobado-ejecucion` debe poder enlazarse a un `RunResult`
concreto (4.4). Si no hay ejecución, no puede llevar esa etiqueta.

### 4.2 Informe del fallo (0.2)

```ts
type TipoError =
  | "sintaxis" | "nombre-inexistente" | "tipo" | "valor-nulo"
  | "limite-coleccion" | "aritmetica" | "prestamo-propiedad"
  | "metodo-inexistente" | "importacion" | "desconocido";

type FailureReport = {
  lenguaje: string;
  mensaje: {
    crudo: string;
    tipo: TipoError;
    lineasNombradas: number[];        // líneas que el mensaje menciona
    identificadoresCitados: string[]; // nombres entre comillas del mensaje
  };
  fragmento: { n: number; texto: string; marcada: boolean }[];
  guia?: {
    leerElMensaje: Afirmacion[];
    localizarElSitio: Afirmacion[];
    hipotesis: { texto: string; coste: 1 | 2 | 3; comoComprobarla: string }[]; // ordenadas de 1 a 3
    entradaQueFallaHoy: string;
    entradaQueDebeSeguirFuncionando: string;
    comoHabriaSaltadoAntes: string;
  };
};
```

### 4.3 Adaptador de modelo (0.2)

```ts
interface ModelAdapter {
  id: string;                       // "openai", "anthropic", "google", "xai", ...
  modelosSoportados: string[];
  construirPeticion(plan: PlanDeRespuesta, opciones: { modelo: string; clave?: string }): PeticionProveedor;
  leerRespuesta(cruda: unknown): { texto: string; tokensEntrada?: number; tokensSalida?: number };
  traducirError(cruda: unknown): ErrorDeProveedor; // 401, 429, 5xx, tiempo agotado, contenido bloqueado
}
```

`PlanDeRespuesta` describe QUÉ se quiere responder (skills activas, nivel de lectura, formato de
salida). Cada adaptador solo sabe traducirlo a su proveedor. Ninguna skill menciona a un
proveedor.

### 4.4 Ejecución (0.3)

```ts
type Limites = { tiempoMs: number; memoriaMB: number; salidaKB: number; pasosTraza: number };

type RunRequest = {
  lenguaje: "javascript" | "python" | "rust"; // los demás llegan por módulos (0.6)
  codigo: string;
  entrada?: string;           // stdin
  limites: Limites;
  pruebas?: TestSpec[];
  trazar?: boolean;
};

type RunResult = {
  estado: "ok" | "error" | "tiempo" | "memoria" | "salida-excedida" | "no-soportado";
  stdout: string;
  stderr: string;
  codigoSalida?: number;
  duracionMs: number;
  pruebas?: TestResult[];
  traza?: TraceStep[];
  motor: { nombre: string; version: string };
  origen: "ejecucion-real";   // siempre esta cadena; sirve de sello de procedencia
};

type TestSpec = {
  id: string;
  nombre: string;
  entrada: unknown;
  esperado: unknown;
  tipo: "salida" | "retorno" | "propiedad";
  visible: boolean;           // las no visibles no se muestran antes de entregar
};

type TestResult = { id: string; pasada: boolean; obtenido?: unknown; esperado?: unknown; error?: string };

type TraceStep = {
  paso: number;
  linea: number;
  evento: "linea" | "llamada" | "retorno" | "excepcion";
  variables: Record<string, string>; // valores ya convertidos a texto y recortados
};
```

### 4.5 Reto de fundamentos (0.4)

```ts
type ChallengeSpec = {
  id: string;
  titulo: string;
  familia: string;            // "bucles", "recursion", "colecciones", ...
  nivel: number;              // 1 a 10
  enunciado: string;
  codigoDePartida: string;
  lenguajes: string[];
  generador?: { semilla: "por-persona"; parametros: Record<string, unknown> }; // variantes
  pruebas: TestSpec[];
  conceptos: string[];        // ids de la biblioteca
  preguntasDefensa: string[]; // para «defiende tu solución»
};
```

### 4.6 Paquete de incidente (0.5)

```ts
type IncidentSpec = {
  id: string;
  titulo: string;
  nivel: number;              // 1 a 10
  familia: string;
  sintoma: string;            // lo que la persona sabe al empezar
  ficheros: Record<string, string>; // sistema de ficheros virtual: ruta → contenido
  respuestaEsperada: {
    causa: string;
    evidencia: string[];      // rutas y líneas que lo prueban
    impacto: string;
    correccion: string;
    comoDetectarlo: string;
  };
  conceptos: string[];
};
```

---

## 5. Versiones

---

### 0.1 — Leer un programa (hecha)

**Objetivo:** demostrar la idea central. Una plataforma que explica código en vez de generarlo,
con explicaciones honestas y contenido interconectado.

**Qué alcanza:**
- **Estudio:** analizador de texto local (sin IA), niveles de lectura, selección de líneas y
  tramos, pregunta libre y explicación del modelo con skills compuestas.
- **Ocho skills** escritas y componibles, con reglas de bloqueo por superficie (código y
  matemáticas).
- **Puentes matemáticos:** fórmula → significado → razonamiento → pseudocódigo → código, con
  experimentos de valores.
- **Biblioteca:** hilos conectados y ensayos de lenguajes con la comparación «mismo problema,
  distinta frase».
- **Servidor frugal:** una llamada al modelo por clic, validación, caché, límites por IP y global,
  clave solo en el servidor.

**Criterio de terminación:** `typecheck`, pruebas y build en verde; cada pantalla se renderiza con
consola limpia en escritorio y móvil.

**Lo que deja como base:** el analizador local, el sistema de skills, el cliente del modelo y la
biblioteca. Todo lo que viene después se apoya aquí.

---

### 0.2 — Depuración como método (base hecha; 0.2.1 completada, pendiente de revisión)

**Objetivo:** que un error deje de ser algo que la IA tapa. Un error pasa a ser algo que se lee, se
localiza, se explica y se aprende a evitar. Estudio del fallo: **qué falló, por qué ocurrió, cómo
se habría detectado antes y cómo reproducirlo.**

**Por qué es base de todo lo demás:**
- 0.4 (retos) usa el informe del fallo para explicar por qué una solución no pasa.
- 0.5 (retos profesionales) es en esencia «Estudia el fallo» sobre un paquete entero.
- 0.8 (compilador) mete sus errores por la misma puerta que un error de verdad.
- 0.6 (modular) generaliza el cliente de modelo que nace aquí.

**Si algo de lo siguiente no existe todavía en el código, se completa como 0.2.1 antes de empezar
0.3.** Si ya existe, se comprueba con las pruebas indicadas.

#### 0.2.A Entrada del modo «Estudia el fallo»

- Hay dos campos: **código** y **mensaje de error**. Se pegan juntos.
- El mensaje se limpia sin alterarlo: se quitan secuencias de color de terminal y se normalizan los
  saltos de línea. Nunca se reescribe el contenido.
- Límites de entrada: código hasta un máximo definido (propuesta inicial: 20 000 caracteres) y
  mensaje hasta otro (propuesta inicial: 8 000). Si se pasa, se avisa con claridad y no se envía.
- El lenguaje se detecta por señales del código y del mensaje; si no es seguro, se pregunta. No
  se adivina en silencio.

#### 0.2.B Análisis local del mensaje (sin IA)

Es una función pura: dado `(codigo, mensaje, lenguaje)` devuelve `FailureReport` sin `guia`.

Extrae, como mínimo:
- **Líneas nombradas:** números de línea que el mensaje menciona (formatos como `línea 12`,
  `line 12`, `:12:5`, `file.py", line 12`).
- **Identificadores citados:** nombres entre comillas simples, dobles o acentos graves.
- **Tipo de error reconocido**, con esta tabla mínima:

| Lenguaje | Señal en el mensaje | Tipo |
|---|---|---|
| JavaScript | `Cannot read properties of undefined/null` | valor-nulo |
| JavaScript | `x is not defined` | nombre-inexistente |
| JavaScript | `x is not a function` | metodo-inexistente |
| JavaScript | `Unexpected token`, `SyntaxError` | sintaxis |
| Python | `NameError` | nombre-inexistente |
| Python | `IndexError`, `KeyError` | limite-coleccion |
| Python | `TypeError` | tipo |
| Python | `AttributeError: 'NoneType'` | valor-nulo |
| Python | `ZeroDivisionError` | aritmetica |
| Python | `IndentationError`, `SyntaxError` | sintaxis |
| Python | `ModuleNotFoundError`, `ImportError` | importacion |
| Rust | `E0425` (nombre sin resolver) | nombre-inexistente |
| Rust | `E0308` (tipos que no encajan) | tipo |
| Rust | `E0382` (valor movido), `E0499`, `E0502` | prestamo-propiedad |
| Rust | `E0599` (método inexistente) | metodo-inexistente |
| Rust | `index out of bounds` (pánico) | limite-coleccion |
| Rust | `called Option::unwrap() on a None value` | valor-nulo |

- Si ninguna regla encaja, `tipo = "desconocido"`. **Nunca se fuerza un tipo.**
- El **fragmento** queda numerado y con las líneas nombradas marcadas (`marcada: true`). Si una línea
  nombrada no existe en el código pegado, se indica; no se inventa.
- Todo lo extraído aquí es `comprobado-regla`.

#### 0.2.C Skill de depuración (fija)

La skill de depuración siempre está en la guía de este modo y obliga a esta estructura de salida,
en este orden:

1. **Leer el mensaje:** qué dice exactamente, sin interpretar.
2. **Localizar el sitio:** dónde apunta el mensaje y dónde puede estar el origen real (no siempre
   coinciden).
3. **Hipótesis**, de la más barata a la más cara de comprobar. Cada una con **cómo comprobarla**.
4. **Una entrada que falla hoy** y **otra que debería seguir funcionando mañana**.
5. **Cómo habría saltado antes** (una prueba, un tipo, una comprobación, una revisión).

Prohibiciones de esta skill:
- No devuelve el código corregido a secas. Puede mostrar el fragmento mínimo necesario para
  ilustrar una idea, nunca el fichero resuelto.
- No afirma una causa como cierta si solo se dedujo. Lo deducido lleva `procedencia: "deducido"`.
- No inventa líneas que no están en el código.

#### 0.2.D Proveedores y claves

- Proveedores soportados: **xAI (Grok), OpenAI, Anthropic (Claude), Google (Gemini)**. Cada uno
  implementa `ModelAdapter` (4.3).
- La persona elige proveedor y modelo en Ajustes y pega su clave.
- **La clave se guarda solo en el navegador** y viaja con cada petición. El servidor la usa en esa
  llamada y no la guarda, no la devuelve y **no la escribe en logs** (ni siquiera parcial).
- Sin clave propia, se usa la clave de plataforma, solo si el servidor la trae. Si no hay ninguna,
  se dice con claridad qué falta.
- Mientras Cifra funcione solo en local (hasta 1.0), la clave de plataforma es la del propio
  desarrollador y nunca se sirve a otros.
- Errores del proveedor traducidos (`traducirError`): clave inválida, límite de uso, servicio
  caído, contenido bloqueado, tiempo agotado. Cada uno muestra un mensaje claro y accionable.

#### 0.2.E Caché y límites

- Caché por huella de la petición completa (código + mensaje + lenguaje + proveedor + modelo +
  versión de las skills). Misma petición, misma respuesta, sin otra llamada.
- Una llamada al modelo por clic. Nunca llamadas en cascada.
- Límites por IP y global, y tope de tokens de salida por petición.

#### 0.2.F Hilo de biblioteca «Mensaje de error»

- Hilo nuevo junto a Compilador y Prueba: cómo se lee un mensaje, qué familias de error existen,
  cómo se localiza el origen. Enlazado con los conceptos que sostienen cada familia.

#### 0.2 Pruebas que deben existir

- El análisis local devuelve el tipo correcto para **cada fila de la tabla** (una prueba por fila).
- El análisis local devuelve `desconocido` ante un mensaje que no reconoce.
- Las líneas nombradas se extraen de al menos tres formatos distintos.
- Una línea nombrada que no existe en el código se señala sin romper nada.
- La clave de API no aparece en ningún log ni en el cuerpo de ninguna respuesta (prueba que
  recorre los registros generados en una llamada simulada).
- La caché devuelve el mismo resultado sin una segunda llamada al proveedor.
- Cada adaptador traduce correctamente un error 401, un 429 y un 5xx simulados.
- La salida del modelo se valida contra `FailureReport.guia`; si no cumple la forma, se rechaza y
  se muestra un error útil, no una respuesta rota.

#### 0.2 Fuera de alcance

- Ejecutar el código del usuario (llega en 0.3).
- Corregir el código por la persona.
- Cuentas, ranking, retos.

#### 0.2 Criterio de terminación

Un fragmento con fallo y su mensaje producen una guía ordenada con hipótesis verificables, nunca
una versión corregida a secas, y el análisis local funciona **sin ninguna llamada al modelo**.
`typecheck`, pruebas y build en verde.

---

### 0.3 — Ejecutar con seguridad

**Objetivo:** pasar de leer el texto a ver el programa correr, sin mentir sobre lo que se ejecuta.
Cifra deja de inferir cómo se comporta un programa y empieza a **mostrarlo**.

**Por qué es base de todo lo demás:**
- 0.4 (retos de fundamentos) necesita ejecutar el código de la persona contra pruebas fijas.
- 0.5 (incidentes) usa mediciones y ejecuciones para comprobar hipótesis.
- 0.8 (compilador) decide qué se ejecuta y qué solo se comprueba.
- 0.9 (endurecimiento) ataca esta capa con código hostil.
- La procedencia `comprobado-ejecucion` de todo el sistema nace aquí.

#### 0.3.A Principios de la ejecución

1. **El código de la persona nunca sale de su ordenador.** No hay ejecución en un servidor.
2. **Todo se ejecuta aislado y acotado.** Sin red, sin acceso a ficheros del equipo, con tiempo,
   memoria y salida limitados.
3. **Una ejecución que se pasa de límites se corta y se explica.** No se queda colgada ni degrada
   la web.
4. **El resultado es siempre un `RunResult`** (4.4), con `origen: "ejecucion-real"` y el motor y
   su versión. Nada más lleva ese sello.
5. **Lo que no se pudo ejecutar se dice.** Si un lenguaje no está soportado, el estado es
   `no-soportado`. Nunca se simula una salida.

#### 0.3.B Límites por defecto (ajustables, propuesta inicial)

| Límite | Valor inicial | Qué pasa al superarlo |
|---|---|---|
| Tiempo | 5 000 ms | Se corta; estado `tiempo` |
| Memoria | 128 MB | Se corta; estado `memoria` |
| Salida (stdout + stderr) | 64 KB | Se corta y se avisa; estado `salida-excedida` |
| Pasos de traza | 2 000 | Se detiene la traza y se marca como truncada |
| Valor de variable en traza | 200 caracteres | Se recorta con `…` |

Estos valores se fijan en un único fichero de configuración. Nada de números sueltos por el
código.

#### 0.3.C Motores de ejecución

**JavaScript:**
- Se ejecuta en un **Web Worker** sin acceso al DOM. La web puede terminar el Worker a la fuerza al
  pasar el tiempo límite.
- Se bloquean o eliminan `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts` y el resto de
  accesos a red del contexto del Worker antes de ejecutar el código.
- `console.log` se redirige a la captura de salida.

**Python:**
- Se ejecuta con Pyodide (Python compilado a WebAssembly) dentro de un Worker aparte.
- Sin acceso a red. Los paquetes disponibles son una lista cerrada, no cualquier `pip install`.
- Se carga bajo demanda la primera vez, y se avisa del tiempo de carga.

**Rust (solo en desarrollo local, hasta nueva decisión):**
- Se compila y ejecuta en un proceso hijo en un directorio temporal, con límite de tiempo y de
  memoria, y se elimina todo al terminar. Se mata el árbol de procesos al agotar el tiempo.
- **Aviso honesto:** el aislamiento de un proceso local es más débil que el de WebAssembly.
  Por eso este modo solo existe en la máquina del desarrollador y no se publica en la 1.0 (ver
  «Decisiones abiertas»).

#### 0.3.D Ejecutor de pruebas

- Recibe `RunRequest` con `pruebas` y devuelve `RunResult` con un `TestResult` por cada prueba.
- Comparación de resultados: se define en un solo sitio (igualdad estricta por defecto, con
  tolerancia numérica configurable para decimales).
- Las pruebas con `visible: false` no muestran su entrada ni su esperado hasta que la persona
  entrega; después sí, para poder aprender.
- Las pruebas se ejecutan **cada una aislada de las demás**: el fallo o el bucle infinito de una no
  tumba al resto.
- **El veredicto de un reto sale de aquí.** Ninguna parte del sistema puede marcar un reto como
  superado sin un `RunResult` con todas sus pruebas pasadas.

#### 0.3.E Trazas paso a paso

- Se activan con `trazar: true`.
- **JavaScript:** el código se instrumenta antes de ejecutarse para registrar línea, evento y
  variables locales visibles.
- **Python:** se usa el mecanismo de seguimiento del propio intérprete.
- La traza es una lista de `TraceStep`. Se recorta al llegar a `pasosTraza` y se indica
  `truncada: true`.
- En la interfaz, la traza se ve como una línea de tiempo con las variables cambiadas resaltadas
  en cada paso.
- **La traza no sustituye a la explicación, la alimenta.** La explicación cita pasos concretos con
  `comprobado-ejecucion`.

#### 0.3.F Comparación de mediciones

- Compara dos versiones de un código (original y optimizada) sobre la misma entrada.
- Metodología fija: calentamiento descartado, varias repeticiones (propuesta: 10), se informa de
  mediana y dispersión, no de una sola medida.
- El resultado dice siempre «medido en este equipo con estos límites»: no se presenta como un
  valor universal.
- No se afirma que una versión sea más rápida si la diferencia cae dentro de la dispersión.

#### 0.3.G Integración con el estudio

- Un botón «Ejecutar» en el estudio. La salida, los errores y la traza se ven junto al código.
- Si la ejecución falla, el mensaje de error entra en «Estudia el fallo» (0.2) con un clic. **Este es
  el puente entre 0.2 y 0.3.**
- Las explicaciones del modelo pueden citar resultados de ejecución; los reciben como datos, no como
  instrucciones.

#### 0.3 Tareas, en orden

1. Fichero único de límites y tipos `RunRequest` / `RunResult` / `TestSpec` / `TraceStep`.
2. Ejecutor de JavaScript en Worker con corte por tiempo y captura de salida.
3. Pruebas de límites (bucle infinito, memoria, salida enorme) para JavaScript.
4. Ejecutor de pruebas (`TestSpec` → `TestResult`).
5. Ejecutor de Python con Pyodide.
6. Trazas para JavaScript y luego para Python.
7. Comparación de mediciones.
8. Integración en el estudio (botón Ejecutar, vista de traza, puente a «Estudia el fallo»).
9. Ejecución local de Rust (solo desarrollo).

#### 0.3 Pruebas que deben existir

- Un bucle infinito termina por tiempo con estado `tiempo`, y la web sigue respondiendo.
- Un programa que reserva memoria sin parar termina con estado `memoria`.
- Un programa que imprime sin parar termina con `salida-excedida`.
- Un código que intenta `fetch` o abrir un WebSocket falla y no sale nada a la red.
- Un código que intenta tocar el DOM de la web no puede.
- El fallo de una prueba no impide ejecutar las demás.
- Una prueba con `visible: false` no revela su entrada antes de entregar.
- Una traza que excede el límite queda marcada como truncada.
- La comparación de mediciones no declara ganadora una versión cuando la diferencia es menor que la
  dispersión.
- Todo `RunResult` lleva `origen: "ejecucion-real"` y la versión del motor.

#### 0.3 Fuera de alcance

- Retos, planes y niveles (0.4).
- Ejecución en servidor o contenedores.
- Lenguajes distintos de JavaScript, Python y Rust local.
- Cuentas y ranking.

#### 0.3 Criterio de terminación

Ningún código del usuario sale del ordenador. Una ejecución lenta o enorme se corta sin degradar la
plataforma. Las trazas alimentan la explicación en lugar de sustituirla. El ejecutor de pruebas
devuelve un resultado estructurado fiable que otras versiones pueden usar como veredicto. Las
pruebas de límites pasan. `typecheck`, pruebas y build en verde.

---

### 0.4 — Dos caminos y retos de fundamentos

**Objetivo:** que alguien de primero de carrera entre, elija cómo empezar y tenga un recorrido
real de retos académicos, de fácil a muy difícil, con veredictos que salen de pruebas reales.

**Qué se construye:**

#### 0.4.A Entrada con dos planes

- **Desde cero:** fundamentos → estructuras → algoritmos → arquitectura. Es el camino largo.
- **Ya tengo experiencia:** una **prueba de nivel corta** (propuesta: 8 retos breves de dificultad
  creciente) que coloca a la persona en un punto del recorrido y le abre el plan profesional.
- **Los dos a la vez:** el plan profesional se desbloquea al **superar un nivel concreto del plan
  desde cero**. Propuesta inicial: nivel 5 de 10 (ver «Decisiones abiertas»; se fija antes de
  escribir contenido).
- La elección es reversible: la persona puede cambiar de plan en Ajustes sin perder su progreso.

#### 0.4.B Retos de fundamentos

- Colección organizada por **familias** y **niveles 1 a 10**. Familias iniciales: variables y tipos,
  condicionales, bucles, funciones, colecciones, cadenas, recursión, algoritmos de búsqueda y
  ordenación, complejidad, estructuras de datos básicas.
- **Mínimo de la versión:** 5 familias × 3 niveles = 15 retos escritos y probados. La calidad de cada
  reto pesa más que la cantidad.
- Cada reto cumple `ChallengeSpec` (4.5).
- Cada reto tiene al menos una prueba que falla con la solución «casi correcta más típica» (un
  límite mal puesto, un caso vacío), para que enseñe a pensar los casos límite.

#### 0.4.C Flujo de un reto

1. La web entrega el enunciado y el código de partida.
2. La persona lo resuelve o lo corrige por su cuenta.
3. Lo envía. Se ejecuta en el entorno aislado (0.3) contra las pruebas fijas.
4. La IA lee el código, el `RunResult` y el enunciado, y explica qué cumple, qué no y por qué.
   **No puede dar por bueno un código que falla las pruebas ni suspender uno que las pasa.** Una
   observación de calidad va marcada como `opinion`.
5. Resultado: **superado** o **no superado**, con la guía de qué mirar. Si no pasó, el informe del
   fallo (0.2) se puede abrir con un clic.

#### 0.4.D Integridad en los retos de fundamentos

Lo que se hace de verdad (y lo que no, en «Lo que Cifra no promete»):

- **Variantes por persona:** los datos del reto se generan con una semilla distinta por persona. Una
  solución copiada de otro sitio no sirve tal cual.
- **Señales, no acusaciones:** pérdida de foco de la pestaña, pegados grandes, ritmo de escritura
  imposible. Una señal no bloquea nada; activa la pregunta de defensa.
- **«Defiende tu solución»:** tras superar un reto, la IA hace una o dos preguntas sobre el propio
  código de la persona (de `preguntasDefensa`). Si no puede explicarlo, el reto queda como
  **«superado sin comprender»** y se propone repaso.
- En fundamentos no se anima al uso de IA para resolver. En el camino profesional (0.5) se permite
  abiertamente.

#### 0.4.E Progreso

- Se guarda en el navegador: retos superados, niveles, retos «superados sin comprender» y conceptos
  por repasar.
- Sin cuentas. Se puede exportar e importar el progreso como fichero para no perderlo.

#### 0.4.F Diseño

- Primera versión del sistema visual: tipografía, paleta, espaciado, componentes y movimiento.
- La entrada con dos planes es la primera pantalla con animación cuidada.

#### 0.4 Pruebas que deben existir

- Un reto no se marca superado sin un `RunResult` con todas las pruebas pasadas.
- Con la misma persona, la misma semilla genera siempre los mismos datos; con otra persona, otros.
- Una señal de integridad nunca bloquea el envío.
- El desbloqueo del plan profesional ocurre exactamente al alcanzar el umbral configurado.
- El progreso se exporta y se importa sin pérdida.
- La IA no puede cambiar el resultado de un reto (prueba con una respuesta del modelo que intenta
  «aprobar» un código que falla).

#### 0.4 Fuera de alcance

- Retos profesionales, paquetes de incidentes (0.5).
- Cuentas y ranking.
- Detectar el contenido de otras pestañas del navegador (imposible; ver apartado 9).

#### 0.4 Criterio de terminación

Una persona nueva elige un plan, resuelve un reto de cada nivel disponible y recibe un veredicto que
sale de pruebas reales. Copiar una solución ajena no basta para superar un reto. El plan
profesional se desbloquea según lo decidido.

---

### 0.5 — Retos profesionales: leer qué pasó

**Objetivo:** que alguien con experiencia (o que ha llegado a ese nivel) analice un sistema tal como
llegaría en el trabajo, y deduzca **qué ocurrió, por qué y cómo se corrige**.

**Qué se construye:**

#### 0.5.A Paquetes de incidente sintéticos

- Cumplen `IncidentSpec` (4.6): código de una web o de infraestructura, configuración, logs,
  métricas y un **síntoma** (comprometida, muy lenta, falla a ciertas horas, factura disparada,
  datos corruptos).
- Todo es **inventado pero realista**, con el fallo plantado. Ningún paquete contiene credenciales
  reales, direcciones reales ni código de explotación funcional.
- **Mínimo de la versión:** 8 paquetes (al menos uno por familia de las de abajo, nivel mixto).

#### 0.5.B Terminal simulada

- Es un intérprete propio sobre el **sistema de ficheros virtual** del paquete. No es una shell real
  ni se conecta a nada.
- Comandos permitidos (lista cerrada): `ls`, `cat`, `head`, `tail`, `grep`, `wc`, `sort`, `uniq`,
  `diff`, `find`, `cut`. Cualquier otro devuelve «comando no disponible», nunca se ejecuta.
- Es de solo lectura. Todos los comandos y su salida quedan en un historial que se puede revisar.

#### 0.5.C Análisis de la persona

- La persona escribe su análisis con campos fijos: **qué pasó**, **evidencia** (rutas y líneas),
  **impacto**, **corrección** y **cómo se habría detectado antes**.
- Después lo compara con la guía.

#### 0.5.D Evaluación estructurada

- La comparación va campo por campo contra `respuestaEsperada` y marca:
  - lo que se **acertó**,
  - lo que se **dedujo sin evidencia** (sonaba bien pero no lo prueba ningún fichero),
  - lo que se **pasó por alto**.
- La evidencia se comprueba contra el sistema de ficheros del paquete: si la persona cita una línea
  que no dice eso, se marca. Esto es `comprobado-regla`.
- La IA redacta la explicación a partir de esa comparación; no decide por sí sola si el análisis es
  correcto.

#### 0.5.E IA libre

- En este camino se puede usar cualquier IA. Lo que se evalúa es la **calidad del análisis**, no
  que no se haya usado ayuda. La web no intenta detectarlo ni impedirlo.

#### 0.5.F Familias del fallo

Límites de colección, valores nulos, nombres inexistentes, estados intermedios corruptos, secretos
expuestos en repositorio o logs, permisos de más, consultas lentas, bloqueos y esperas, desbordes de
recursos y discrepancias entre lo que el mensaje dice y lo que ocurrió.

#### 0.5.G Solo defensivo

- Se enseña a detectar, entender y corregir.
- No hay retos de explotación ni se piden pasos para atacar.
- Si el síntoma es «ha sido hackeado», el reto es reconstruir **qué pasó y cómo se cierra**.

#### 0.5.H Progreso y biblioteca

- Los paquetes enlazan con los conceptos de la biblioteca que sostienen su fallo.
- El progreso queda en el navegador: qué se atacó y qué quedó sin volver a mirar.

#### 0.5 Pruebas que deben existir

- Cada comando permitido de la terminal tiene su prueba; un comando fuera de la lista nunca se
  ejecuta.
- La terminal no puede salir del sistema de ficheros virtual (prueba con rutas `../`).
- Citar una línea que no dice lo que se afirma se detecta.
- El análisis de ejemplo correcto de cada paquete se evalúa como acertado.
- El análisis que da una causa plausible pero sin evidencia se evalúa como «deducido sin
  evidencia».
- Ningún paquete contiene credenciales reales (comprobación automática de patrones).

#### 0.5 Criterio de terminación

Un paquete de incidente se puede leer, investigar con la terminal simulada y entregar con un
análisis. La comparación separa lo comprobado de lo deducido, y no da por bueno un intento solo por
sonar convincente.

---

### 0.6 — Plataforma modular

**Objetivo:** que el crecimiento no requiera rehacer. Nuevos lenguajes, modelos, skills, retos y
entornos se incorporan como módulos, no como parches. Se hace **antes** de ampliar contenido (0.7)
para no tener que reconstruirlo.

**Qué se construye:**
- **Registro común de módulos:** un lenguaje se añade con su analizador, sus notas, sus ensayos y su
  motor de ejecución sin editar la plataforma. Igual para retos y paquetes de incidentes.
- **Multi-modelo:** el estudio construye el pedido desde el `PlanDeRespuesta` y cada modelo tiene su
  adaptador (`ModelAdapter`). Añadir un modelo es añadir un módulo. Cualquier proveedor con API
  compatible entra por este camino.
- **Manifiesto de módulo:** cada módulo declara qué aporta, qué versión del contrato usa y qué
  necesita. Un módulo que no cumple el manifiesto no se carga.
- **Pruebas de seguridad y de coste** dentro del portón de calidad.

**Criterio de terminación:** añadir un lenguaje completo no toca ningún componente de interfaz;
añadir un modelo no toca ninguna skill; los dos portones (seguridad y coste) comparten el mismo
criterio de paso.

---

### 0.7 — La red de conocimiento, completa

**Objetivo:** que la biblioteca sea de verdad una red: cualquier concepto se alcanza y se conecta con
los que lo sostienen.

**Qué se construye:**
- **Grafo de conceptos explícito**, con relaciones tipificadas (adelante, atrás, paralelo), no
  listas. Cada puente matemático se enlaza con el concepto de algoritmo y de lenguaje que lo hace
  código.
- **Comparador de lenguajes** como herramienta propia: el mismo problema en los lenguajes
  soportados, con un ensayo de por qué la traducción literal falla en cada caso (propiedad y
  préstamos, tipos, punteros y duración de objetos, concurrencia).
- **Nuevos hilos:** arquitectura de software, sistemas distribuidos, bases de datos, redes,
  seguridad defensiva ampliada, pruebas.
- **Itinerarios** con progreso recordado en el navegador, conceptos marcados como difíciles y
  recomendación de contenido según el recorrido y el plan elegido.
- Todos los retos (0.4) y paquetes (0.5) quedan enlazados con el grafo.

**Criterio de terminación:** desde cualquier concepto se llega a otro en dos clics sin recurrir a
buscadores externos; los itinerarios respetan quién empieza de cero y quién ya sabe; ningún concepto
queda huérfano (comprobación automática del grafo).

---

### 0.8 — Un compilador que comprueba

**Objetivo:** un análisis que prometa algo. No ejecutar el código: **comprobarlo**, con las reglas
que un compilador real aplicaría antes de dejarlo pasar.

**Qué se construye:**
- **Lenguaje propio de Cifra**, pequeño y deliberado: un subconjunto razonado de tipos, colecciones
  y funciones, con sus reglas visibles. Sus reglas reflejan las de lenguajes reales (tipos, ausencia
  de valores, quizá propiedad) para que lo aprendido se traslade.
- **Front-end de compilador completo:** análisis léxico, sintáctico y comprobaciones (nombres que no
  existen, tipos que no encajan, uso de valores inexistentes, ramas sin camino de vuelta), con
  mensajes pedagógicos: qué regla se detuvo, qué se esperaba y qué llegó.
- **Integración:** el fallo de compilación entra por el mismo sitio que un error real y la guía del
  fallo trabaja sobre él (reutiliza 0.2). La comparación con lenguajes reales aprende de ahí.
- **Puente matemático:** si la regla violada es un invariante o una promesa del tipo, el mensaje
  enlaza al concepto que la sostiene.

**Criterio de terminación:** un programa inválido se rechaza con un mensaje que enseña la regla y su
ubicación; un programa válido se acepta sin promesas de más. Sin ejecución, sin milagros.

---

### 0.9 — Pulido y endurecimiento

**Objetivo:** dejar Cifra lista para exponerse. Lo que funcionaba en una sola máquina debe aguantar a
desconocidos.

**Qué se construye:**
- **Diseño y movimiento:** animaciones fluidas y coherentes en transiciones, scroll y retos;
  rendimiento estable en móvil; accesibilidad (contraste, teclado, lector de pantalla, reducir
  movimiento).
- **Batería de ataques a la IA de la web** (apartado 7), con resultados registrados y corregidos.
- **Código hostil contra el ejecutor** (0.3): intentos de salir del aislamiento, de agotar recursos,
  de acceder a red o a ficheros.
- **Coste:** revisión del coste por reto y de los límites por IP y globales.
- **Preparación del despliegue:** dónde corre, con qué claves, qué se registra y qué no.

**Criterio de terminación:** la batería de ataques no consigue alterar un veredicto ni extraer
instrucciones internas; una ejecución hostil no sale de su aislamiento; el coste por persona queda
acotado y medido.

---

### 1.0 — Lanzamiento público

**Objetivo:** abrir Cifra al público con lo que hay en la 0.9, **sin añadir funciones nuevas**.

**Qué incluye:** despliegue, las dos vías de entrada, los retos de fundamentos y profesionales, la
biblioteca completa y el compilador. El progreso sigue en el navegador.

**Decisión de ejecución para la 1.0:** en público solo se ejecutan los lenguajes que corren en el
navegador (JavaScript y Python). Los lenguajes compilados se mantienen como solo análisis y
comprobación, a menos que antes se decida una vía segura (ver «Decisiones abiertas»).

**Criterio de terminación:** una persona desconocida entra, elige plan, completa un reto y recibe su
veredicto sin intervención nuestra; el coste y los límites se mantienen bajo observación.

---

### Después de la 1.0 (todavía no es compromiso)

- **Cuentas con GitHub como único método de acceso**, para llevar el progreso entre dispositivos y
  con los datos mínimos.
- **Clasificación de usuarios:** solo si se decide tras ver cómo se usan los retos. Un ranking cambia
  el incentivo y favorece el trampeo, por eso no entra antes.
- Nuevos lenguajes, familias de retos y paquetes de incidentes como módulos.

---

## 6. Portón de calidad (común a todas las versiones)

Una tarea o versión no está terminada hasta que pasa todo esto:

1. `typecheck` sin errores.
2. Todas las pruebas en verde.
3. `build` correcto.
4. Cada pantalla se renderiza con la **consola limpia** en escritorio y en móvil.
5. Ninguna clave ni dato personal en logs (prueba automática).
6. Se cumplen los criterios de terminación de la versión.
7. Este documento está actualizado: estado, contratos y decisiones tomadas.

---

## 7. Defensas de la IA

Escribir buenos prompts de sistema reduce el abuso, pero **no lo impide**: una instrucción oculta
siempre puede acabar filtrada o esquivada. Por eso la defensa va en capas. Ninguna capa se considera
suficiente sola.

1. **Prompts de sistema estrictos.** Cada superficie (explicar, guiar, comparar, defender) tiene una
   única función. La IA no actúa como chat general, no revela sus instrucciones, no sigue órdenes
   que aparezcan dentro del código o los logs que analiza.
2. **Todo lo del usuario es dato.** El código, los mensajes, los logs y los análisis se envuelven en
   delimitadores claros y se tratan como material a analizar, nunca como instrucciones.
3. **Entrada validada y acotada.** Tamaño, formato y tipo. Lo que no encaja se rechaza antes de
   llegar al modelo.
4. **Salida acotada y validada.** La IA responde en un formato fijo (contrato del apartado 4) y se
   valida antes de mostrarse. Si no cumple, se descarta.
5. **Veredictos fuera del modelo.** Las pruebas (0.3) y la comparación contra la respuesta esperada
   (0.5) deciden. Aunque el modelo fuese engañado, no puede cambiar un resultado.
6. **Sin acceso a nada sensible.** La IA no tiene claves, ficheros del equipo ni herramientas más
   allá de lo mínimo.
7. **Límites de uso y coste:** por IP, por persona y globales, y tope de tokens por petición.
8. **Indicadores de filtración:** se incluye una marca secreta en el prompt de sistema; si aparece en
   una respuesta, se bloquea esa respuesta y se registra el intento.
9. **Batería de ataques** (se ejecuta en 0.9 y en cada versión posterior). Categorías mínimas:
   - inyección de instrucciones dentro del código o los logs,
   - intentos de sacar el prompt de sistema,
   - intentos de forzar «aprobado» en un reto,
   - intentos de usar la IA como chat general o para tareas ajenas,
   - peticiones de código de explotación o ataques,
   - peticiones que intentan agotar el coste (entradas enormes, repetidas).
   Cada caso tiene su resultado esperado y se vuelve a pasar tras cada cambio de prompts.

---

## 8. Decisiones abiertas

Cada una tiene una propuesta por defecto. La IA ejecutora **usa la propuesta** salvo que se diga lo
contrario, y lo anota aquí.

| Decisión | Propuesta por defecto | Se fija en |
|---|---|---|
| Nivel del plan desde cero que desbloquea el profesional | Nivel 5 de 10 | 0.4, antes de escribir contenido |
| Número de retos de fundamentos en 0.4 | 5 familias × 3 niveles (15) | 0.4 |
| Número de paquetes de incidente en 0.5 | 8 | 0.5 |
| Límites de ejecución (tiempo, memoria, salida, pasos) | Ver tabla de 0.3.B | 0.3 |
| Límites de entrada del estudio | Fijados en la 0.2.1: 20 000 de código, 8 000 de mensaje, aviso en la interfaz | — |
| Tope de tokens de salida por petición | 1400 tokens (fijado en la 0.2.1, en `limits.ts`) | — |
| Lenguajes ejecutables en la 1.0 | JavaScript y Python | 0.9 |
| Rust en la 1.0 | Solo análisis, sin ejecución pública | 0.9 |
| Proveedor y modelo por defecto del servidor | Sin predeterminado fijo; lo elige quien despliega | 0.6 |
| Nombre de los niveles (más allá del número) | Solo número por ahora | 0.4 |

---

## 9. Lo que Cifra no promete

- **Detectar otras pestañas.** Un navegador no deja que una web vea qué hay abierto en otras
  pestañas ni su contenido. Cifra no lo hace ni lo finge. Lo que sí puede medir son señales de su
  propia pestaña (pérdida de foco, pegados, ritmo de escritura), que no prueban nada por sí solas.
  La protección real contra copiar son las variantes por persona y «defiende tu solución». Una
  extensión de navegador sí podría ver pestañas, pero es intrusiva y no está prevista.
- **Que una IA decida un veredicto.** Si un reto tiene pruebas, manda la ejecución. Si no las tiene,
  el resultado se presenta como análisis comparado, no como sentencia.
- **Detectar con certeza el uso de IA.** En fundamentos se desincentiva y se verifica la
  comprensión; en el camino profesional se permite abiertamente.
- **Seguridad perfecta de la IA.** Se reduce el riesgo en capas y se prueba, pero no se promete que
  sea imposible de engañar.
- **Rendimiento universal.** Una medición es de un equipo y unos límites concretos.

---

## Plan de commits 0.2.1

La 0.2 quedó marcada «hecha» con huecos frente a los apartados 0.2.A–0.2.F y sus pruebas. La
0.2.1 completa esos huecos antes de empezar la 0.3. Todos los commits están en `version/0.2.1`:

| # | Commit | Estado |
|---|---|---|
| — | `cf98bc2` docs(novedades): registra el plan de commits de la 0.2.1 | hecha |
| 1a | `7870534` feat(analisis): añade el contrato FailureReport y el análisis local puro | hecha |
| 1b | `596fa42` refactor(estudio): migra el estudio del fallo al contrato FailureReport | hecha |
| 2 | `b373a05` feat(estudio): límites de entrada 20.000 y 8.000 con aviso en la interfaz | hecha |
| 3 | `3efa467` feat(estudio): detecta el lenguaje por señales y pregunta si duda | hecha |
| 4 | `0bf0b54` feat(modelo): traduce los errores del proveedor a mensajes accionables | hecha |
| 5 | `ac3ce8e` fix(modelo): versiona las skills en la huella de caché y acota el tope de salida | hecha |
| 6 | `987782b` test(analisis): la clave de API no aparece en logs ni respuestas | hecha |
| 7 | docs(novedades): refleja el estado real de la 0.2 | hecha (este commit) |

Reglas de la 0.2.1: un commit por mejora, cada uno deja typecheck, pruebas y build en verde y
lleva la prueba de la funcionalidad en el mismo commit. La señal «línea nombrada que no existe»
no entra en el contrato 4.2: la interfaz la deduce comparando `lineasNombradas` con la longitud
del fragmento. El script `test` de `package.json` lista los ficheros uno a uno y cada fichero de
prueba nuevo se aclara en el mismo commit que lo crea. Se ignora el aviso no fatal de rolldown
sobre `module level directive`.

### Lo que la 0.2.1 decidió

- El estudio del fallo trabaja con el contrato 4.2: `analyzeFailure` sustituye a `readMessage`
  (fichero retirado) y la guía del modelo se valida contra `guia`. Las claves extra de la
  implementación anterior (`checked`, `inferred`, `askNext`) salen de la interfaz porque el
  contrato no las tiene; todo lo que escribe el modelo lleva `procedencia: "deducido"`.
- Cada hipótesis lleva su coste de comprobarla como número (1 a 3), pedido al modelo y validado.
- Límites de entrada fijados: 20 000 caracteres de código y 8 000 de mensaje (ver decisión en §8).
- Detección del lenguaje: señales ponderadas de código y mensaje; si empatan o no bastan, se
  declara que no se puede asegurar. El selector manual confirma; nada cambia solo.
- El fallo del proveedor se traduce a seis casos accionables (401/403, 429, 5xx, tiempo agotado,
  contenido bloqueado, respuesta inesperada) y la clave de Google dejó de viajar en la query.
- La huella de la caché lleva la versión de las skills (`versionSkills` en el registro) y el tope
  de tokens de salida por petición vive en un único sitio (`limits.ts`).
