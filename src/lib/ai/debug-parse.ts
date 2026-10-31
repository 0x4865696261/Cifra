import type { FailureReport } from "../analyze/failure.ts";

/**
 * El modelo contesta con su propia forma de JSON; aquí se valida contra la
 * `guia` del contrato 4.2 y se convierte. Si no cumple la forma completa, no
 * hay guía: se devuelve null y la superficie muestra un error útil.
 */

export type GuiaDeDepuracion = NonNullable<FailureReport["guia"]>;

export function parseDebugGuide(raw: string): GuiaDeDepuracion | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let value: unknown;
  try {
    value = JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  const leerElMensaje = asString(record.reading);
  const localizarElSitio = asString(record.locate);
  if (!leerElMensaje || !localizarElSitio) return null;

  const reproRecord =
    record.repro && typeof record.repro === "object" ? (record.repro as Record<string, unknown>) : {};
  const entradaQueFallaHoy = asString(reproRecord.failing);
  const entradaQueDebeSeguirFuncionando = asString(reproRecord.passing);
  if (!entradaQueFallaHoy || !entradaQueDebeSeguirFuncionando) return null;

  const comoHabriaSaltadoAntes = asString(record.caughtEarlier);
  if (!comoHabriaSaltadoAntes) return null;

  const hipotesis = asList(record.hypotheses)
    .map((item) => {
      const texto = asString(item.hypothesis);
      const coste = asCoste(item.coste);
      const comoComprobarla = asString(item.howToCheck);
      if (!texto || !coste || !comoComprobarla) return null;
      return { texto, coste, comoComprobarla };
    });
  if (hipotesis.length === 0 || hipotesis.some((item) => item === null)) return null;
  const hipotesisValidas = hipotesis
    .map((item) => item as { texto: string; coste: 1 | 2 | 3; comoComprobarla: string })
    .slice(0, 4);

  return {
    leerElMensaje: [{ texto: leerElMensaje, procedencia: "deducido" }],
    localizarElSitio: [{ texto: localizarElSitio, procedencia: "deducido" }],
    hipotesis: hipotesisValidas,
    entradaQueFallaHoy,
    entradaQueDebeSeguirFuncionando,
    comoHabriaSaltadoAntes,
  };
}

function asCoste(value: unknown): 1 | 2 | 3 | null {
  return value === 1 || value === 2 || value === 3 ? value : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
}
