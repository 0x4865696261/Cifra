export type ConceptLink = { href: string; label: string };
export type RelationType = "adelante" | "atras" | "paralelo";
export type ConceptRelation = { slug: string; tipo: RelationType };
export type LearningPlan = "desde-cero" | "ya-se";

export type Concept = {
  slug: string;
  title: string;
  thread: string;
  summary: string;
  body: string[];
  code?: { language: string; source: string; caption: string };
  relaciones: ConceptRelation[];
  also?: ConceptLink[];
};

export type Thread = {
  id: string;
  title: string;
  slugs: string[];
  prioridad: Record<LearningPlan, number>;
};

export const threads: Thread[] = [
  {
    id: "dentro",
    title: "El programa, por dentro",
    slugs: ["variable", "funcion", "condicion", "bucle"],
    prioridad: { "desde-cero": 1, "ya-se": 8 },
  },
  {
    id: "vuelta",
    title: "Cuando la función se llama a sí misma",
    slugs: ["recursion", "pila-de-llamadas", "complejidad"],
    prioridad: { "desde-cero": 4, "ya-se": 7 },
  },
  {
    id: "datos",
    title: "Datos que se sostienen",
    slugs: ["arreglo", "diccionario", "invariante"],
    prioridad: { "desde-cero": 2, "ya-se": 6 },
  },
  {
    id: "memoria",
    title: "Dónde vive un valor",
    slugs: ["memoria", "puntero", "referencia", "propiedad-rust"],
    prioridad: { "desde-cero": 6, "ya-se": 1 },
  },
  {
    id: "alrededor",
    title: "Alrededor del código",
    slugs: [
      "funcion-matematica",
      "algoritmo",
      "lenguaje-programacion",
      "compilador",
      "mensaje",
      "prueba",
      "concurrencia",
    ],
    prioridad: { "desde-cero": 5, "ya-se": 5 },
  },
  {
    id: "arquitectura",
    title: "Arquitectura de software",
    slugs: ["arquitectura", "limites-modulos"],
    prioridad: { "desde-cero": 7, "ya-se": 3 },
  },
  {
    id: "distribuidos",
    title: "Sistemas distribuidos",
    slugs: ["consistencia", "idempotencia"],
    prioridad: { "desde-cero": 10, "ya-se": 4 },
  },
  {
    id: "bases-de-datos",
    title: "Bases de datos",
    slugs: ["transaccion", "indice"],
    prioridad: { "desde-cero": 8, "ya-se": 4 },
  },
  {
    id: "redes",
    title: "Redes",
    slugs: ["protocolo", "tiempo-de-espera"],
    prioridad: { "desde-cero": 9, "ya-se": 2 },
  },
  {
    id: "seguridad",
    title: "Seguridad defensiva",
    slugs: ["modelo-de-amenazas", "privilegio-minimo"],
    prioridad: { "desde-cero": 11, "ya-se": 6 },
  },
  {
    id: "pruebas",
    title: "Pruebas de software",
    slugs: ["prueba-automatizada", "prueba-integracion"],
    prioridad: { "desde-cero": 3, "ya-se": 3 },
  },
];

export const concepts: Concept[] = [
  {
    slug: "variable",
    title: "Variable",
    thread: "El programa, por dentro",
    summary: "Un nombre para un valor que el programa puede volver a usar.",
    body: [
      "Una variable no es una caja mágica ni «un espacio de memoria» la primera vez que hace falta entenderla. Es un nombre. Donde aparece el nombre, el programa habla de un valor.",
      "Ese valor puede cambiar. Por eso no es lo mismo el nombre que lo que guarda ahora. Si lees suma = suma + n, el suma de la derecha es el valor de antes; el de la izquierda es el nombre donde quedará el de después.",
      "El tipo, cuando el lenguaje lo tiene, dice qué operaciones tienen sentido. Sumar dos textos y sumar dos números no es la misma operación, aunque el signo se parezca. Si el lenguaje no anota el tipo, igual existe: se descubre cuando la operación no encaja.",
    ],
    code: {
      language: "Python",
      source: "suma = 0\nsuma = suma + 4",
      caption: "El mismo nombre, dos momentos. Primero vale 0. Después vale 4.",
    },
    relaciones: [
      { slug: "funcion", tipo: "adelante" },
      { slug: "memoria", tipo: "paralelo" },
      { slug: "referencia", tipo: "paralelo" },
    ],
  },
  {
    slug: "funcion",
    title: "Función",
    thread: "El programa, por dentro",
    summary: "Un trozo con nombre, entradas y un resultado, para no repetir el razonamiento.",
    body: [
      "Una función recoge unos pasos que tienen sentido juntos. Las entradas son los parámetros. Lo que devuelve es el resultado. Quien la llama no necesita ver los pasos cada vez, pero quien la lee sí debería poder reconstruirlos.",
      "El nombre es parte del significado. frecuencias dice más que f. Un mal nombre obliga a leer el cuerpo para saber qué promete. Un buen nombre no dispensa de leer el cuerpo: puede mentir.",
      "No toda función es una función matemática. Puede imprimir, borrar un archivo o cambiar una lista que le pasaron. Eso se llama efecto, y es lo primero que hay que buscar cuando el resultado «correcto» no explica lo que ocurrió.",
    ],
    relaciones: [
      { slug: "variable", tipo: "atras" },
      { slug: "funcion-matematica", tipo: "paralelo" },
      { slug: "prueba", tipo: "paralelo" },
    ],
    also: [{ href: "/matematicas/lineal", label: "Una función lineal, escrita como función" }],
  },
  {
    slug: "condicion",
    title: "Condición",
    thread: "El programa, por dentro",
    summary: "Una pregunta con dos respuestas, y dos caminos distintos.",
    body: [
      "if no repite y no calcula una fórmula. Pregunta, y según la respuesta ejecuta un bloque u otro. Todo lo que está fuera se ejecuta igual.",
      "La pregunta es una frase que vale verdadero o falso. Si escribes un número donde el lenguaje espera esa frase, unos lenguajes protestan y otros convierten el número por su cuenta. Conviene saber cuál de los dos estás leyendo.",
      "Las ramas anidadas se leen de fuera hacia dentro. Si ya no caben en la cabeza, a veces la condición se puede nombrar: vacío = len(numeros) == 0. El programa hace lo mismo. La lectura, no.",
    ],
    relaciones: [{ slug: "bucle", tipo: "adelante" }],
    also: [{ href: "/matematicas/logica", label: "La tabla de verdad detrás de un if" }],
  },
  {
    slug: "bucle",
    title: "Bucle",
    thread: "El programa, por dentro",
    summary: "Los mismos pasos, con datos distintos, mientras tenga sentido seguir.",
    body: [
      "Un bucle es la forma de no copiar la misma línea mil veces. for recorre una colección o un rango. while sigue mientras una condición sea cierta. Si esa condición no cambia dentro, el bucle no termina.",
      "Cada vuelta tiene un estado: el índice, el elemento, lo que llevas acumulado. Antes de entrar suele hacer falta un valor inicial. La suma empieza en 0 porque sumar cero no cambia el resultado. El producto empezaría en 1 por la misma razón.",
      "Dos bucles, uno dentro del otro, no son «dos veces más de trabajo». Si cada uno recorre n elementos, el de dentro se ejecuta n veces por cada vuelta del de fuera. Esa es la diferencia entre una lista y todas las parejas de la lista.",
    ],
    relaciones: [
      { slug: "condicion", tipo: "atras" },
      { slug: "complejidad", tipo: "paralelo" },
      { slug: "invariante", tipo: "paralelo" },
      { slug: "arreglo", tipo: "paralelo" },
    ],
    also: [{ href: "/matematicas/matrices", label: "El triple bucle de una multiplicación" }],
  },
  {
    slug: "recursion",
    title: "Recursión",
    thread: "Cuando la función se llama a sí misma",
    summary: "Resolver un caso usando el mismo procedimiento en un caso más pequeño.",
    body: [
      "Una función recursiva se llama a sí misma. No es un círculo vicioso si cada llamada se acerca a un caso que ya no llama: el caso base. Sin ese caso, las llamadas no paran.",
      "La definición de Fibonacci es recursiva porque F(n) se define con F(n−1) y F(n−2), y se corta en 0 y 1. El código que copia esa frase es correcto. Otra cosa es cuántas veces repite el mismo n.",
      "No todo lo recursivo debe escribirse recursivo. A veces un bucle dice lo mismo y gasta menos memoria de llamadas. La recursión se gana cuando la estructura ya es así: un árbol, una carpeta que contiene carpetas, una fórmula que se parte en dos.",
    ],
    relaciones: [
      { slug: "pila-de-llamadas", tipo: "adelante" },
      { slug: "funcion", tipo: "paralelo" },
      { slug: "complejidad", tipo: "paralelo" },
    ],
    also: [{ href: "/matematicas/fibonacci", label: "La recurrencia y la versión con memoria" }],
  },
  {
    slug: "pila-de-llamadas",
    title: "Pila de llamadas",
    thread: "Cuando la función se llama a sí misma",
    summary: "Cada llamada espera, con sus propios nombres, a que terminen las que abrió.",
    body: [
      "Cuando una función llama a otra, la primera no desaparece. Espera. El lenguaje guarda en una pila quién espera, en qué línea, y qué valían sus variables. Al terminar la llamada de dentro, se retoma la de fuera.",
      "En la recursión esa pila crece con cada paso hacia el caso base y mengua al volver. Por eso una recursión muy profunda puede quedarse sin espacio aunque la idea sea correcta. El fallo es de la forma de calcular, no de la definición.",
      "Leer una traza es leer esa pila en orden. No hace falta un depurador para la primera: con un n pequeño se puede escribir a mano quién llama a quién. Si no puedes hacerlo con n = 4, todavía no has entendido la función.",
    ],
    code: {
      language: "Texto",
      source: "subir(2)\n  subir(1)\n    subir(0) → 0\n  ← 1\n← 3",
      caption: "subir(n) devuelve n + subir(n - 1), y subir(0) devuelve 0. La pila espera.",
    },
    relaciones: [
      { slug: "recursion", tipo: "atras" },
      { slug: "memoria", tipo: "paralelo" },
      { slug: "variable", tipo: "paralelo" },
    ],
  },
  {
    slug: "complejidad",
    title: "Complejidad",
    thread: "Cuando la función se llama a sí misma",
    summary: "Cómo crece el trabajo cuando crecen los datos. No es un cronómetro.",
    body: [
      "Decir que un programa es lento no dice nada hasta que se dice lento respecto a qué. La complejidad mira cómo crece el número de pasos si la entrada pasa de n a 10n, no cuántos milisegundos tardó en un portátil.",
      "Un bucle sobre n elementos es proporcional a n, si el cuerpo no esconde otro recorrido. Un bucle dentro de otro, los dos sobre n, es proporcional a n². Partir el intervalo por la mitad, como en la búsqueda binaria, crece como el número de veces que puedes dividir n entre 2: el logaritmo.",
      "Una estimación leída de la forma del código no es una medición. Sirve para decidir si vale la pena cambiar el algoritmo antes de escribir una versión más difícil. Si n es 20, n² también es pequeño. La versión clara gana.",
    ],
    relaciones: [
      { slug: "pila-de-llamadas", tipo: "atras" },
      { slug: "bucle", tipo: "paralelo" },
      { slug: "arreglo", tipo: "paralelo" },
    ],
    also: [
      { href: "/matematicas/binaria", label: "Por qué partir por la mitad importa" },
      { href: "/matematicas/fibonacci", label: "La misma fórmula, dos costes" },
    ],
  },
  {
    slug: "arreglo",
    title: "Arreglo",
    thread: "Datos que se sostienen",
    summary: "Valores en fila, cada uno con una posición.",
    body: [
      "Un arreglo guarda valores uno detrás de otro. La posición es un número, casi siempre empezando en cero. El elemento 3 es el cuarto. Ese desfase es la causa de una cantidad absurda de errores, y se merece decirse en voz alta.",
      "Llegar a una posición conocida es barato: el lenguaje calcula dónde está sin recorrer los anteriores. Recorrer todos, no. Buscar un valor sin orden obliga a mirar, en el peor caso, todos.",
      "Si el arreglo está ordenado aparece otra posibilidad: tirar la mitad en cada paso. El orden es una propiedad que alguien tiene que haber conseguido y que el resto del programa no debe romper en silencio.",
    ],
    relaciones: [
      { slug: "bucle", tipo: "paralelo" },
      { slug: "diccionario", tipo: "adelante" },
      { slug: "invariante", tipo: "paralelo" },
    ],
    also: [{ href: "/matematicas/binaria", label: "Buscar en un arreglo ordenado" }],
  },
  {
    slug: "diccionario",
    title: "Diccionario",
    thread: "Datos que se sostienen",
    summary: "De una clave a un valor, sin recorrer la fila entera.",
    body: [
      "Un diccionario —mapa, hash, objeto, según el lenguaje— asocia una clave con un valor. Contar palabras es el ejemplo pequeño: la palabra es la clave y el número de veces, el valor.",
      "Buscar por clave no recorre todas las claves, salvo en una implementación ingenua. A cambio, las claves no están en el orden en que las pusiste, a menos que el lenguaje lo prometa. Si el orden importa, un diccionario solo no basta.",
      "La clave tiene que poder compararse de forma estable. En unos lenguajes puede ser un texto o un número. En otros, meter una lista como clave falla o no hace lo que crees, porque la lista puede cambiar después de usarla como clave.",
    ],
    relaciones: [
      { slug: "arreglo", tipo: "atras" },
      { slug: "variable", tipo: "paralelo" },
      { slug: "transaccion", tipo: "paralelo" },
    ],
    also: [{ href: "/lenguajes", label: "El mismo conteo en cada lenguaje comparable" }],
  },
  {
    slug: "invariante",
    title: "Invariante",
    thread: "Datos que se sostienen",
    summary: "Una frase que es verdad antes del bucle, en cada vuelta y al salir.",
    body: [
      "Un invariante es una frase sobre el estado del programa que te comprometes a mantener. No es un comentario decorativo. Es la razón por la que el bucle hace lo que crees.",
      "En la búsqueda binaria, la frase es: si el objetivo está en el arreglo, está entre low y high. Cada rama del if mueve low o high de forma que la frase siga siendo cierta. Cuando el intervalo queda vacío, la frase implica que no está.",
      "Cuando un bucle te pierde, no añadas prints al azar como primer recurso. Escribe la frase que debería ser verdad al empezar cada vuelta. Si no puedes escribirla, todavía no has entendido el bucle. Si puedes, el error suele ser la vuelta que la rompe.",
    ],
    relaciones: [
      { slug: "diccionario", tipo: "atras" },
      { slug: "bucle", tipo: "paralelo" },
      { slug: "prueba", tipo: "paralelo" },
      { slug: "arreglo", tipo: "paralelo" },
    ],
    also: [{ href: "/matematicas/binaria", label: "El invariante, paso a paso" }],
  },
  {
    slug: "memoria",
    title: "Memoria",
    thread: "Dónde vive un valor",
    summary: "Los valores ocupan sitio, duran un rato y alguien decide cuándo se van.",
    body: [
      "Un programa no solo tiene nombres. Tiene sitios donde esos valores están guardados mientras hacen falta. Ese sitio es finito. Por eso una lista que crece sin límite es un problema aunque la idea sea correcta.",
      "Hay valores que viven solo mientras dura una llamada, y valores que siguen después porque alguien los guardó en una estructura más larga. Confundir las dos cosas es la fuente de «aquí funcionaba y al volver ya no está».",
      "Unos lenguajes te obligan a decir quién libera ese sitio. Otros lo detectan cuando ya nadie puede nombrarlo. Ninguno adivina que ya no te importa una lista enorme a la que todavía apunta una variable. La memoria que se queda es, muchas veces, un nombre que sobra.",
    ],
    relaciones: [
      { slug: "puntero", tipo: "adelante" },
      { slug: "referencia", tipo: "paralelo" },
      { slug: "propiedad-rust", tipo: "paralelo" },
      { slug: "variable", tipo: "paralelo" },
    ],
  },
  {
    slug: "puntero",
    title: "Puntero",
    thread: "Dónde vive un valor",
    summary: "Una dirección. No es el valor: es dónde está.",
    body: [
      "En C, un puntero guarda una dirección de memoria. Seguirlo —desreferenciarlo— es ir a esa dirección y leer o escribir el valor. Si la dirección no apunta a un valor vivo, el programa lee basura o se cae. El lenguaje no te avisa antes.",
      "Eso existe porque a veces quieres que una función cambie un valor del llamador, o que una estructura señale a otra sin copiarla entera. El precio es que ahora hay dos preguntas: qué vale, y si el sitio sigue siendo válido.",
      "Un puntero no es una referencia de Java ni un préstamo de Rust, aunque se parezcan en un dibujo. La diferencia está en quién responde si el sitio ya no existe. En C, respondes tú. Por eso el mismo algoritmo, al pasarlo a C, gana un problema que en Python no se veía.",
    ],
    code: {
      language: "C",
      source: "void sumar_uno(int *n) {\n    *n = *n + 1;\n}",
      caption:
        "n es una dirección. *n es el entero que hay ahí. La función no devuelve el número: lo modifica donde vive.",
    },
    relaciones: [
      { slug: "memoria", tipo: "atras" },
      { slug: "referencia", tipo: "adelante" },
      { slug: "propiedad-rust", tipo: "paralelo" },
    ],
    also: [{ href: "/lenguajes", label: "Por qué el mismo conteo no cabe igual en C" }],
  },
  {
    slug: "referencia",
    title: "Referencia",
    thread: "Dónde vive un valor",
    summary: "Un nombre que habla de un valor que vive en otro sitio.",
    body: [
      "En varios lenguajes, una variable no contiene la lista: contiene una referencia a la lista. Copiar la variable copia la referencia. Las dos nombres ven los mismos cambios. Por eso una función puede modificar una lista que no devolvió.",
      "Con un número pequeño, muchos de esos lenguajes copian el valor de verdad. Cambiar el parámetro no cambia la variable del llamador. La regla no es «los objetos se pasan por referencia» dicha de memoria. La regla es: qué se copia y qué se comparte, en este lenguaje, con este tipo.",
      "En C++ una referencia es otro nombre para un objeto ya existente, y no se reasigna como un puntero. Se parece, y no es lo mismo. Si lees & y piensas que siempre significa «dirección», te vas a equivocar de lenguaje.",
    ],
    relaciones: [
      { slug: "puntero", tipo: "atras" },
      { slug: "propiedad-rust", tipo: "adelante" },
      { slug: "variable", tipo: "paralelo" },
      { slug: "memoria", tipo: "paralelo" },
    ],
  },
  {
    slug: "propiedad-rust",
    title: "Propiedad en Rust",
    thread: "Dónde vive un valor",
    summary: "Cada valor tiene un dueño. Si el dueño se va, el valor se va con él.",
    body: [
      "Rust pregunta, en el propio código, quién es responsable de un valor. Cuando asignas un String a otra variable, el dueño cambia. La variable vieja ya no se puede usar. No es una manía: es para que no haya dos sitios liberando la misma memoria, ni uno usándola después de liberarla.",
      "Un préstamo deja mirar —o modificar— sin llevarse la propiedad. El préstamo tiene que terminar antes de que el dueño desaparezca. El compilador rechaza programas donde eso no está claro. El error del compilador es, muchas veces, el programa diciendo «estos dos usos no pueden ser ciertos a la vez».",
      "Quien viene de Python echa de menos que las cosas «simplemente vivan». Viven igual. Lo que Python decide en silencio —y a veces tarde— Rust te lo hace escribir. El conteo de palabras necesita una String propia para la clave en minúsculas, porque el texto en minúsculas puede no caber en el préstamo del texto original.",
    ],
    relaciones: [
      { slug: "referencia", tipo: "atras" },
      { slug: "memoria", tipo: "paralelo" },
      { slug: "puntero", tipo: "paralelo" },
      { slug: "compilador", tipo: "paralelo" },
    ],
    also: [{ href: "/lenguajes", label: "El conteo de palabras, con dueño y préstamos" }],
  },
  {
    slug: "funcion-matematica",
    title: "Función matemática",
    thread: "Alrededor del código",
    summary: "Una regla que a cada entrada válida le hace corresponder una salida. Sin efectos.",
    body: [
      "En matemáticas, una función no imprime, no pregunta la hora y no modifica una lista global. Das un elemento del dominio y obtienes uno del codominio. La misma entrada, la misma salida.",
      "En programación se usa la misma palabra para algo más amplio. Conviene no mezclarlas cuando estás traduciendo. Si la fórmula es y = mx + b, la función de programa que la implementa debería limitarse a eso. Meter ahí un print ayuda a depurar y deja de ser la fórmula.",
      "El dominio también se traduce. La media no está definida para cero datos. La división no está definida para cero. Un tipo que acepta cualquier número miente si la fórmula no los acepta. El caso raro de la matemática es el if del programa.",
    ],
    relaciones: [
      { slug: "algoritmo", tipo: "adelante" },
      { slug: "funcion", tipo: "paralelo" },
      { slug: "prueba", tipo: "paralelo" },
    ],
    also: [{ href: "/matematicas", label: "Los puentes, de la fórmula al código" }],
  },
  {
    slug: "algoritmo",
    title: "Algoritmo",
    thread: "Alrededor del código",
    summary: "Una secuencia finita de pasos que transforma una entrada en una salida.",
    body: [
      "Un algoritmo no es un lenguaje ni una colección de líneas. Es el procedimiento: qué datos recibe, qué pasos aplica y qué resultado promete. Puede escribirse en pseudocódigo y luego expresarse en lenguajes distintos.",
      "Para leerlo, busca primero la promesa y los casos límite. Después sigue el estado en cada paso y estima cuánto trabajo crece con la entrada. La implementación puede ser correcta en sintaxis y aun así no cumplir esa promesa.",
    ],
    relaciones: [
      { slug: "funcion-matematica", tipo: "atras" },
      { slug: "lenguaje-programacion", tipo: "adelante" },
      { slug: "complejidad", tipo: "paralelo" },
      { slug: "prueba", tipo: "paralelo" },
      { slug: "arquitectura", tipo: "paralelo" },
    ],
  },
  {
    slug: "lenguaje-programacion",
    title: "Lenguaje de programación",
    thread: "Alrededor del código",
    summary:
      "Reglas para expresar pasos, datos y límites que una máquina puede comprobar o ejecutar.",
    body: [
      "Un lenguaje no cambia por renombrar palabras reservadas. Define cómo se representan los valores, qué operaciones existen, cuándo se detectan los errores y quién controla la duración de los datos.",
      "Por eso traducir literalmente un algoritmo puede cambiar su resultado o su seguridad. El comparador mantiene el problema y hace visibles los cambios de tipos, colecciones, memoria y concurrencia.",
    ],
    relaciones: [
      { slug: "algoritmo", tipo: "atras" },
      { slug: "compilador", tipo: "adelante" },
      { slug: "propiedad-rust", tipo: "paralelo" },
      { slug: "concurrencia", tipo: "paralelo" },
    ],
    also: [{ href: "/lenguajes", label: "Comparar el mismo problema entre lenguajes" }],
  },
  {
    slug: "compilador",
    title: "Compilador",
    thread: "Alrededor del código",
    summary: "Un programa que lee otro programa y lo traduce, o explica por qué no puede.",
    body: [
      "El texto que escribes no es lo que el procesador ejecuta. Un compilador, o un intérprete, lo lee, comprueba reglas y produce otra forma: máquina, bytecode, o acciones directas. El mensaje de error es ese programa diciendo en qué regla se detuvo.",
      "Leer un mensaje empieza por la primera línea que señala un sitio de tu archivo, no por la última, que a menudo es una consecuencia. Si dice que un tipo no encaja, hay dos preguntas: qué tipo esperaba y qué tipo le llegó. El resto es pista.",
      "En Estudio, «Lee el programa» describe la forma del texto. «Comprueba» aplica reglas de sintaxis y tipos a un programa del lenguaje Cifra. Pasar la comprobación confirma las reglas estáticas del lenguaje.",
    ],
    relaciones: [
      { slug: "lenguaje-programacion", tipo: "atras" },
      { slug: "mensaje", tipo: "adelante" },
      { slug: "propiedad-rust", tipo: "paralelo" },
      { slug: "prueba", tipo: "paralelo" },
      { slug: "memoria", tipo: "paralelo" },
    ],
  },
  {
    slug: "mensaje",
    title: "Mensaje de error",
    thread: "Alrededor del código",
    summary:
      "Un informe del programa que se detuvo. Se lee como un texto, antes de tocar el código.",
    body: [
      "Hay dos momentos y conviene distinguirlos. Los mensajes de lectura —un SyntaxError, un error de tipos— llegan antes de ejecutar y hablan de la forma del texto: un paréntesis, un nombre mal escrito, un tipo donde se esperaba otro. Los mensajes de ejecución llegan mientras el programa corre: una pila de llamadas, un índice que no existe, un valor nulo donde hacía falta uno.",
      "El mensaje nombra la regla violada y suele dar una línea. La línea no es la explicación: es el primer lugar que hay que leer, con lo que hay antes y después. Muchos fallos están una línea más arriba de donde el mensaje les echó la culpa con razón.",
      "Leer bien un mensaje es un hábito completo: qué dice y qué no garantiza, a qué parte del código apunta, qué entrada pequeña lo reproduciría. Si nadie lo ha mirado de verdad, pegar el error en un buscador no es leer; es delegar. El estudio del fallo existe para practicarlo con ayuda, no para sustituirlo.",
    ],
    relaciones: [
      { slug: "compilador", tipo: "atras" },
      { slug: "prueba", tipo: "adelante" },
      { slug: "pila-de-llamadas", tipo: "paralelo" },
    ],
    also: [{ href: "/estudio", label: "El estudio del fallo, paso a paso" }],
  },
  {
    slug: "prueba",
    title: "Prueba",
    thread: "Alrededor del código",
    summary: "Un ejemplo pequeño que dice qué debería pasar, y comprueba si pasa.",
    body: [
      "Una prueba es otro programa. Prepara una entrada, llama a la función y compara el resultado con lo que la definición promete. Si no tienes la promesa escrita, la prueba solo congela el comportamiento actual, incluido el fallo.",
      "El caso que suele faltar es el borde: la lista vacía, el cero, el único elemento, el elemento que no está. media([]) no tiene una respuesta numérica honesta. Una prueba que lo diga vale más que diez pruebas con listas cómodas.",
      "Cuando arreglas un fallo, la prueba que lo reproduce se queda. No es burocracia. Es la forma de que el siguiente cambio no lo traiga de vuelta en silencio. Si no puedes ejecutar todavía, escribir el caso en una frase ya ordena la búsqueda.",
    ],
    code: {
      language: "JavaScript",
      source: "media([10, 20]) === 15\nmedia([]) no debería devolver un número",
      caption: "Dos casos. El segundo es el que enseña. El primero solo confirma la fórmula.",
    },
    relaciones: [
      { slug: "mensaje", tipo: "atras" },
      { slug: "funcion", tipo: "paralelo" },
      { slug: "condicion", tipo: "paralelo" },
      { slug: "invariante", tipo: "paralelo" },
      { slug: "prueba-automatizada", tipo: "paralelo" },
    ],
    also: [{ href: "/estudio", label: "Llevar la media frágil al estudio" }],
  },
  {
    slug: "concurrencia",
    title: "Concurrencia",
    thread: "Alrededor del código",
    summary: "Más de una cosa a medias, y reglas para que no se pisen.",
    body: [
      "Concurrencia significa que hay tareas empezadas que no han terminado, y el programa avanza en otra. No implica varios procesadores. Implica que ya no puedes leer el código como una sola fila de pasos.",
      "JavaScript, en el navegador y en Node, atiende por un bucle de eventos: empieza una espera (la red, un temporizador) y mientras tanto sigue con lo demás. Dos funciones no ejecutan su cuerpo a la vez en ese hilo. Go puede ejecutar goroutines de verdad en paralelo, y entonces dos escrituras a la misma variable necesitan un acuerdo.",
      "El fallo típico no es «la concurrencia es difícil». Es dar por hecho un orden que el lenguaje no prometió. Si una explicación depende de qué tarea termina antes, hay que decirlo. Si no se ha ejecutado, ese orden es una deducción, no un hecho.",
    ],
    relaciones: [
      { slug: "variable", tipo: "paralelo" },
      { slug: "memoria", tipo: "paralelo" },
      { slug: "compilador", tipo: "paralelo" },
      { slug: "consistencia", tipo: "paralelo" },
      { slug: "idempotencia", tipo: "paralelo" },
    ],
    also: [{ href: "/lenguajes", label: "Qué cambia de un lenguaje a otro" }],
  },
  {
    slug: "arquitectura",
    title: "Arquitectura de software",
    thread: "Arquitectura de software",
    summary: "Las decisiones que distribuyen responsabilidades y límites en un sistema.",
    body: [
      "La arquitectura describe qué piezas existen, qué responsabilidad tiene cada una y por dónde se comunican. No es el dibujo de cajas: es el conjunto de decisiones que permite cambiar una pieza sin romper todas las demás.",
      "Una decisión arquitectónica se comprueba siguiendo un cambio concreto: qué archivos, datos y pruebas tendrían que tocarse. Si una regla de negocio aparece duplicada en tres capas, el límite entre ellas no está haciendo su trabajo.",
    ],
    relaciones: [
      { slug: "limites-modulos", tipo: "adelante" },
      { slug: "algoritmo", tipo: "paralelo" },
      { slug: "prueba-integracion", tipo: "paralelo" },
    ],
  },
  {
    slug: "limites-modulos",
    title: "Límites entre módulos",
    thread: "Arquitectura de software",
    summary: "Contratos pequeños que dejan colaborar a las piezas sin compartirlo todo.",
    body: [
      "Un módulo expone lo que otra pieza necesita y oculta sus decisiones internas. El contrato puede ser una función, un tipo o un formato de mensaje; debe decir qué acepta y qué garantiza.",
      "Si cada cambio interno obliga a editar a todos los consumidores, el límite es demasiado débil o expone detalles. Si el contrato oculta una condición importante, el error aparece lejos de donde nació.",
    ],
    relaciones: [
      { slug: "arquitectura", tipo: "atras" },
      { slug: "compilador", tipo: "paralelo" },
      { slug: "propiedad-rust", tipo: "paralelo" },
    ],
  },
  {
    slug: "consistencia",
    title: "Consistencia distribuida",
    thread: "Sistemas distribuidos",
    summary: "Qué valor puede observar cada parte cuando varias copias cambian con retraso.",
    body: [
      "En un sistema distribuido, una escritura puede llegar a una máquina antes que a otra. «Se guardó» necesita una definición: ¿la recibió un nodo, una mayoría o todas las copias? La respuesta determina qué puede leer la siguiente petición.",
      "No existe una política que quite todos los retrasos y a la vez mantenga todas las garantías ante cualquier caída. El diseño declara qué se prioriza y las pruebas recorren lecturas y escrituras con mensajes demorados o repetidos.",
    ],
    relaciones: [
      { slug: "idempotencia", tipo: "adelante" },
      { slug: "concurrencia", tipo: "paralelo" },
      { slug: "transaccion", tipo: "paralelo" },
      { slug: "protocolo", tipo: "paralelo" },
    ],
  },
  {
    slug: "idempotencia",
    title: "Idempotencia",
    thread: "Sistemas distribuidos",
    summary: "Repetir una operación no cambia el efecto que ya produjo.",
    body: [
      "Una petición puede llegar al servidor y perderse su respuesta. Quien la envía no sabe si debe reintentar. Si la operación es idempotente, repetirla deja el mismo estado final que ejecutarla una vez.",
      "No basta con que el nombre diga «actualizar». Un cobro que suma dinero no es idempotente por sí solo. Una clave de operación registrada y una respuesta reutilizable permiten reconocer el reintento sin ejecutar el efecto dos veces.",
    ],
    relaciones: [
      { slug: "consistencia", tipo: "atras" },
      { slug: "prueba-integracion", tipo: "paralelo" },
      { slug: "tiempo-de-espera", tipo: "paralelo" },
    ],
  },
  {
    slug: "transaccion",
    title: "Transacción",
    thread: "Bases de datos",
    summary: "Un grupo de cambios que se confirma completo o no deja cambios parciales.",
    body: [
      "Una transferencia resta de una cuenta y suma en otra. Si el proceso se detiene entre ambas operaciones, el dato queda incoherente. Una transacción agrupa los cambios: se confirman juntos o se revierten juntos.",
      "La atomicidad no reemplaza las reglas del dominio. La aplicación todavía debe comprobar saldo, permisos y formato antes de confirmar. Las pruebas deben forzar también el fallo entre pasos, no solo el camino feliz.",
    ],
    relaciones: [
      { slug: "indice", tipo: "adelante" },
      { slug: "invariante", tipo: "paralelo" },
      { slug: "consistencia", tipo: "paralelo" },
      { slug: "prueba-integracion", tipo: "paralelo" },
    ],
  },
  {
    slug: "indice",
    title: "Índice de base de datos",
    thread: "Bases de datos",
    summary: "Una estructura adicional que permite encontrar filas sin revisar toda la tabla.",
    body: [
      "Un índice guarda una ruta ordenada o resumida hacia ciertos valores. Puede convertir una búsqueda que revisaba muchas filas en otra que visita solo una fracción, pero ocupa espacio y hay que mantenerlo al insertar o modificar datos.",
      "El índice útil depende de la consulta real, el orden de las columnas y cuántas filas coinciden. No se deduce por el nombre del campo: se comprueba con el plan de ejecución y mediciones representativas.",
    ],
    relaciones: [
      { slug: "transaccion", tipo: "atras" },
      { slug: "complejidad", tipo: "paralelo" },
      { slug: "arreglo", tipo: "paralelo" },
    ],
  },
  {
    slug: "protocolo",
    title: "Protocolo de red",
    thread: "Redes",
    summary: "Un acuerdo sobre los mensajes, su orden y lo que significa cada respuesta.",
    body: [
      "Un protocolo define cómo se inicia una conversación, cómo se identifica cada mensaje y qué respuesta indica éxito o error. Cliente y servidor pueden estar escritos en lenguajes distintos porque ambos obedecen el mismo formato.",
      "El código debe validar lo recibido como entrada externa. Una conexión no garantiza que el mensaje esté completo, sea válido o llegue una sola vez. Esas condiciones pertenecen al contrato, no a una suposición del lector.",
    ],
    relaciones: [
      { slug: "tiempo-de-espera", tipo: "adelante" },
      { slug: "consistencia", tipo: "paralelo" },
      { slug: "modelo-de-amenazas", tipo: "paralelo" },
    ],
  },
  {
    slug: "tiempo-de-espera",
    title: "Tiempo de espera y reintentos",
    thread: "Redes",
    summary: "Un límite para dejar de esperar y una política para decidir si volver a pedir.",
    body: [
      "Una petición puede tardar porque el servidor trabaja, la red se demora o la respuesta se perdió. Un tiempo de espera limita cuánto recurso queda ocupado; no demuestra que la operación remota haya fallado.",
      "Reintentar solo es seguro si se conoce el efecto de repetir la operación. El límite debe ser finito y la espera entre intentos no debe multiplicar una caída del servicio. Con idempotencia, los reintentos pueden ser parte de un contrato verificable.",
    ],
    relaciones: [
      { slug: "protocolo", tipo: "atras" },
      { slug: "idempotencia", tipo: "paralelo" },
      { slug: "consistencia", tipo: "paralelo" },
    ],
  },
  {
    slug: "modelo-de-amenazas",
    title: "Modelo de amenazas",
    thread: "Seguridad defensiva",
    summary: "Una lista razonada de qué se protege, de quién y por dónde podría fallar.",
    body: [
      "Un modelo de amenazas empieza por los activos y los límites de confianza. Después enumera capacidades plausibles de un atacante y los caminos que podrían llevar a una lectura, un cambio o una interrupción no permitidos.",
      "No es una lista universal de ataques ni una promesa de seguridad. Sirve para elegir controles y pruebas que correspondan al sistema: validar entradas, limitar recursos, proteger secretos y revisar cada frontera.",
    ],
    relaciones: [
      { slug: "privilegio-minimo", tipo: "adelante" },
      { slug: "protocolo", tipo: "paralelo" },
      { slug: "limites-modulos", tipo: "paralelo" },
    ],
  },
  {
    slug: "privilegio-minimo",
    title: "Privilegio mínimo",
    thread: "Seguridad defensiva",
    summary: "Cada pieza recibe solo los permisos que necesita para hacer su trabajo.",
    body: [
      "Si un proceso solo lee un conjunto de datos, no debería poder borrar toda la base. Reducir permisos limita el daño de un error, una clave expuesta o una cuenta comprometida.",
      "El control se prueba desde cada identidad y cada ruta: qué puede leer, modificar y ejecutar. Los permisos amplios que «por ahora funcionan» son dependencias ocultas que luego son difíciles de retirar.",
    ],
    relaciones: [
      { slug: "modelo-de-amenazas", tipo: "atras" },
      { slug: "limites-modulos", tipo: "paralelo" },
      { slug: "prueba-integracion", tipo: "paralelo" },
    ],
  },
  {
    slug: "prueba-automatizada",
    title: "Prueba automatizada",
    thread: "Pruebas de software",
    summary: "Una comprobación repetible que contrasta el resultado con una promesa explícita.",
    body: [
      "Una prueba automatizada prepara datos, ejecuta una acción y compara el resultado con lo que el contrato dice que debe ocurrir. El resultado solo vale para los casos que realmente ejecutó.",
      "Un conjunto útil combina el caso habitual con bordes, errores y regresiones conocidas. Si una prueba repite exactamente la implementación, puede confirmar el mismo error en lugar de descubrirlo.",
    ],
    relaciones: [
      { slug: "prueba-integracion", tipo: "adelante" },
      { slug: "prueba", tipo: "paralelo" },
      { slug: "invariante", tipo: "paralelo" },
      { slug: "algoritmo", tipo: "paralelo" },
    ],
  },
  {
    slug: "prueba-integracion",
    title: "Prueba de integración",
    thread: "Pruebas de software",
    summary: "Una comprobación de que varias piezas cumplen su contrato al trabajar juntas.",
    body: [
      "Una función puede pasar su prueba aislada y fallar al conectarse con la base de datos, la red o quien la llama. Una prueba de integración recorre esa frontera y comprueba el formato, los errores y los efectos visibles.",
      "No hace falta levantar todo el sistema para cada caso. Se elige el límite que aporta evidencia útil y se evita que la prueba dependa de servicios externos inestables o datos personales.",
    ],
    relaciones: [
      { slug: "prueba-automatizada", tipo: "atras" },
      { slug: "arquitectura", tipo: "paralelo" },
      { slug: "transaccion", tipo: "paralelo" },
      { slug: "idempotencia", tipo: "paralelo" },
    ],
  },
];

const bySlug = new Map(concepts.map((concept) => [concept.slug, concept]));

export function getConcept(slug: string): Concept | undefined {
  return bySlug.get(slug);
}

export function threadOf(slug: string) {
  return threads.find((thread) => thread.slugs.includes(slug));
}

export function validateKnowledgeGraph(): string[] {
  const issues: string[] = [];
  const adjacency = new Map(concepts.map(({ slug }) => [slug, new Set<string>()]));
  const memberships = new Map<string, number>();

  for (const thread of threads) {
    for (const slug of thread.slugs) {
      memberships.set(slug, (memberships.get(slug) ?? 0) + 1);
      if (!bySlug.has(slug))
        issues.push(`El hilo ${thread.id} apunta al concepto ausente ${slug}.`);
    }
  }

  for (const concept of concepts) {
    if (memberships.get(concept.slug) !== 1) {
      issues.push(`${concept.slug} debe aparecer en un solo hilo.`);
    }
    if (threadOf(concept.slug)?.title !== concept.thread) {
      issues.push(`${concept.slug} no coincide con el título de su hilo.`);
    }
    if (concept.relaciones.length === 0) {
      issues.push(`${concept.slug} no tiene relaciones.`);
      continue;
    }

    const destinations = new Set<string>();
    for (const relation of concept.relaciones) {
      if (destinations.has(relation.slug)) {
        issues.push(`${concept.slug} repite la relación con ${relation.slug}.`);
      }
      destinations.add(relation.slug);

      const target = adjacency.get(relation.slug);
      if (!target) {
        issues.push(`${concept.slug} apunta al concepto ausente ${relation.slug}.`);
        continue;
      }
      adjacency.get(concept.slug)?.add(relation.slug);
      target.add(concept.slug);
      if (!["adelante", "atras", "paralelo"].includes(relation.tipo)) {
        issues.push(`${concept.slug} tiene una relación sin tipo válido.`);
      }
    }
  }

  if (concepts.length > 0) {
    const pending = [concepts[0].slug];
    const visited = new Set<string>();
    while (pending.length > 0) {
      const slug = pending.pop();
      if (!slug || visited.has(slug)) continue;
      visited.add(slug);
      for (const neighbor of adjacency.get(slug) ?? []) {
        if (!visited.has(neighbor)) pending.push(neighbor);
      }
    }
    for (const concept of concepts) {
      if (!visited.has(concept.slug)) issues.push(`${concept.slug} no se alcanza desde la red.`);
    }
  }

  return issues;
}

export function recommendNextConcept(
  read: readonly string[],
  difficult: readonly string[],
  plan: LearningPlan,
): { concept: Concept; thread: Thread; motivo: "repaso" | "nuevo" } | null {
  const orderedThreads = [...threads].sort((a, b) => a.prioridad[plan] - b.prioridad[plan]);
  const readSet = new Set(read);
  const difficultSet = new Set(difficult);

  for (const thread of orderedThreads) {
    const slug = thread.slugs.find((item) => readSet.has(item) && difficultSet.has(item));
    const concept = slug ? getConcept(slug) : undefined;
    if (concept) return { concept, thread, motivo: "repaso" };
  }

  const lastRead = [...read]
    .reverse()
    .map(getConcept)
    .find((concept) => concept !== undefined);
  const currentThread = lastRead ? threadOf(lastRead.slug) : undefined;
  const currentPosition = currentThread?.slugs.indexOf(lastRead?.slug ?? "") ?? -1;
  const nextInThread = currentThread?.slugs
    .slice(currentPosition + 1)
    .find((slug) => !readSet.has(slug));
  const nextConcept = nextInThread ? getConcept(nextInThread) : undefined;
  if (currentThread && nextConcept) {
    return { concept: nextConcept, thread: currentThread, motivo: "nuevo" };
  }

  for (const thread of orderedThreads) {
    const slug = thread.slugs.find((item) => !readSet.has(item));
    const concept = slug ? getConcept(slug) : undefined;
    if (concept) return { concept, thread, motivo: "nuevo" };
  }

  return null;
}
