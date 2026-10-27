//#region node_modules/.nitro/vite/services/ssr/assets/math-CnHQOZYR.js
var mathTopics = [
	{
		slug: "lineal",
		title: "La función lineal",
		kicker: "De una fórmula",
		formula: "y = mx + b",
		promise: "Una recta es una regla: das un número y sale otro, siempre con la misma pendiente.",
		meaning: ["m dice cuánto cambia y cuando x aumenta una unidad. b es el valor de y cuando x es cero. No hay más misterio en la fórmula.", "En un programa, esa regla es una función. El nombre de la función no calcula nada: calcula la expresión de la derecha, con los valores que le pases."],
		reasoning: ["Si m es 2 y b es 1, al 0 le corresponde 1, al 1 le corresponde 3, al 2 le corresponde 5. La distancia entre salidas consecutivas es siempre m.", "Para dibujarla no hace falta infinitos puntos. Con unos cuantos x enteros ya se ve la recta, porque entre dos puntos de una función lineal no hay curva."],
		pseudocode: `función valor(x, pendiente, origen):
    devolver pendiente * x + origen

para x desde -6 hasta 6:
    anotar (x, valor(x, pendiente, origen))`,
		python: `def valor(x, pendiente, origen):
    return pendiente * x + origen

puntos = [(x, valor(x, 2, 1)) for x in range(-6, 7)]`,
		javascript: `function valor(x, pendiente, origen) {
  return pendiente * x + origen;
}

const puntos = [];
for (let x = -6; x <= 6; x += 1) {
  puntos.push([x, valor(x, 2, 1)]);
}`,
		see: [
			"funcion-matematica",
			"funcion",
			"variable"
		]
	},
	{
		slug: "cuadratica",
		title: "La ecuación de segundo grado",
		kicker: "De una fórmula",
		formula: "ax² + bx + c = 0",
		promise: "Buscamos los x que hacen cero una parábola. El discriminante dice cuántos hay antes de calcularlos.",
		meaning: ["Una ecuación no es lo mismo que una función. La función y = ax² + bx + c da un valor para cada x. La ecuación pregunta por los x en los que ese valor es cero.", "El discriminante es b² − 4ac. Si es positivo hay dos raíces, si es cero hay una, si es negativo no hay ninguna raíz real. Ese número no es un adorno: es la decisión."],
		reasoning: ["Completar el cuadrado lleva de ax² + bx + c = 0 a la fórmula x = (−b ± √(b² − 4ac)) / (2a). Aquí no hace falta rehacer esa derivación para usarla, pero sí hace falta saber qué representa cada pieza.", "Si a es cero, la ecuación dejó de ser de segundo grado. Un programa que no mire ese caso divide por cero o finge una parábola que no está."],
		pseudocode: `función raíces(a, b, c):
    si a es 0:
        devolver "no es cuadrática"
    d = b*b - 4*a*c
    si d < 0:
        devolver "ninguna raíz real"
    raíz = raíz_cuadrada(d)
    devolver (-b - raíz) / (2*a) y (-b + raíz) / (2*a)`,
		python: `import math

def raices(a, b, c):
    if a == 0:
        return None
    discriminante = b * b - 4 * a * c
    if discriminante < 0:
        return ()
    raiz = math.sqrt(discriminante)
    return ((-b - raiz) / (2 * a), (-b + raiz) / (2 * a))`,
		javascript: `function raices(a, b, c) {
  if (a === 0) return null;
  const discriminante = b * b - 4 * a * c;
  if (discriminante < 0) return [];
  const raiz = Math.sqrt(discriminante);
  return [(-b - raiz) / (2 * a), (-b + raiz) / (2 * a)];
}`,
		see: [
			"funcion-matematica",
			"condicion",
			"prueba"
		]
	},
	{
		slug: "binaria",
		title: "Partir un intervalo",
		kicker: "De una idea de búsqueda",
		formula: "ordenado, y cada paso se queda con una mitad",
		promise: "Si los datos están ordenados, no hace falta mirarlos todos: se puede tirar la mitad que ya no puede contener el objetivo.",
		meaning: ["La búsqueda binaria no es un truco de índices. Es esta promesa: si el valor está, está entre low y high, inclusive. Al empezar, low es el primer índice y high el último, así que la promesa es cierta.", "Se mira el centro. Si es menor que el objetivo, todo lo de la izquierda también lo es, porque el arreglo está ordenado. La promesa sigue siendo cierta en el trozo derecho. Al revés, igual."],
		reasoning: ["Cada paso deja fuera al menos el centro, así que el intervalo se acorta. Cuando low pasa de high, el intervalo está vacío y la promesa dice que el valor no está.", "Si el arreglo no está ordenado, la frase «todo lo de la izquierda es menor» es falsa y el algoritmo puede descartar el propio objetivo. El orden no es un detalle de presentación."],
		pseudocode: `low = 0
high = último índice
mientras low <= high:
    mid = parte entera de (low + high) / 2
    si valores[mid] es el objetivo:
        devolver mid
    si valores[mid] < objetivo:
        low = mid + 1
    si no:
        high = mid - 1
devolver "no está"`,
		python: `def buscar(valores, objetivo):
    low = 0
    high = len(valores) - 1
    while low <= high:
        mid = (low + high) // 2
        if valores[mid] == objetivo:
            return mid
        if valores[mid] < objetivo:
            low = mid + 1
        else:
            high = mid - 1
    return None`,
		javascript: `function buscar(valores, objetivo) {
  let low = 0;
  let high = valores.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (valores[mid] === objetivo) return mid;
    if (valores[mid] < objetivo) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
		see: [
			"invariante",
			"bucle",
			"arreglo",
			"complejidad"
		]
	},
	{
		slug: "fibonacci",
		title: "Una recurrencia, dos costes",
		kicker: "De una idea de búsqueda",
		formula: "F(0) = 0, F(1) = 1, F(n) = F(n−1) + F(n−2)",
		promise: "La definición ya es un algoritmo. Es correcta, y también repite el mismo trabajo una y otra vez.",
		meaning: ["Una recurrencia dice cómo se construye un término a partir de los anteriores. Pasarla a código es casi copiarla: si n es 0 o 1, devuelve n; si no, devuelve la suma de las dos llamadas.", "Esa traducción es la versión simple, y es la que hay que entender primero. El problema no es la recursión. El problema es que F(5) calcula F(3) por un lado y otra vez por el otro."],
		reasoning: ["El número de llamadas de la versión simple crece como la propia sucesión: cada llamada abre dos, menos las que se cortan en 0 y 1. Para n pequeños no se nota. Al crecer n, se nota antes de que el número resulte interesante.", "Guardar el resultado de cada n la primera vez que se calcula no cambia la definición. Cambia que F(3) se resuelve una vez. Se paga con memoria: una casilla por cada n ya visto."],
		pseudocode: `función fib(n):
    si n <= 1:
        devolver n
    devolver fib(n - 1) + fib(n - 2)

función fib_con_memoria(n, memoria):
    si n está en memoria:
        devolver memoria[n]
    si n <= 1:
        valor = n
    si no:
        valor = fib_con_memoria(n - 1, memoria) + fib_con_memoria(n - 2, memoria)
    memoria[n] = valor
    devolver valor`,
		python: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

def fib_con_memoria(n, memoria=None):
    if memoria is None:
        memoria = {}
    if n in memoria:
        return memoria[n]
    if n <= 1:
        valor = n
    else:
        valor = fib_con_memoria(n - 1, memoria) + fib_con_memoria(n - 2, memoria)
    memoria[n] = valor
    return valor`,
		javascript: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

function fibConMemoria(n, memoria = new Map()) {
  if (memoria.has(n)) return memoria.get(n);
  const valor = n <= 1 ? n : fibConMemoria(n - 1, memoria) + fibConMemoria(n - 2, memoria);
  memoria.set(n, valor);
  return valor;
}`,
		whyNotOnlySimple: ["La versión que copia la fórmula es la mejor explicación y, para un n pequeño, también el mejor programa: se lee igual que la definición.", "Deja de bastar cuando el mismo subproblema se calcula muchas veces. La memoria no está ahí para impresionar. Está porque el coste pasó de «se entiende» a «no termina a tiempo». El inconveniente es otro estado que hay que acertar: si la memoria se llena mal, el resultado también."],
		see: [
			"recursion",
			"pila-de-llamadas",
			"complejidad",
			"diccionario"
		]
	},
	{
		slug: "matrices",
		title: "Multiplicar matrices",
		kicker: "De una fórmula",
		formula: "cᵢⱼ = aᵢ₁b₁ⱼ + aᵢ₂b₂ⱼ",
		promise: "Cada celda del resultado es una suma de productos. El triple bucle es esa frase, escrita sin símbolos.",
		meaning: ["Una matriz de 2×2 es una tabla. Multiplicar no es multiplicar celda a celda. La fila i de la primera se combina con la columna j de la segunda.", "En dos dimensiones, cᵢⱼ tiene dos productos. Con n, tiene n. Y hay n² celdas. Por eso esta forma de multiplicar hace del orden de n³ operaciones. Es una cuenta de la fórmula, no un cronómetro."],
		reasoning: ["El índice k recorre la fila y la columna a la vez. Si k no recorre el mismo tramo en las dos matrices, la suma mezcla números que la definición no junta.", "Hay formas más rápidas cuando n es enorme. Para una tabla de 2×2 añaden complicaciones que no devuelven nada visible. Aquí la versión escolar es la correcta."],
		pseudocode: `para cada fila i:
    para cada columna j:
        suma = 0
        para cada k:
            suma = suma + A[i][k] * B[k][j]
        C[i][j] = suma`,
		python: `def multiplicar(a, b):
    n = len(a)
    c = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            suma = 0
            for k in range(n):
                suma += a[i][k] * b[k][j]
            c[i][j] = suma
    return c`,
		javascript: `function multiplicar(a, b) {
  const n = a.length;
  const c = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      let suma = 0;
      for (let k = 0; k < n; k += 1) suma += a[i][k] * b[k][j];
      c[i][j] = suma;
    }
  }
  return c;
}`,
		whyNotOnlySimple: ["Esta es la forma simple, y coincide con la definición. El coste cúbico está en la definición: tres índices.", "Cambiar a un algoritmo más elaborado solo compensa cuando n es grande de verdad y alguien ha medido. Mientras tanto, un triple bucle claro es mejor ingeniería que una técnica que el lector no puede comprobar."],
		see: [
			"bucle",
			"arreglo",
			"complejidad"
		]
	},
	{
		slug: "distancia",
		title: "La distancia entre dos puntos",
		kicker: "De una fórmula",
		formula: "d = √((x₂−x₁)² + (y₂−y₁)²)",
		promise: "Pitágoras, en el orden en que un programa lo puede calcular: resta, cuadrado, suma, raíz.",
		meaning: ["Dos puntos del plano se separan en horizontal y en vertical. Esos dos tramos son los catetos. La distancia es la hipotenusa.", "El cuadrado está para que la dirección no importe: (−3)² y 3² valen lo mismo. Sin el cuadrado, un desplazamiento a la izquierda restaría distancia."],
		reasoning: ["El orden del cálculo es el orden de la fórmula, de dentro hacia fuera. Primero las diferencias, luego sus cuadrados, luego la suma, y al final la raíz. Saltar la raíz da la distancia al cuadrado, que a veces basta para comparar y evita una operación.", "Comparar distancias al cuadrado no sirve si luego hay que mostrar metros. Sirve si solo quieres saber cuál de dos puntos está más cerca. Es la misma relación, con un paso menos."],
		pseudocode: `dx = x2 - x1
dy = y2 - y1
devolver raíz(dx*dx + dy*dy)`,
		python: `import math

def distancia(x1, y1, x2, y2):
    dx = x2 - x1
    dy = y2 - y1
    return math.sqrt(dx * dx + dy * dy)`,
		javascript: `function distancia(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.hypot(dx, dy);
}`,
		see: ["funcion-matematica", "funcion"]
	},
	{
		slug: "dispersion",
		title: "Media y varianza",
		kicker: "De contar",
		formula: "media = (x₁ + … + xₙ) / n",
		promise: "La media es un centro. La varianza dice, con un solo número, cuánto se alejan los datos de ese centro.",
		meaning: ["Sumar y dividir entre cuántos hay. Eso es la media. No es «el valor típico» en todos los sentidos: un dato enorme la arrastra. Es el reparto equitativo de la suma.", "La varianza parte de las desviaciones, xᵢ − media. Unas son positivas y otras negativas, y si se suman tal cual se anulan. Por eso se elevan al cuadrado antes de promediarlas."],
		reasoning: ["Hay dos convenios. Dividir entre n es la varianza de estos datos, tratados como el conjunto completo. Dividir entre n−1 es una estimación cuando estos datos son una muestra de algo mayor. El código tiene que elegir. Esta página divide entre n, y lo dice.", "Con n = 0 la media no existe: no hay suma que repartir. Un programa que divide igual produce un valor que no significa nada, a menudo NaN. El caso vacío es parte de la definición, no un extra."],
		pseudocode: `si n es 0:
    la media no está definida
suma = 0
para cada x:
    suma = suma + x
media = suma / n
varianza = 0
para cada x:
    varianza = varianza + (x - media)²
varianza = varianza / n`,
		python: `def dispersion(valores):
    n = len(valores)
    if n == 0:
        return None
    media = sum(valores) / n
    varianza = sum((x - media) ** 2 for x in valores) / n
    return media, varianza`,
		javascript: `function dispersion(valores) {
  const n = valores.length;
  if (n === 0) return null;
  const media = valores.reduce((s, x) => s + x, 0) / n;
  const varianza = valores.reduce((s, x) => s + (x - media) ** 2, 0) / n;
  return { media, varianza };
}`,
		whyNotOnlySimple: ["Se puede calcular la varianza en un solo recorrido, sin guardar todas las desviaciones. Hace falta una fórmula algebraica equivalente y es más fácil equivocarse.", "Con una lista corta, dos recorridos se leen mejor y cuestan lo mismo a efectos prácticos. La versión de un solo paso se justifica cuando los datos no caben en memoria o el recorrido es caro. Aquí no es el caso."],
		see: [
			"bucle",
			"variable",
			"prueba",
			"arreglo"
		]
	},
	{
		slug: "logica",
		title: "Y, o, no",
		kicker: "De contar",
		formula: "verdadero y falso, sin término medio",
		promise: "Una condición de un programa es una frase lógica. La tabla de verdad es el programa, escrito con todas las entradas.",
		meaning: ["«Y» solo es verdadero cuando las dos partes lo son. «O», en programación, suele ser inclusivo: basta con que una lo sea, y también vale que lo sean las dos. «No» invierte un valor.", "La o exclusiva es otra operación: verdadero cuando los dos lados discrepan. No es la «o» del idioma cotidiano, y por eso conviene nombrarla."],
		reasoning: ["Un if no añade una tercera verdad. Evalúa una frase y elige un camino. Si la frase es a && b, el camino del if es exactamente la fila de la tabla en la que esa frase da verdadero.", "El orden importa cuando la segunda parte no debería evaluarse si la primera falla. En varios lenguajes, a && b no mira b cuando a ya es falso. Eso ya no es solo lógica: es una decisión del lenguaje sobre el trabajo que se ahorra, y a veces sobre un error que se evita."],
		pseudocode: `función y(a, b):
    devolver a y además b

si llueve y hace frío:
    abrigo
si no:
    otra cosa`,
		python: `def ambos(a, b):
    return a and b

def alguno(a, b):
    return a or b

def contrario(a):
    return not a`,
		javascript: `function ambos(a, b) {
  return a && b;
}

function alguno(a, b) {
  return a || b;
}

function contrario(a) {
  return !a;
}`,
		see: ["condicion", "funcion"]
	}
];
function getMathTopic(slug) {
	return mathTopics.find((topic) => topic.slug === slug);
}
function mathBrief(topic) {
	return [
		topic.title,
		topic.formula,
		topic.promise,
		...topic.meaning,
		...topic.reasoning,
		topic.pseudocode
	].join("\n\n");
}
//#endregion
export { mathBrief as n, mathTopics as r, getMathTopic as t };
