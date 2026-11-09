import { useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CodeBlock } from "@/components/code-block";
import { getConcept, type RelationType } from "@/lib/content/concepts";
import { useReading } from "@/lib/reading";

export const Route = createFileRoute("/biblioteca/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${getConcept(params.slug)?.title ?? "Biblioteca"} — Cifra` }],
  }),
  component: ConceptPage,
});

function ConceptPage() {
  const { slug } = Route.useParams();
  const concept = getConcept(slug);
  if (!concept) throw notFound();
  const { mark, difficult, toggleDifficult } = useReading();
  const isDifficult = difficult.includes(slug);

  useEffect(() => {
    mark(slug);
  }, [mark, slug]);

  return (
    <main id="contenido" className="mx-auto max-w-2xl px-5 py-10">
      <p className="font-mono text-sm text-copper">{concept.thread}</p>
      <h1 className="mt-3 font-serif text-4xl">{concept.title}</h1>
      <p className="mt-4 text-lg text-pretty">{concept.summary}</p>
      <button
        type="button"
        aria-pressed={isDifficult}
        onClick={() => toggleDifficult(slug)}
        className={
          "tap mt-4 min-h-11 border px-3 font-mono text-sm " +
          (isDifficult ? "border-copper text-copper" : "border-line")
        }
      >
        {isDifficult ? "Quitar marca de difícil" : "Marcar como difícil"}
      </button>
      {concept.body.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-pretty">
          {paragraph}
        </p>
      ))}
      {concept.code && (
        <div className="mt-6">
          <CodeBlock source={concept.code.source} label={concept.code.language} />
          <p className="mt-2 text-pretty text-muted">{concept.code.caption}</p>
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Conexiones</h2>
        <p className="mt-2 text-pretty text-muted">
          Cada vínculo indica cómo se relacionan estas ideas. El mapa completo permite saltar a
          cualquier otro concepto.
        </p>
        <ul className="mt-3 border-t border-line">
          {concept.relaciones.map((relation) => (
            <Neighbor
              key={`${relation.slug}-${relation.tipo}`}
              slug={relation.slug}
              tipo={relation.tipo}
            />
          ))}
        </ul>
        <Link
          to="/biblioteca"
          className="mt-4 inline-flex min-h-11 items-center font-mono text-sm text-copper"
        >
          Abrir el mapa completo
        </Link>
        {concept.also && concept.also.length > 0 && (
          <ul className="mt-4 flex flex-col">
            {concept.also.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-11 items-center font-mono text-sm text-copper"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Neighbor({ slug, tipo }: { slug: string; tipo: RelationType }) {
  const concept = getConcept(slug);
  if (!concept) return null;
  const label = tipo === "adelante" ? "Adelante" : tipo === "atras" ? "Atrás" : "En paralelo";
  return (
    <li className="border-b border-line">
      <Link
        to="/biblioteca/$slug"
        params={{ slug }}
        className="flex min-h-11 items-center justify-between gap-4"
      >
        <span className="font-serif text-xl">{concept.title}</span>
        <span className="shrink-0 font-mono text-xs text-muted">{label}</span>
      </Link>
    </li>
  );
}
