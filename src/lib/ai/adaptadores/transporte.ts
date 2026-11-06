/**
 * El lado común de toda llamada a un proveedor (0.6): la petición HTTP con su
 * reintento, las clases de fallo que puede lanzar y la traducción de ese fallo
 * al mensaje que ve la persona. Cada adaptador aporta su etiqueta; la lógica es
 * la misma para todos.
 */

export type TipoFallo =
  | "clave-invalida"
  | "limite-uso"
  | "servicio-caido"
  | "contenido-bloqueado"
  | "tiempo-agotado"
  | "respuesta-invalida";

export type ErrorDeProveedor = { tipo: TipoFallo; mensaje: string };

export class FalloProveedor extends Error implements ErrorDeProveedor {
  readonly tipo: TipoFallo;

  constructor(tipo: TipoFallo, mensaje: string) {
    super(mensaje);
    this.name = "FalloProveedor";
    this.tipo = tipo;
  }

  get mensaje(): string {
    return this.message;
  }
}

class HttpFailure extends Error {
  readonly estado: number;
  readonly cuerpo: string;

  constructor(estado: number, cuerpo: string) {
    super(`HTTP ${estado}`);
    this.estado = estado;
    this.cuerpo = cuerpo;
  }
}

class NetworkFailure extends Error {
  readonly causa: unknown;

  constructor(causa: unknown) {
    super("fallo de red");
    this.causa = causa;
  }
}

/**
 * Traduce el fallo bruto al mensaje que ve la persona, con la etiqueta del
 * proveedor: qué pasó y qué puede hacer la persona al respecto.
 */
export function traducirFallo(etiqueta: string, crudo: unknown): FalloProveedor {
  if (crudo instanceof FalloProveedor) return crudo;

  if (crudo instanceof NetworkFailure) {
    if (
      crudo.causa instanceof Error &&
      (crudo.causa.name === "TimeoutError" || crudo.causa.name === "AbortError")
    ) {
      return new FalloProveedor(
        "tiempo-agotado",
        `${etiqueta} no contestó en 30 segundos. Vuelve a intentarlo o prueba otro modelo en Ajustes.`,
      );
    }
    return new FalloProveedor(
      "servicio-caido",
      `No se ha podido contactar con ${etiqueta}. Comprueba tu conexión y reintenta en unos minutos.`,
    );
  }

  if (crudo instanceof HttpFailure) {
    const { estado, cuerpo } = crudo;
    if (estado === 401 || estado === 403) {
      return new FalloProveedor(
        "clave-invalida",
        `${etiqueta} rechaza la clave. Revisa en Ajustes que esté completa y activa para ese proveedor.`,
      );
    }
    if (estado === 429) {
      return new FalloProveedor(
        "limite-uso",
        `${etiqueta} corta la llamada: la clave ha llegado a su límite de uso. Espera un poco o revisa la cuota de esa clave.`,
      );
    }
    if (estado >= 500) {
      return new FalloProveedor(
        "servicio-caido",
        `${etiqueta} no está respondiendo (código ${estado}). No es tu clave ni tu código: reintenta en unos minutos.`,
      );
    }
    if (
      /\bcontent[ _-]?policy\b|\bcontent[ _-]?filter\b|\brefusal\b|\bblocked\b|\bbloquead\w*\b|\bsafety\b/i.test(
        cuerpo,
      )
    ) {
      return new FalloProveedor(
        "contenido-bloqueado",
        `${etiqueta} ha bloqueado el contenido de esta llamada. Cambia el texto que envías o prueba otro modelo.`,
      );
    }
    return new FalloProveedor(
      "respuesta-invalida",
      `${etiqueta} rechazó la petición (código ${estado}). No he inventado una explicación.`,
    );
  }

  return new FalloProveedor(
    "respuesta-invalida",
    `${etiqueta} respondió de una forma que no se esperaba. No he inventado una explicación.`,
  );
}

/** La petición al proveedor: un reintento en 429 y 5xx, y el cuerpo ya parseado. */
export async function postJson(
  url: string,
  headers: Record<string, string>,
  cuerpo: unknown,
): Promise<unknown> {
  const send = () =>
    fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(28000),
    });

  let response: Response;
  try {
    response = await send();
    if (response.status === 429 || response.status >= 500) {
      response = await send();
    }
  } catch (error) {
    throw new NetworkFailure(error);
  }
  if (!response.ok) {
    throw new HttpFailure(response.status, await response.text());
  }
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new HttpFailure(response.status, "el cuerpo no era JSON válido");
  }
}
