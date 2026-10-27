export type LanguageNote = {
  id: string;
  label: string;
  code: string;
  changed: string[];
};

export const wordCountNotes: LanguageNote[] = [
  {
    id: "python",
    label: "Python",
    code: `def frecuencias(texto: str) -> dict[str, int]:
    conteo: dict[str, int] = {}
    for palabra in texto.lower().split():
        conteo[palabra] = conteo.get(palabra, 0) + 1
    return conteo
`,
    changed: [
      "El diccionario crece solo. get(palabra, 0) dice: si no está, cuenta como cero, y entonces sumo uno. No hay un paso aparte de «reservar memoria».",
      "split corta por espacios y tira los vacíos de los extremos, pero deja puntuación pegada a la palabra. «fin.» y «fin» son claves distintas. Eso es una decisión del corte, no del diccionario.",
      "lower devuelve un texto nuevo. El original no cambia. Quien llama sigue viendo sus mayúsculas.",
    ],
  },
  {
    id: "javascript",
    label: "JavaScript",
    code: `function frecuencias(texto) {
  const conteo = new Map();
  for (const palabra of texto.toLowerCase().split(/\\s+/)) {
    if (!palabra) continue;
    conteo.set(palabra, (conteo.get(palabra) ?? 0) + 1);
  }
  return conteo;
}
`,
    changed: [
      "Un objeto corriente también serviría de diccionario, y es lo que mucha gente escribe primero. Map deja las claves como claves, sin convertirlas a texto por detrás, y se recorre en el orden en que entraron.",
      "split con una expresión regular puede dejar un texto vacío al principio o al final. Por eso está el continue. En Python, split sin argumentos ya no los deja. Traducir la llamada tal cual cambia el resultado.",
      "?? 0 solo sustituye null o undefined. No sustituye un cero. Aquí da igual, porque un cero guardado sería un conteo real. Conviene no cambiarlo por || 0 sin mirar: || también sustituye el cero.",
    ],
  },
  {
    id: "go",
    label: "Go",
    code: `func frecuencias(texto string) map[string]int {
    conteo := make(map[string]int)
    for _, palabra := range strings.Fields(strings.ToLower(texto)) {
        conteo[palabra]++
    }
    return conteo
}
`,
    changed: [
      "Leer una clave que no está devuelve el cero del tipo, no un error. Por eso conteo[palabra]++ funciona la primera vez: lee 0 y guarda 1. Esa es la diferencia con un lenguaje que protestaría.",
      "El mapa es una referencia. Quien recibe el resultado y mete otra clave está modificando el mismo mapa. No hace falta devolverlo «por si acaso» una segunda vez, pero sí saber que no es una copia.",
      "strings.Fields corta por cualquier espacio Unicode y no deja trozos vacíos. No es split(\" \"). El bucle no tiene if. El trabajo de limpiar está en la función de la biblioteca, y hay que saber cuál se eligió.",
    ],
  },
  {
    id: "rust",
    label: "Rust",
    code: `use std::collections::HashMap;

fn frecuencias(texto: &str) -> HashMap<String, usize> {
    let mut conteo = HashMap::new();
    for palabra in texto.split_whitespace() {
        let clave = palabra.to_lowercase();
        *conteo.entry(clave).or_insert(0) += 1;
    }
    conteo
}
`,
    changed: [
      "texto: &str es un préstamo. La función puede mirar el texto y no se queda con él. El mapa que devuelve es suyo: el llamador pasa a ser el dueño.",
      "to_lowercase() construye un String nuevo. No se puede usar la porción prestada como clave si la clave tiene que seguir viva dentro del mapa después de que el préstamo termine, y además las minúsculas pueden ocupar distinto sitio.",
      "entry evita buscar la clave dos veces y deja el cero solo si faltaba. mut está escrito porque el mapa cambia. Nada de esto aparece en la versión de Python, y no sobra: es el programa diciendo cuánto dura cada valor.",
    ],
  },
  {
    id: "c",
    label: "C",
    code: `int sumar_si_esta(struct Par *pares, int n, const char *palabra) {
    for (int i = 0; i < n; i++) {
        if (strcmp(pares[i].palabra, palabra) == 0) {
            pares[i].veces++;
            return pares[i].veces;
        }
    }
    return -1;
}
`,
    changed: [
      "En C la tabla no crece sola. Esta función solo incrementa una palabra que ya tiene sitio. Si devuelve −1, el llamador decide si hay hueco, si hay que pedir más memoria o si se ignora la palabra. Esas decisiones son el programa.",
      "struct Par *pares es una dirección. n dice cuántos pares hay detrás. El lenguaje no lo recuerda por ti. Si n miente, strcmp lee de más. El mismo algoritmo del diccionario, aquí, arrastra el tamaño al lado de los datos.",
      "No hay una línea que sea «la traducción» del diccionario de Python. Pretender que la hay esconde justo lo que C pone encima de la mesa: quién reserva, quién libera y cómo se comparan los textos.",
    ],
  },
];

export const languageEssays: { id: string; title: string; body: string[]; see: string }[] = [
  {
    id: "propiedad",
    title: "De Python a Rust",
    see: "propiedad-rust",
    body: [
      "En Python guardas un texto en una lista y no escribes quién lo liberará. El lenguaje lleva la cuenta de quién lo nombra y, cuando ya nadie puede usarlo, lo retira. Casi nunca lo ves. Casi nunca lo decides.",
      "Rust quiere esa decisión en el código para poder rechazar, al compilar, dos fallos concretos: liberar dos veces y usar algo ya liberado. Por eso aparece el dueño, y por eso un préstamo tiene fecha de caducidad. No es una forma más rebuscada de escribir el mismo diccionario. Es otro contrato.",
      "La primera vez, el compilador parece discutir por detalles. Casi siempre está señalando dos usos que no pueden ser verdad juntos. Leer el error como una frase sobre duraciones, y no como un capricho de sintaxis, es el paso que acorta el resto.",
    ],
  },
  {
    id: "concurrencia",
    title: "De JavaScript a Go",
    see: "concurrencia",
    body: [
      "JavaScript te acostumbra a un solo hilo que no se queda bloqueado: pide algo que tardará y sigue. El orden de los cuerpos síncronos es estable. Lo que no es estable es en qué momento vuelve una espera.",
      "Go reparte el trabajo en goroutines y puede ejecutarlas a la vez. Un mapa compartido, escrito desde dos, no está cubierto por la regla de «leer una clave ausente da cero». Esa regla vale dentro de una goroutine. Entre dos, el lenguaje pide un canal o un cerrojo, o aceptas un fallo que no se reproduce siempre.",
      "Pasar un programa de uno a otro no es cambiar function por func. Es preguntar si hay estado compartido y quién tiene permiso para tocarlo. Si no lo hay, la traducción es aburrida, y eso es una buena señal.",
    ],
  },
  {
    id: "memoria",
    title: "C, C++ y cuánto vive un objeto",
    see: "puntero",
    body: [
      "C te da direcciones y el tamaño. Puedes hacer de todo, incluido leer donde no hay un valor tuyo. La duración la llevas tú: una variable local muere al salir de la función, aunque hayas guardado su dirección.",
      "C++ añade objetos que se inicializan y se destruyen en momentos definidos, y referencias que son otro nombre y no una dirección reasignable. También puedes seguir usando punteros. El lenguaje no te obliga a un solo modelo, y por eso un archivo mezcla los tres. Hay que mirar el tipo de cada nombre, no la vibra general del archivo.",
      "Rust no está en esta página como «el C correcto». Está al lado porque responde a los mismos accidentes con otra regla. Leer los tres juntos sirve para ver el problema —quién vive, quién libera— y no para coronar una sintaxis.",
    ],
  },
];
