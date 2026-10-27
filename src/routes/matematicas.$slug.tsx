import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { askCifra, type ExplainResult } from "@/lib/ai/explain";
import { CodeBlock } from "@/components/code-block";
import { ExplanationView } from "@/components/explain/result";
import { Experiment } from "@/components/math/experiments";
import { Button } from "@/components/ui/button";
import { getConcept } from "@/lib/content/concepts";
import { getMathTopic, mathTopics } from "@/lib/content/math";
import { useLevel, levelOptions } from "@/lib/level";
import { applySkillChoices, selectSkills } from "@/lib/skills/select";
import { skills, type SkillId } from "@/lib/skills/registry";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/matematicas/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${getMathTopic(params.slug)?.title ?? "Matemáticas"} — Cifra` }],
  }),
  component: MathPage,
});

function MathPage() {
  const { slug } = Route.useParams();
  const topic = getMathTopic(slug);
  if (!topic) throw notFound();
  const [tab, setTab] = useState<"python" | "javascript">("python");
  const { level, setLevel } = useLevel();
  const explain = useServerFn(askCifra);
  const [question, setQuestion] = useState("");
  const [forcedOn, setForcedOn] = useState<SkillId[]>([]);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const picks = selectSkills({
    kind: "matematicas",
    level,
    language: tab,
    question,
    nestedLoops: false,
    recursion: slug === "fibonacci",
  });
  const active = applySkillChoices(picks, [], forcedOn);
  const index = mathTopics.findIndex((item) => item.slug === slug);
  const previous = mathTopics[index - 1];
  const next = mathTopics[index + 1];

  const submit = async () => {
    setPending(true);
    setResult(null);
    try {
      const response = await explain({
        data: {
          kind: "matematicas",
          level,
          language: tab,
          question,
          facts: [],
          skills: active,
          topic: slug,
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

  return (
    <main id="contenido" className="mx-auto max-w-3xl px-5 py-10">
      <p className="font-mono text-sm text-copper">{topic.kicker}</p>
      <h1 className="mt-3 font-serif text-4xl">{topic.title}</h1>
      <p className="mt-4 font-mono text-lg">{topic.formula}</p>
      <p className="mt-4 text-lg text-pretty">{topic.promise}</p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Qué dice</h2>
        {topic.meaning.map((paragraph) => (
          <p key={paragraph} className="mt-3 text-pretty">
            {paragraph}
          </p>
        ))}
      </section>
      <section className="mt-8">
        <h2 className="font-serif text-2xl">Cómo se razona</h2>
        {topic.reasoning.map((paragraph) => (
          <p key={paragraph} className="mt-3 text-pretty">
            {paragraph}
          </p>
        ))}
      </section>
      {topic.whyNotOnlySimple && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">Por qué no siempre basta lo simple</h2>
          {topic.whyNotOnlySimple.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-pretty">
              {paragraph}
            </p>
          ))}
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Pseudocódigo</h2>
        <pre className="mt-3 overflow-x-auto border border-line p-4 font-mono text-sm leading-relaxed whitespace-pre">
          {topic.pseudocode}
        </pre>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">En código</h2>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            aria-pressed={tab === "python"}
            onClick={() => setTab("python")}
            className={cn(
              "tap min-h-11 px-4 font-mono text-sm",
              tab === "python" ? "bg-ink text-paper" : "border border-line",
            )}
          >
            Python
          </button>
          <button
            type="button"
            aria-pressed={tab === "javascript"}
            onClick={() => setTab("javascript")}
            className={cn(
              "tap min-h-11 px-4 font-mono text-sm",
              tab === "javascript" ? "bg-ink text-paper" : "border border-line",
            )}
          >
            JavaScript
          </button>
        </div>
        <div className="mt-3">
          <CodeBlock source={tab === "python" ? topic.python : topic.javascript} label={tab === "python" ? "Python" : "JavaScript"} />
        </div>
      </section>

      <Experiment slug={slug} />

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="font-serif text-2xl">Pedirlo a tu nivel</h2>
        <p className="mt-2 text-pretty text-muted">
          El texto de arriba no cambia. Esto añade una explicación del modelo, con las skills de matemáticas y de
          algoritmos. No sustituye al cálculo.
        </p>
        <div className="mt-4 grid grid-cols-3 border border-line">
          {levelOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={level === option.id}
              onClick={() => setLevel(option.id)}
              className={cn("tap min-h-11 font-mono text-sm", level === option.id ? "bg-ink text-paper" : "text-muted")}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-pretty text-muted">{levelOptions.find((option) => option.id === level)?.hint}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {active.map((id) => (
            <li key={id} className="border border-line px-3 py-2 font-mono text-sm">
              {skills[id].name}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["lenguajes", "optimizacion", "depuracion"] as SkillId[])
            .filter((id) => !active.includes(id))
            .map((id) => (
              <Button key={id} tone="ghost" onClick={() => setForcedOn((prev) => [...new Set([...prev, id])])}>
                Añadir {skills[id].name}
              </Button>
            ))}
        </div>
        <label className="mt-4 flex flex-col gap-2 font-mono text-sm">
          Una pregunta, si la tienes
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            maxLength={600}
            className="w-full border border-line bg-paper p-3 font-serif text-base"
          />
        </label>
        <Button tone="primary" className="mt-4" disabled={pending} onClick={() => void submit()}>
          {pending ? "Preparando la explicación…" : "Explicar a mi nivel"}
        </Button>
        {result && !result.ok && <p className="mt-4 border-l border-copper pl-4 text-pretty">{result.error}</p>}
        {result?.ok && (
          <ExplanationView
            explanation={result.explanation}
            cached={result.cached}
            onAsk={(next) => {
              setQuestion(next);
              setResult(null);
            }}
          />
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Sigue</h2>
        <ul className="mt-3 flex flex-col">
          {topic.see.map((slugSee) => {
            const concept = getConcept(slugSee);
            if (!concept) return null;
            return (
              <li key={slugSee} className="border-t border-line">
                <Link
                  to="/biblioteca/$slug"
                  params={{ slug: slugSee }}
                  className="flex min-h-11 items-center font-serif text-xl"
                >
                  {concept.title}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-col gap-2 font-mono text-sm sm:flex-row sm:justify-between">
          {previous ? (
            <Link to="/matematicas/$slug" params={{ slug: previous.slug }} className="inline-flex min-h-11 items-center">
              {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to="/matematicas/$slug" params={{ slug: next.slug }} className="inline-flex min-h-11 items-center">
              {next.title}
            </Link>
          ) : (
            <Link to="/matematicas" className="inline-flex min-h-11 items-center">
              Índice
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
