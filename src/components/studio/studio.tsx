import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyze, isLanguageId, languageIds, languageLabels, type LanguageId } from "@/lib/analyze/structure";
import { askCifra, type ExplainResult } from "@/lib/ai/explain";
import { ExplanationView } from "@/components/explain/result";
import { Button } from "@/components/ui/button";
import { useLevel, levelOptions } from "@/lib/level";
import { samples, type Sample } from "@/lib/samples";
import { applySkillChoices, selectSkills } from "@/lib/skills/select";
import { skillIds, skills, type SkillId } from "@/lib/skills/registry";
import { cn } from "@/lib/cn";

function clampLine(value: string, total: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(1, Math.floor(parsed)), Math.max(total, 1));
}

export function Studio() {
  const explain = useServerFn(askCifra);
  const { level, setLevel } = useLevel();
  const [sampleId, setSampleId] = useState(samples[0].id);
  const [language, setLanguage] = useState<LanguageId>(samples[0].language);
  const [code, setCode] = useState(samples[0].code);
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState("");
  const [fromLine, setFromLine] = useState(1);
  const [toLine, setToLine] = useState(1);
  const [forcedOn, setForcedOn] = useState<SkillId[]>([]);
  const [forcedOff, setForcedOff] = useState<SkillId[]>([]);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);

  const analysis = useMemo(() => analyze(code, language), [code, language]);
  const lines = code.split(/\r?\n/);
  const picks = useMemo(
    () =>
      selectSkills({
        kind: "codigo",
        level,
        language,
        question,
        nestedLoops: analysis.nestedLoops,
        recursion: analysis.recursion,
      }),
    [analysis.nestedLoops, analysis.recursion, language, level, question],
  );
  const active = applySkillChoices(picks, forcedOff, forcedOn);
  const inactive = skillIds.filter((id) => !active.includes(id));
  const selection = fromLine === toLine ? `${fromLine}` : `${Math.min(fromLine, toLine)}-${Math.max(fromLine, toLine)}`;

  const load = (sample: Sample) => {
    setSampleId(sample.id);
    setLanguage(sample.language);
    setCode(sample.code);
    setQuestion("");
    setFromLine(1);
    setToLine(1);
    setForcedOn([]);
    setForcedOff([]);
    setResult(null);
    setEditing(false);
  };

  const pickLine = (line: number, shift: boolean) => {
    if (!shift) {
      setFromLine(line);
      setToLine(line);
      return;
    }
    setToLine(line);
  };

  const toggle = (id: SkillId) => {
    const pick = picks.find((item) => item.id === id);
    if (pick?.locked) return;
    if (active.includes(id)) {
      setForcedOff((prev) => [...new Set([...prev, id])]);
      setForcedOn((prev) => prev.filter((item) => item !== id));
    } else {
      setForcedOn((prev) => [...new Set([...prev, id])]);
      setForcedOff((prev) => prev.filter((item) => item !== id));
    }
  };

  const submit = async () => {
    setPending(true);
    setResult(null);
    try {
      const response = await explain({
        data: {
          kind: "codigo",
          level,
          language,
          code,
          question,
          selection,
          facts: analysis.facts.map((fact) => `L${fact.lines}: ${fact.text}`),
          skills: active,
        },
      });
      setResult(response);
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "No se ha podido pedir la explicación.",
      });
    } finally {
      setPending(false);
    }
  };

  const low = Math.min(fromLine, toLine);
  const high = Math.max(fromLine, toLine);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex flex-col gap-2 font-mono text-sm">
            Lenguaje
            <select
              className="min-h-11 border border-line bg-paper px-3 text-ink"
              value={language}
              onChange={(event) => {
                if (isLanguageId(event.target.value)) setLanguage(event.target.value);
              }}
            >
              {languageIds.map((id) => (
                <option key={id} value={id}>
                  {languageLabels[id]}
                </option>
              ))}
            </select>
          </label>
          <p className="font-mono text-sm text-muted">{analysis.lineCount} líneas</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {samples.map((sample) => (
            <Button key={sample.id} tone={sample.id === sampleId ? "quiet" : "ghost"} onClick={() => load(sample)}>
              {sample.title}
            </Button>
          ))}
          <Button tone="ghost" onClick={() => setEditing((value) => !value)}>
            {editing ? "Cerrar editor" : "Editar el texto"}
          </Button>
        </div>
        <p className="mt-3 text-pretty text-muted">{samples.find((sample) => sample.id === sampleId)?.hint}</p>

        {editing && (
          <textarea
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setSampleId("");
              setResult(null);
            }}
            spellCheck={false}
            aria-label="Código"
            className="mt-4 min-h-48 w-full border border-line bg-paper p-3 font-mono text-sm leading-6 text-ink"
          />
        )}

        <div className="mt-4 max-h-[32rem] overflow-auto border border-line">
          {lines.map((line, index) => {
            const number = index + 1;
            const selected = number >= low && number <= high;
            return (
              <button
                key={number}
                type="button"
                aria-pressed={selected}
                onClick={(event) => pickLine(number, event.shiftKey)}
                className={cn(
                  "grid min-h-11 w-max min-w-full grid-cols-[3rem_1fr] items-start gap-3 border-l-2 px-3 py-2 text-left font-mono text-sm leading-6",
                  selected ? "border-copper bg-line text-ink" : "border-transparent text-ink",
                )}
              >
                <span className="text-muted tabular-nums">{number}</span>
                <span className="whitespace-pre">{line || " "}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 font-mono text-sm text-muted">
          Pulsa una línea. Con la tecla de mayúsculas, alargas el tramo. Ahora: {selection}.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 font-mono text-sm">
            Desde
            <input
              type="number"
              min={1}
              max={Math.max(lines.length, 1)}
              value={fromLine}
              onChange={(event) => setFromLine(clampLine(event.target.value, lines.length))}
              className="min-h-11 border border-line bg-paper px-3 tabular-nums text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 font-mono text-sm">
            Hasta
            <input
              type="number"
              min={1}
              max={Math.max(lines.length, 1)}
              value={toLine}
              onChange={(event) => setToLine(clampLine(event.target.value, lines.length))}
              className="min-h-11 border border-line bg-paper px-3 tabular-nums text-ink"
            />
          </label>
        </div>

        <h2 className="mt-8 font-serif text-2xl">Lo que se ve en el texto</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {analysis.facts.map((fact) => (
            <li key={`${fact.lines}-${fact.text}`} className="border-l border-line pl-4">
              <p className="font-mono text-sm text-copper">Líneas {fact.lines}</p>
              <p className="text-pretty">{fact.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-pretty text-muted">
          Esto no ejecuta el programa. Se equivoca con cadenas de varias líneas y con sintaxis rara. Si una
          explicación necesita un valor concreto, tiene que decir que lo supone.
        </p>
      </section>

      <section>
        <fieldset>
          <legend className="font-mono text-sm">Nivel</legend>
          <div className="mt-2 grid grid-cols-3 border border-line">
            {levelOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={level === option.id}
                onClick={() => setLevel(option.id)}
                className={cn(
                  "tap min-h-11 px-2 font-mono text-sm",
                  level === option.id ? "bg-ink text-paper" : "text-muted",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-pretty text-muted">{levelOptions.find((option) => option.id === level)?.hint}</p>
        </fieldset>

        <label className="mt-6 flex flex-col gap-2 font-mono text-sm">
          Pregunta, si tienes una
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            maxLength={600}
            className="w-full border border-line bg-paper p-3 font-serif text-base text-ink"
            placeholder="Si la dejas vacía, Cifra explica el recorrido."
          />
        </label>
        {samples.find((sample) => sample.id === sampleId) && (
          <button
            type="button"
            className="mt-2 min-h-11 text-left font-mono text-sm text-copper"
            onClick={() => setQuestion(samples.find((sample) => sample.id === sampleId)?.suggestedQuestion ?? "")}
          >
            Usar la pregunta del ejemplo
          </button>
        )}

        <h2 className="mt-8 font-serif text-2xl">Skills</h2>
        <p className="mt-2 text-pretty text-muted">
          No es un adorno. Cada una añade instrucciones distintas a la explicación. Pedagogía y análisis van siempre.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {picks
            .filter((pick) => active.includes(pick.id))
            .map((pick) => (
              <li key={pick.id} className="flex flex-col gap-1 border border-line px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm">{skills[pick.id].name}</span>
                  {pick.locked ? (
                    <span className="font-mono text-sm text-muted">fija</span>
                  ) : (
                    <button type="button" className="min-h-11 font-mono text-sm text-copper" onClick={() => toggle(pick.id)}>
                      Quitar
                    </button>
                  )}
                </div>
                <p className="text-pretty text-muted">{pick.reason}</p>
              </li>
            ))}
        </ul>
        {inactive.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {inactive.map((id) => (
              <Button key={id} tone="ghost" onClick={() => toggle(id)}>
                Añadir {skills[id].name}
              </Button>
            ))}
          </div>
        )}

        <Button tone="primary" className="mt-6 w-full" disabled={pending || !code.trim()} onClick={() => void submit()}>
          {pending ? "Leyendo el programa…" : "Explicar este programa"}
        </Button>
        <p className="mt-2 font-mono text-sm text-muted">Una llamada al modelo, solo cuando pulsas. No parte sola.</p>

        {result && !result.ok && (
          <div className="mt-6 border-l border-copper pl-4">
            <p className="text-pretty">{result.error}</p>
            {result.raw && (
              <pre className="mt-3 overflow-x-auto font-mono text-sm whitespace-pre-wrap text-muted">{result.raw}</pre>
            )}
          </div>
        )}
        {result?.ok && (
          <ExplanationView
            explanation={result.explanation}
            cached={result.cached}
            onAsk={(next) => {
              setQuestion(next);
              setResult(null);
            }}
            onLines={(start, end) => {
              setFromLine(start);
              setToLine(end);
            }}
          />
        )}
      </section>
    </div>
  );
}
