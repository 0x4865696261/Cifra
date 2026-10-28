export type DebugGuide = {
  reading: string;
  locate: string;
  hypotheses: { hypothesis: string; howToCheck: string }[];
  repro: { failing: string; passing: string };
  caughtEarlier: string;
  checked: string[];
  inferred: string[];
  askNext: string;
};

export function parseDebugGuide(raw: string): DebugGuide | null {
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
  const reading = asString(record.reading);
  if (!reading) return null;
  const reproRecord =
    record.repro && typeof record.repro === "object" ? (record.repro as Record<string, unknown>) : {};
  return {
    reading,
    locate: asString(record.locate),
    hypotheses: asList(record.hypotheses)
      .map((item) => ({
        hypothesis: asString(item.hypothesis),
        howToCheck: asString(item.howToCheck),
      }))
      .filter((item) => item.hypothesis && item.howToCheck)
      .slice(0, 4),
    repro: {
      failing: asString(reproRecord.failing),
      passing: asString(reproRecord.passing),
    },
    caughtEarlier: asString(record.caughtEarlier),
    checked: asStrings(record.checked).slice(0, 5),
    inferred: asStrings(record.inferred).slice(0, 5),
    askNext: asString(record.askNext),
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter(Boolean);
}

function asList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
}
