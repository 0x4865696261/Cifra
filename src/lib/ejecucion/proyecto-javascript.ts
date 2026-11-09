export type ArchivoProyecto = { ruta: string; codigo: string };

export const maximoArchivoProyecto = 12_000;

export function codigoProyecto(
  archivos: readonly ArchivoProyecto[],
  entrada: string,
  caso: unknown,
): string {
  return `(() => {
  const fuentes = new Map(${JSON.stringify(archivos.map(({ ruta, codigo }) => [ruta, codigo]))});
  const modulos = new Map();
  function cargar(ruta) {
    if (modulos.has(ruta)) return modulos.get(ruta).exports;
    if (!fuentes.has(ruta)) throw new Error("Archivo local no encontrado: " + ruta);
    const modulo = { exports: {} };
    modulos.set(ruta, modulo);
    function requerir(pedido) {
      if (typeof pedido !== "string" || !/^\\.{1,2}\\//.test(pedido)) {
        throw new Error("Usa una ruta relativa a un archivo del reto.");
      }
      const partes = ruta.split("/").slice(0, -1);
      for (const parte of pedido.split("/")) {
        if (parte === "..") {
          if (!partes.length) throw new Error("La ruta sale del proyecto.");
          partes.pop();
        } else if (parte && parte !== ".") {
          partes.push(parte);
        }
      }
      return cargar(partes.join("/"));
    }
    let ejecutar;
    try {
      ejecutar = new Function("require", "module", "exports", "console",
        fuentes.get(ruta) + "\\n//# sourceURL=cifra-proyecto/" + ruta);
    } catch (error) {
      throw new SyntaxError(ruta + ": " + error.message);
    }
    ejecutar(requerir, modulo, modulo.exports, console);
    return modulo.exports;
  }
  return cargar(${JSON.stringify(entrada)}).resolver(${JSON.stringify(caso)});
})()`;
}
