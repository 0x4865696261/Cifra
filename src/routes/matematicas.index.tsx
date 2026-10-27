import { createFileRoute, Link } from "@tanstack/react-router";
import { mathTopics } from "@/lib/content/math";

export const Route = createFileRoute("/matematicas/")({
  head: () => ({ meta: [{ title: "Matemáticas — Cifra" }] }),
  component: MathIndex,
});

function MathIndex() {
  return (
    <main id="contenido" className="mx-auto max-w-3xl px-5 py-10">
      <p className="font-mono text-sm text-copper">Matemáticas</p>
      <h1 className="mt-3 font-serif text-4xl">De la fórmula a los pasos.</h1>
      <p className="mt-4 text-pretty">
        Cada puente dice qué significa la idea, cómo se razona, cómo queda en pseudocódigo y cómo se escribe en dos
        lenguajes. Abajo puedes mover los valores. Eso es un cálculo de Cifra, no una demostración dibujada.
      </p>
      <ol className="mt-10 border-t border-line">
        {mathTopics.map((topic, index) => (
          <li key={topic.slug} className="border-b border-line py-5">
            <Link to="/matematicas/$slug" params={{ slug: topic.slug }} className="block min-h-11">
              <p className="font-mono text-sm text-muted">
                {String(index + 1).padStart(2, "0")} · {topic.kicker}
              </p>
              <h2 className="mt-1 font-serif text-3xl">{topic.title}</h2>
              <p className="mt-2 font-mono text-sm">{topic.formula}</p>
              <p className="mt-2 text-pretty text-muted">{topic.promise}</p>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
