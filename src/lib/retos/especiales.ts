export const retoSql = {
  id: "sql-libros",
  titulo: "Libros de más de cien páginas",
  familia: "sql",
  nivel: 2,
  enunciado:
    "Escribe una consulta de SQLite sobre libros(titulo TEXT, paginas INTEGER). Devuelve solo el título de los libros de más de 100 páginas y ordena los títulos alfabéticamente.",
  ejemplos: [
    {
      id: "A",
      entrada: [
        ["Luz", 120],
        ["Arena", 95],
        ["Mar", 180],
      ],
      esperado: [["Luz"], ["Mar"]],
    },
  ],
  lenguaje: "sql",
  codigo: "SELECT titulo FROM libros\n-- Añade el filtro y el orden\n;",
} as const;

export const retoWeb = {
  id: "web-tarjeta",
  titulo: "Una tarjeta para la biblioteca",
  familia: "web",
  nivel: 2,
  enunciado:
    "Crea un elemento article con la clase tarjeta, un h2 y un párrafo con texto. Dale a la tarjeta un fondo #f0f4ff y 16px de relleno por los cuatro lados.",
  ejemplos: [],
  lenguaje: "web",
  codigo: "<!-- Escribe el HTML de la tarjeta -->\n",
  css: "/* Escribe aquí los estilos */\n",
} as const;

export const retosEspeciales = [retoSql, retoWeb] as const;

export function retoEspecial(id: string) {
  return retosEspeciales.find((reto) => reto.id === id);
}
