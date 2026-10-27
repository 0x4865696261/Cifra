//#region node_modules/.nitro/vite/services/ssr/assets/concepts-cn_FJEPI.js
var threads = [
	{
		id: "dentro",
		title: "El programa, por dentro",
		slugs: [
			"variable",
			"funcion",
			"condicion",
			"bucle"
		]
	},
	{
		id: "vuelta",
		title: "Cuando la función se llama a sí misma",
		slugs: [
			"recursion",
			"pila-de-llamadas",
			"complejidad"
		]
	},
	{
		id: "datos",
		title: "Datos que se sostienen",
		slugs: [
			"arreglo",
			"diccionario",
			"invariante"
		]
	},
	{
		id: "memoria",
		title: "Dónde vive un valor",
		slugs: [
			"memoria",
			"puntero",
			"referencia",
			"propiedad-rust"
		]
	},
	{
		id: "alrededor",
		title: "Alrededor del código",
		slugs: [
			"funcion-matematica",
			"compilador",
			"prueba",
			"concurrencia"
		]
	}
];
var concepts = [
	{
		slug: "variable",
		title: "Variable",
		thread: "El programa, por dentro",
		summary: "Un nombre para un valor que el programa puede volver a usar.",
		body: [
			"Una variable no es una caja mágica ni «un espacio de memoria» la primera vez que hace falta entenderla. Es un nombre. Donde aparece el nombre, el programa habla de un valor.",
			"Ese valor puede cambiar. Por eso no es lo mismo el nombre que lo que guarda ahora. Si lees suma = suma + n, el suma de la derecha es el valor de antes; el de la izquierda es el nombre donde quedará el de después.",
			"El tipo, cuando el lenguaje lo tiene, dice qué operaciones tienen sentido. Sumar dos textos y sumar dos números no es la misma operación, aunque el signo se parezca. Si el lenguaje no anota el tipo, igual existe: se descubre cuando la operación no encaja."
		],
		code: {
			language: "Python",
			source: "suma = 0\nsuma = suma + 4",
			caption: "El mismo nombre, dos momentos. Primero vale 0. Después vale 4."
		},
		see: [
			"funcion",
			"memoria",
			"referencia"
		]
	},
	{
		slug: "funcion",
		title: "Función",
		thread: "El programa, por dentro",
		summary: "Un trozo con nombre, entradas y un resultado, para no repetir el razonamiento.",
		body: [
			"Una función recoge unos pasos que tienen sentido juntos. Las entradas son los parámetros. Lo que devuelve es el resultado. Quien la llama no necesita ver los pasos cada vez, pero quien la lee sí debería poder reconstruirlos.",
			"El nombre es parte del significado. frecuencias dice más que f. Un mal nombre obliga a leer el cuerpo para saber qué promete. Un buen nombre no dispensa de leer el cuerpo: puede mentir.",
			"No toda función es una función matemática. Puede imprimir, borrar un archivo o cambiar una lista que le pasaron. Eso se llama efecto, y es lo primero que hay que buscar cuando el resultado «correcto» no explica lo que ocurrió."
		],
		see: [
			"variable",
			"funcion-matematica",
			"prueba"
		],
		also: [{
			href: "/matematicas/lineal",
			label: "Una función lineal, escrita como función"
		}]
	},
	{
		slug: "condicion",
		title: "Condición",
		thread: "El programa, por dentro",
		summary: "Una pregunta con dos respuestas, y dos caminos distintos.",
		body: [
			"if no repite y no calcula una fórmula. Pregunta, y según la respuesta ejecuta un bloque u otro. Todo lo que está fuera se ejecuta igual.",
			"La pregunta es una frase que vale verdadero o falso. Si escribes un número donde el lenguaje espera esa frase, unos lenguajes protestan y otros convierten el número por su cuenta. Conviene saber cuál de los dos estás leyendo.",
			"Las ramas anidadas se leen de fuera hacia dentro. Si ya no caben en la cabeza, a veces la condición se puede nombrar: vacío = len(numeros) == 0. El programa hace lo mismo. La lectura, no."
		],
		see: ["bucle"],
		also: [{
			href: "/matematicas/logica",
			label: "La tabla de verdad detrás de un if"
		}]
	},
	{
		slug: "bucle",
		title: "Bucle",
		thread: "El programa, por dentro",
		summary: "Los mismos pasos, con datos distintos, mientras tenga sentido seguir.",
		body: [
			"Un bucle es la forma de no copiar la misma línea mil veces. for recorre una colección o un rango. while sigue mientras una condición sea cierta. Si esa condición no cambia dentro, el bucle no termina.",
			"Cada vuelta tiene un estado: el índice, el elemento, lo que llevas acumulado. Antes de entrar suele hacer falta un valor inicial. La suma empieza en 0 porque sumar cero no cambia el resultado. El producto empezaría en 1 por la misma razón.",
			"Dos bucles, uno dentro del otro, no son «dos veces más de trabajo». Si cada uno recorre n elementos, el de dentro se ejecuta n veces por cada vuelta del de fuera. Esa es la diferencia entre una lista y todas las parejas de la lista."
		],
		see: [
			"complejidad",
			"invariante",
			"arreglo"
		],
		also: [{
			href: "/matematicas/matrices",
			label: "El triple bucle de una multiplicación"
		}]
	},
	{
		slug: "recursion",
		title: "Recursión",
		thread: "Cuando la función se llama a sí misma",
		summary: "Resolver un caso usando el mismo procedimiento en un caso más pequeño.",
		body: [
			"Una función recursiva se llama a sí misma. No es un círculo vicioso si cada llamada se acerca a un caso que ya no llama: el caso base. Sin ese caso, las llamadas no paran.",
			"La definición de Fibonacci es recursiva porque F(n) se define con F(n−1) y F(n−2), y se corta en 0 y 1. El código que copia esa frase es correcto. Otra cosa es cuántas veces repite el mismo n.",
			"No todo lo recursivo debe escribirse recursivo. A veces un bucle dice lo mismo y gasta menos memoria de llamadas. La recursión se gana cuando la estructura ya es así: un árbol, una carpeta que contiene carpetas, una fórmula que se parte en dos."
		],
		see: [
			"pila-de-llamadas",
			"funcion",
			"complejidad"
		],
		also: [{
			href: "/matematicas/fibonacci",
			label: "La recurrencia y la versión con memoria"
		}]
	},
	{
		slug: "pila-de-llamadas",
		title: "Pila de llamadas",
		thread: "Cuando la función se llama a sí misma",
		summary: "Cada llamada espera, con sus propios nombres, a que terminen las que abrió.",
		body: [
			"Cuando una función llama a otra, la primera no desaparece. Espera. El lenguaje guarda en una pila quién espera, en qué línea, y qué valían sus variables. Al terminar la llamada de dentro, se retoma la de fuera.",
			"En la recursión esa pila crece con cada paso hacia el caso base y mengua al volver. Por eso una recursión muy profunda puede quedarse sin espacio aunque la idea sea correcta. El fallo es de la forma de calcular, no de la definición.",
			"Leer una traza es leer esa pila en orden. No hace falta un depurador para la primera: con un n pequeño se puede escribir a mano quién llama a quién. Si no puedes hacerlo con n = 4, todavía no has entendido la función."
		],
		code: {
			language: "Texto",
			source: "subir(2)\n  subir(1)\n    subir(0) → 0\n  ← 1\n← 3",
			caption: "subir(n) devuelve n + subir(n - 1), y subir(0) devuelve 0. La pila espera."
		},
		see: [
			"recursion",
			"memoria",
			"variable"
		]
	},
	{
		slug: "complejidad",
		title: "Complejidad",
		thread: "Cuando la función se llama a sí misma",
		summary: "Cómo crece el trabajo cuando crecen los datos. No es un cronómetro.",
		body: [
			"Decir que un programa es lento no dice nada hasta que se dice lento respecto a qué. La complejidad mira cómo crece el número de pasos si la entrada pasa de n a 10n, no cuántos milisegundos tardó en un portátil.",
			"Un bucle sobre n elementos es proporcional a n, si el cuerpo no esconde otro recorrido. Un bucle dentro de otro, los dos sobre n, es proporcional a n². Partir el intervalo por la mitad, como en la búsqueda binaria, crece como el número de veces que puedes dividir n entre 2: el logaritmo.",
			"Una estimación leída de la forma del código no es una medición. Sirve para decidir si vale la pena cambiar el algoritmo antes de escribir una versión más difícil. Si n es 20, n² también es pequeño. La versión clara gana."
		],
		see: ["bucle", "arreglo"],
		also: [{
			href: "/matematicas/binaria",
			label: "Por qué partir por la mitad importa"
		}, {
			href: "/matematicas/fibonacci",
			label: "La misma fórmula, dos costes"
		}]
	},
	{
		slug: "arreglo",
		title: "Arreglo",
		thread: "Datos que se sostienen",
		summary: "Valores en fila, cada uno con una posición.",
		body: [
			"Un arreglo guarda valores uno detrás de otro. La posición es un número, casi siempre empezando en cero. El elemento 3 es el cuarto. Ese desfase es la causa de una cantidad absurda de errores, y se merece decirse en voz alta.",
			"Llegar a una posición conocida es barato: el lenguaje calcula dónde está sin recorrer los anteriores. Recorrer todos, no. Buscar un valor sin orden obliga a mirar, en el peor caso, todos.",
			"Si el arreglo está ordenado aparece otra posibilidad: tirar la mitad en cada paso. El orden es una propiedad que alguien tiene que haber conseguido y que el resto del programa no debe romper en silencio."
		],
		see: [
			"bucle",
			"diccionario",
			"invariante"
		],
		also: [{
			href: "/matematicas/binaria",
			label: "Buscar en un arreglo ordenado"
		}]
	},
	{
		slug: "diccionario",
		title: "Diccionario",
		thread: "Datos que se sostienen",
		summary: "De una clave a un valor, sin recorrer la fila entera.",
		body: [
			"Un diccionario —mapa, hash, objeto, según el lenguaje— asocia una clave con un valor. Contar palabras es el ejemplo pequeño: la palabra es la clave y el número de veces, el valor.",
			"Buscar por clave no recorre todas las claves, salvo en una implementación ingenua. A cambio, las claves no están en el orden en que las pusiste, a menos que el lenguaje lo prometa. Si el orden importa, un diccionario solo no basta.",
			"La clave tiene que poder compararse de forma estable. En unos lenguajes puede ser un texto o un número. En otros, meter una lista como clave falla o no hace lo que crees, porque la lista puede cambiar después de usarla como clave."
		],
		see: ["arreglo", "variable"],
		also: [{
			href: "/lenguajes",
			label: "El mismo conteo en cinco lenguajes"
		}]
	},
	{
		slug: "invariante",
		title: "Invariante",
		thread: "Datos que se sostienen",
		summary: "Una frase que es verdad antes del bucle, en cada vuelta y al salir.",
		body: [
			"Un invariante es una frase sobre el estado del programa que te comprometes a mantener. No es un comentario decorativo. Es la razón por la que el bucle hace lo que crees.",
			"En la búsqueda binaria, la frase es: si el objetivo está en el arreglo, está entre low y high. Cada rama del if mueve low o high de forma que la frase siga siendo cierta. Cuando el intervalo queda vacío, la frase implica que no está.",
			"Cuando un bucle te pierde, no añadas prints al azar como primer recurso. Escribe la frase que debería ser verdad al empezar cada vuelta. Si no puedes escribirla, todavía no has entendido el bucle. Si puedes, el error suele ser la vuelta que la rompe."
		],
		see: [
			"bucle",
			"prueba",
			"arreglo"
		],
		also: [{
			href: "/matematicas/binaria",
			label: "El invariante, paso a paso"
		}]
	},
	{
		slug: "memoria",
		title: "Memoria",
		thread: "Dónde vive un valor",
		summary: "Los valores ocupan sitio, duran un rato y alguien decide cuándo se van.",
		body: [
			"Un programa no solo tiene nombres. Tiene sitios donde esos valores están guardados mientras hacen falta. Ese sitio es finito. Por eso una lista que crece sin límite es un problema aunque la idea sea correcta.",
			"Hay valores que viven solo mientras dura una llamada, y valores que siguen después porque alguien los guardó en una estructura más larga. Confundir las dos cosas es la fuente de «aquí funcionaba y al volver ya no está».",
			"Unos lenguajes te obligan a decir quién libera ese sitio. Otros lo detectan cuando ya nadie puede nombrarlo. Ninguno adivina que ya no te importa una lista enorme a la que todavía apunta una variable. La memoria que se queda es, muchas veces, un nombre que sobra."
		],
		see: [
			"puntero",
			"referencia",
			"propiedad-rust",
			"variable"
		]
	},
	{
		slug: "puntero",
		title: "Puntero",
		thread: "Dónde vive un valor",
		summary: "Una dirección. No es el valor: es dónde está.",
		body: [
			"En C, un puntero guarda una dirección de memoria. Seguirlo —desreferenciarlo— es ir a esa dirección y leer o escribir el valor. Si la dirección no apunta a un valor vivo, el programa lee basura o se cae. El lenguaje no te avisa antes.",
			"Eso existe porque a veces quieres que una función cambie un valor del llamador, o que una estructura señale a otra sin copiarla entera. El precio es que ahora hay dos preguntas: qué vale, y si el sitio sigue siendo válido.",
			"Un puntero no es una referencia de Java ni un préstamo de Rust, aunque se parezcan en un dibujo. La diferencia está en quién responde si el sitio ya no existe. En C, respondes tú. Por eso el mismo algoritmo, al pasarlo a C, gana un problema que en Python no se veía."
		],
		code: {
			language: "C",
			source: "void sumar_uno(int *n) {\n    *n = *n + 1;\n}",
			caption: "n es una dirección. *n es el entero que hay ahí. La función no devuelve el número: lo modifica donde vive."
		},
		see: [
			"memoria",
			"referencia",
			"propiedad-rust"
		],
		also: [{
			href: "/lenguajes",
			label: "Por qué el mismo conteo no cabe igual en C"
		}]
	},
	{
		slug: "referencia",
		title: "Referencia",
		thread: "Dónde vive un valor",
		summary: "Un nombre que habla de un valor que vive en otro sitio.",
		body: [
			"En varios lenguajes, una variable no contiene la lista: contiene una referencia a la lista. Copiar la variable copia la referencia. Las dos nombres ven los mismos cambios. Por eso una función puede modificar una lista que no devolvió.",
			"Con un número pequeño, muchos de esos lenguajes copian el valor de verdad. Cambiar el parámetro no cambia la variable del llamador. La regla no es «los objetos se pasan por referencia» dicha de memoria. La regla es: qué se copia y qué se comparte, en este lenguaje, con este tipo.",
			"En C++ una referencia es otro nombre para un objeto ya existente, y no se reasigna como un puntero. Se parece, y no es lo mismo. Si lees & y piensas que siempre significa «dirección», te vas a equivocar de lenguaje."
		],
		see: [
			"puntero",
			"variable",
			"memoria"
		]
	},
	{
		slug: "propiedad-rust",
		title: "Propiedad en Rust",
		thread: "Dónde vive un valor",
		summary: "Cada valor tiene un dueño. Si el dueño se va, el valor se va con él.",
		body: [
			"Rust pregunta, en el propio código, quién es responsable de un valor. Cuando asignas un String a otra variable, el dueño cambia. La variable vieja ya no se puede usar. No es una manía: es para que no haya dos sitios liberando la misma memoria, ni uno usándola después de liberarla.",
			"Un préstamo deja mirar —o modificar— sin llevarse la propiedad. El préstamo tiene que terminar antes de que el dueño desaparezca. El compilador rechaza programas donde eso no está claro. El error del compilador es, muchas veces, el programa diciendo «estos dos usos no pueden ser ciertos a la vez».",
			"Quien viene de Python echa de menos que las cosas «simplemente vivan». Viven igual. Lo que Python decide en silencio —y a veces tarde— Rust te lo hace escribir. El conteo de palabras necesita una String propia para la clave en minúsculas, porque el texto en minúsculas puede no caber en el préstamo del texto original."
		],
		see: [
			"memoria",
			"puntero",
			"compilador"
		],
		also: [{
			href: "/lenguajes",
			label: "El conteo de palabras, con dueño y préstamos"
		}]
	},
	{
		slug: "funcion-matematica",
		title: "Función matemática",
		thread: "Alrededor del código",
		summary: "Una regla que a cada entrada válida le hace corresponder una salida. Sin efectos.",
		body: [
			"En matemáticas, una función no imprime, no pregunta la hora y no modifica una lista global. Das un elemento del dominio y obtienes uno del codominio. La misma entrada, la misma salida.",
			"En programación se usa la misma palabra para algo más amplio. Conviene no mezclarlas cuando estás traduciendo. Si la fórmula es y = mx + b, la función de programa que la implementa debería limitarse a eso. Meter ahí un print ayuda a depurar y deja de ser la fórmula.",
			"El dominio también se traduce. La media no está definida para cero datos. La división no está definida para cero. Un tipo que acepta cualquier número miente si la fórmula no los acepta. El caso raro de la matemática es el if del programa."
		],
		see: [
			"funcion",
			"condicion",
			"prueba"
		],
		also: [{
			href: "/matematicas",
			label: "Los puentes, de la fórmula al código"
		}]
	},
	{
		slug: "compilador",
		title: "Compilador",
		thread: "Alrededor del código",
		summary: "Un programa que lee otro programa y lo traduce, o explica por qué no puede.",
		body: [
			"El texto que escribes no es lo que el procesador ejecuta. Un compilador, o un intérprete, lo lee, comprueba reglas y produce otra forma: máquina, bytecode, o acciones directas. El mensaje de error es ese programa diciendo en qué regla se detuvo.",
			"Leer un mensaje empieza por la primera línea que señala un sitio de tu archivo, no por la última, que a menudo es una consecuencia. Si dice que un tipo no encaja, hay dos preguntas: qué tipo esperaba y qué tipo le llegó. El resto es pista.",
			"El análisis de Cifra no es un compilador. No comprueba tipos, no ejecuta y no promete que el programa arranque. Mira la forma del texto. Confundir las dos cosas es justo el error que esta plataforma intenta no cometer."
		],
		see: [
			"propiedad-rust",
			"prueba",
			"memoria"
		]
	},
	{
		slug: "prueba",
		title: "Prueba",
		thread: "Alrededor del código",
		summary: "Un ejemplo pequeño que dice qué debería pasar, y comprueba si pasa.",
		body: [
			"Una prueba es otro programa. Prepara una entrada, llama a la función y compara el resultado con lo que la definición promete. Si no tienes la promesa escrita, la prueba solo congela el comportamiento actual, incluido el fallo.",
			"El caso que suele faltar es el borde: la lista vacía, el cero, el único elemento, el elemento que no está. media([]) no tiene una respuesta numérica honesta. Una prueba que lo diga vale más que diez pruebas con listas cómodas.",
			"Cuando arreglas un fallo, la prueba que lo reproduce se queda. No es burocracia. Es la forma de que el siguiente cambio no lo traiga de vuelta en silencio. Si no puedes ejecutar todavía, escribir el caso en una frase ya ordena la búsqueda."
		],
		code: {
			language: "JavaScript",
			source: "media([10, 20]) === 15\nmedia([]) no debería devolver un número",
			caption: "Dos casos. El segundo es el que enseña. El primero solo confirma la fórmula."
		},
		see: [
			"funcion",
			"condicion",
			"invariante"
		],
		also: [{
			href: "/estudio",
			label: "Llevar la media frágil al estudio"
		}]
	},
	{
		slug: "concurrencia",
		title: "Concurrencia",
		thread: "Alrededor del código",
		summary: "Más de una cosa a medias, y reglas para que no se pisen.",
		body: [
			"Concurrencia significa que hay tareas empezadas que no han terminado, y el programa avanza en otra. No implica varios procesadores. Implica que ya no puedes leer el código como una sola fila de pasos.",
			"JavaScript, en el navegador y en Node, atiende por un bucle de eventos: empieza una espera (la red, un temporizador) y mientras tanto sigue con lo demás. Dos funciones no ejecutan su cuerpo a la vez en ese hilo. Go puede ejecutar goroutines de verdad en paralelo, y entonces dos escrituras a la misma variable necesitan un acuerdo.",
			"El fallo típico no es «la concurrencia es difícil». Es dar por hecho un orden que el lenguaje no prometió. Si una explicación depende de qué tarea termina antes, hay que decirlo. Si no se ha ejecutado, ese orden es una deducción, no un hecho."
		],
		see: [
			"variable",
			"memoria",
			"compilador"
		],
		also: [{
			href: "/lenguajes",
			label: "Qué cambia de un lenguaje a otro"
		}]
	}
];
var bySlug = new Map(concepts.map((concept) => [concept.slug, concept]));
function getConcept(slug) {
	return bySlug.get(slug);
}
function threadOf(slug) {
	return threads.find((thread) => thread.slugs.includes(slug));
}
//#endregion
export { threads as i, getConcept as n, threadOf as r, concepts as t };
