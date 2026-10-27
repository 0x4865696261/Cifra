export type Explanation = {
  summary: string;
  walkthrough: { lines: string; text: string }[];
  decisions: { choice: string; why: string; simpler: string | null }[];
  skipped: string;
  checked: string[];
  inferred: string[];
  askNext: string;
};

export function parseExplanation(raw: string): Explanation | null {
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
  const summary = asString(record.summary);
  if (!summary) return null;
  return {
    summary,
    walkthrough: asList(record.walkthrough)
      .map((item) => ({
        lines: asString(item.lines) || "—",
        text: asString(item.text),
      }))
      .filter((item) => item.text)
      .slice(0, 6),
    decisions: asList(record.decisions)
      .map((item) => ({
        choice: asString(item.choice),
        why: asString(item.why),
        simpler: asString(item.simpler) || null,
      }))
      .filter((item) => item.choice && item.why)
      .slice(0, 3),
    skipped: asString(record.skipped),
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
