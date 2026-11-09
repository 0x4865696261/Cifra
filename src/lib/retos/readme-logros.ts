export const inicioCifra = "<!-- cifra:logros:inicio -->";
export const finCifra = "<!-- cifra:logros:fin -->";

export type LogroPublico = {
  id: string;
  titulo: string;
  lenguaje: string;
  fecha: string;
};

function celda(texto: string) {
  return texto.replace(/[\r\n]+/g, " ").replace(/[\\|<>\[\]*_`]/g, "\\$&");
}

export function actualizarReadme(
  anterior: string | null,
  logros: LogroPublico[],
  origen: string,
): string | null {
  const filas = logros.map(
    ({ id, titulo, lenguaje, fecha }) =>
      `| [${celda(titulo)}](${origen}/retos/${encodeURIComponent(id)}) | ${celda(lenguaje)} | ${celda(fecha)} |`,
  );
  const contenido = logros.length
    ? ["| Reto | Lenguaje | Fecha (UTC) |", "| --- | --- | --- |", ...filas].join("\n")
    : "Los retos aparecerán aquí cuando el juez de Cifra apruebe un envío.";
  const bloque = [inicioCifra, contenido, finCifra].join("\n");
  if (anterior === null)
    return "# Mis logros en Cifra\n\nRetos aprobados por el juez de Cifra.\n\n" + bloque + "\n";
  const inicio = anterior.indexOf(inicioCifra);
  const fin = anterior.indexOf(finCifra);
  if (
    inicio === -1 ||
    fin < inicio + inicioCifra.length ||
    anterior.lastIndexOf(inicioCifra) !== inicio ||
    anterior.lastIndexOf(finCifra) !== fin
  ) {
    return null;
  }
  return anterior.slice(0, inicio) + bloque + anterior.slice(fin + finCifra.length);
}
