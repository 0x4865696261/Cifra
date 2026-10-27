import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CodeBlock } from "@/components/code-block";
import { getConcept } from "@/lib/content/concepts";
import { languageEssays, wordCountNotes } from "@/lib/content/languages";
import { languageIds, languageLabels } from "@/lib/analyze/structure";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/lenguajes")({
  head: () => ({ meta: [{ title: "Lenguajes — Cifra" }] }),
  component: LanguagesPage,
});

function LanguagesPage() {
  const [current, setCurrent] = useState(wordCountNotes[0].id);
  const note = wordCountNotes.find((item) => item.id === current) ?? wordCountNotes[0];

  return (
    <main id="contenido" className="mx-auto max-w-3xl px-5 py-10">
      <p className="font-mono text-sm text-copper">Lenguajes</p>
      <h1 className="mt-3 font-serif text-4xl">El mismo problema, no la misma frase.</h1>
      <p className="mt-4 text-pretty">
        Contar palabras. En todos los casos el resultado es una clave y un número. La diferencia no está en traducir
        el bucle línea a línea: está en quién crea la tabla, qué pasa si la clave no existe y cuánto vive el texto.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {wordCountNotes.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === note.id}
            onClick={() => setCurrent(item.id)}
            className={cn(
              "tap min-h-11 px-4 font-mono text-sm",
              item.id === note.id ? "bg-ink text-paper" : "border border-line",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <CodeBlock source={note.code} label={note.label} />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {note.changed.map((paragraph) => (
          <p key={paragraph} className="text-pretty">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-10">
        {languageEssays.map((essay) => {
          const concept = getConcept(essay.see);
          return (
            <section key={essay.id} id={essay.id}>
              <h2 className="font-serif text-3xl">{essay.title}</h2>
              {essay.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-pretty">
                  {paragraph}
                </p>
              ))}
              {concept && (
                <Link
                  to="/biblioteca/$slug"
                  params={{ slug: concept.slug }}
                  className="mt-3 inline-flex min-h-11 items-center font-mono text-sm text-copper"
                >
                  Seguir en {concept.title}
                </Link>
              )}
            </section>
          );
        })}
      </div>

      <section className="mt-12 border-t border-line pt-6">
        <h2 className="font-serif text-2xl">Qué se puede pegar en el estudio</h2>
        <p className="mt-3 text-pretty">
          El estudio reconoce la forma de {languageIds.map((id) => languageLabels[id]).join(", ")}. Reconocer no es un
          curso. Node es un entorno para JavaScript, no otro lenguaje, y no tiene página propia todavía. Los
          frameworks tampoco: cuando entren, será con una diferencia que merezca leerse.
        </p>
        <Link to="/estudio" className="mt-3 inline-flex min-h-11 items-center font-mono text-sm text-copper">
          Ir al estudio
        </Link>
      </section>
    </main>
  );
}
