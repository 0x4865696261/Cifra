import type { Explanation } from "@/lib/ai/parse";
import { Button } from "@/components/ui/button";

export function ExplanationView({
  explanation,
  cached,
  onAsk,
  onLines,
}: {
  explanation: Explanation;
  cached: boolean;
  onAsk?: (question: string) => void;
  onLines?: (start: number, end: number) => void;
}) {
  return (
    <article className="border-t border-line pt-6">
      <p className="font-mono text-sm text-copper">{cached ? "Misma explicación, sin otra llamada" : "Explicación"}</p>
      <p className="mt-3 font-serif text-xl leading-relaxed text-pretty">{explanation.summary}</p>

      {explanation.walkthrough.length > 0 && (
        <ol className="mt-6 flex flex-col gap-3">
          {explanation.walkthrough.map((step, index) => {
            const range = parseRange(step.lines);
            return (
              <li key={`${step.lines}-${index}`} className="border-l border-line pl-4">
                {range && onLines ? (
                  <button
                    type="button"
                    className="tap min-h-11 text-left font-mono text-sm text-copper"
                    onClick={() => onLines(range.start, range.end)}
                  >
                    Líneas {step.lines}
                  </button>
                ) : (
                  <p className="font-mono text-sm text-copper">{step.lines}</p>
                )}
                <p className="text-pretty">{step.text}</p>
              </li>
            );
          })}
        </ol>
      )}

      {explanation.decisions.length > 0 && (
        <div className="mt-8 flex flex-col gap-5">
          <h3 className="font-serif text-2xl">Decisiones</h3>
          {explanation.decisions.map((decision) => (
            <section key={decision.choice}>
              <h4 className="font-serif text-lg">{decision.choice}</h4>
              <p className="mt-1 text-pretty">{decision.why}</p>
              {decision.simpler && (
                <pre className="mt-3 overflow-x-auto bg-ink p-4 font-mono text-sm leading-relaxed whitespace-pre text-paper">
                  {decision.simpler}
                </pre>
              )}
            </section>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="font-mono text-sm text-ink">En el texto</h3>
          <FactList items={explanation.checked} empty="Nada que separar como comprobado." />
        </section>
        <section>
          <h3 className="font-mono text-sm text-muted">Sin ejecutar</h3>
          <FactList items={explanation.inferred} empty="No hace falta suponer un resultado." />
        </section>
      </div>

      {explanation.skipped && (
        <p className="mt-6 text-pretty text-muted">
          <span className="font-mono text-sm text-ink">Qué no hace falta ahora. </span>
          {explanation.skipped}
        </p>
      )}

      {explanation.askNext && onAsk && (
        <div className="mt-6">
          <Button tone="ghost" className="h-auto max-w-full py-3 text-left whitespace-normal" onClick={() => onAsk(explanation.askNext)}>
            Preguntar: {explanation.askNext}
          </Button>
        </div>
      )}
    </article>
  );
}

function FactList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="mt-2 text-pretty text-muted">{empty}</p>;
  return (
    <ul className="mt-2 flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="text-pretty">
          {item}
        </li>
      ))}
    </ul>
  );
}

function parseRange(lines: string): { start: number; end: number } | null {
  const match = lines.trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
  if (!match) return null;
  const start = Number(match[1]);
  const end = Number(match[2] ?? match[1]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start) return null;
  return { start, end };
}
