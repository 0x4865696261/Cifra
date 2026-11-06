import {
  contratosDeModulo,
  seccionesDeContrato,
  type CargaDeModulos,
  type ManifiestoModulo,
  type Modulo,
  type RechazoModulo,
  type TipoModulo,
} from "./tipos.ts";

/**
 * El registro común de la 0.6: carga los módulos que cumplen su manifiesto y
 * deja fuera, con el motivo, a los que no. El orden importa en `necesita`: un
 * módulo solo puede depender de uno cargado antes en el mismo lote.
 */
export function cargarModulos<Contenido>(modulos: readonly Modulo<Contenido>[]): CargaDeModulos<Contenido> {
  const cargados: Array<Modulo<Contenido>> = [];
  const rechazados: Array<RechazoModulo> = [];
  const ids = new Set<string>();

  for (const candidato of modulos as readonly unknown[]) {
    const revisado = revisar<Contenido>(candidato, ids);
    if (revisado.rechazo) {
      rechazados.push(revisado.rechazo);
      continue;
    }
    const modulo = revisado.modulo as Modulo<Contenido>;
    cargados.push(modulo);
    ids.add(modulo.manifiesto.id);
  }

  return { cargados, rechazados };
}

type Revision<Contenido> =
  | { modulo: Modulo<Contenido>; rechazo: null }
  | { modulo: null; rechazo: RechazoModulo };

function revisar<Contenido>(candidato: unknown, idsCargados: ReadonlySet<string>): Revision<Contenido> {
  const id = idDe(candidato);
  const tipo = tipoDe(candidato);
  const rechazar = (motivo: string): Revision<Contenido> => ({
    modulo: null,
    rechazo: { id, tipo, motivo },
  });

  if (!esObjeto(candidato) || !esObjeto((candidato as { manifiesto?: unknown }).manifiesto)) {
    return rechazar("sin manifiesto");
  }
  const manifiesto = (candidato as { manifiesto: ManifiestoModulo }).manifiesto;
  if (typeof manifiesto.id !== "string" || manifiesto.id.trim() === "") {
    return rechazar("id vacío");
  }
  if (!esTipoModulo(manifiesto.tipo)) {
    return rechazar(`tipo desconocido: ${String(manifiesto.tipo)}`);
  }
  if (!esListaDeCadenas(manifiesto.aporta) || manifiesto.aporta.length === 0) {
    return rechazar("aporta vacío");
  }
  const vigente = contratosDeModulo[manifiesto.tipo].version;
  if (manifiesto.versionContrato !== vigente) {
    return rechazar(`versión de contrato ${String(manifiesto.versionContrato)}, se espera ${vigente}`);
  }
  if (idsCargados.has(manifiesto.id)) {
    return rechazar("id repetido");
  }
  if (!esListaDeCadenas(manifiesto.necesita)) {
    return rechazar("necesita mal formado");
  }
  for (const requisito of manifiesto.necesita) {
    if (requisito.startsWith("contrato:")) {
      const seccion = requisito.slice("contrato:".length);
      if (!(seccionesDeContrato as readonly string[]).includes(seccion)) {
        return rechazar(`necesita un contrato que no existe: ${requisito}`);
      }
    } else if (!idsCargados.has(requisito)) {
      return rechazar(`necesita un módulo que no está cargado antes: ${requisito}`);
    }
  }

  const contenido = (candidato as { contenido?: unknown }).contenido;
  if (contenido === undefined || contenido === null) {
    return rechazar("sin contenido");
  }

  const forma = formaDeContenido(manifiesto.tipo, manifiesto.id, contenido);
  if (forma) return rechazar(forma);

  return { modulo: candidato as Modulo<Contenido>, rechazo: null };
}

/** El motivo por el que el contenido no encaja con su tipo, o null si encaja. */
function formaDeContenido(tipo: TipoModulo, id: string, contenido: unknown): string | null {
  if (tipo === "reto" || tipo === "incidente") {
    if (!Array.isArray(contenido) || contenido.length === 0) {
      return `${tipo} sin elementos`;
    }
    return null;
  }

  if (!esObjeto(contenido)) return `${tipo} sin forma de objeto`;
  const datos = contenido as Record<string, unknown>;

  if (typeof datos.id !== "string" || datos.id !== id) {
    return `el id del contenido (${String(datos.id)}) no es el del manifiesto (${id})`;
  }

  if (tipo === "lenguaje") {
    if (typeof datos.label !== "string" || datos.label.trim() === "") return "lenguaje sin label";
    if (typeof datos.familia !== "string" || datos.familia.trim() === "") return "lenguaje sin familia";
    return null;
  }

  // modelo: el contrato 4.3.
  if (!Array.isArray(datos.modelosSoportados) || datos.modelosSoportados.length === 0) {
    return "modelo sin modelosSoportados";
  }
  for (const funcion of ["construirPeticion", "leerRespuesta", "traducirError"]) {
    if (typeof datos[funcion] !== "function") return `modelo sin ${funcion}`;
  }
  return null;
}

function idDe(candidato: unknown): string {
  if (esObjeto(candidato)) {
    const manifiesto = (candidato as { manifiesto?: unknown }).manifiesto;
    if (esObjeto(manifiesto) && typeof (manifiesto as { id?: unknown }).id === "string") {
      return (manifiesto as { id: string }).id;
    }
  }
  return "(sin id)";
}

function tipoDe(candidato: unknown): string {
  if (esObjeto(candidato)) {
    const manifiesto = (candidato as { manifiesto?: unknown }).manifiesto;
    if (esObjeto(manifiesto) && typeof (manifiesto as { tipo?: unknown }).tipo === "string") {
      return (manifiesto as { tipo: string }).tipo;
    }
  }
  return "(sin tipo)";
}

function esTipoModulo(valor: unknown): valor is TipoModulo {
  return typeof valor === "string" && valor in contratosDeModulo;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function esListaDeCadenas(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((item) => typeof item === "string" && item.trim() !== "");
}
