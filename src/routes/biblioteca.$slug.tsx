import { useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CodeBlock } from "@/components/code-block";
import { getConcept, threadOf } from "@/lib/content/concepts";
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
  const { mark } = useReading();
  const thread = threadOf(slug);
  const position = thread?.slugs.indexOf(slug) ?? -1;
  const previous = position > 0 ? thread?.slugs[position - 1] : undefined;
  const next = thread && position >= 0 ? thread.slugs[position + 1] : undefined;

  useEffect(() => {
    mark(slug);
  }, [mark, slug]);

  return (
    <main id="contenido" className="mx-auto max-w-2xl px-5 py-10">
      <p className="font-mono text-sm text-copper">{concept.thread}</p>
      <h1 className="mt-3 font-serif text-4xl">{concept.title}</h1>
      <p className="mt-4 text-lg text-pretty">{concept.summary}</p>
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
        <h2 className="font-serif text-2xl">Sigue el hilo</h2>
        <ul className="mt-3 border-t border-line">
          {previous && <Neighbor slug={previous} />}
          {next && <Neighbor slug={next} />}
          {concept.see.map((item) => (
            <Neighbor key={item} slug={item} />
          ))}
        </ul>
        {concept.also && concept.also.length > 0 && (
          <ul className="mt-4 flex flex-col">
            {concept.also.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="inline-flex min-h-11 items-center font-mono text-sm text-copper">
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

function Neighbor({ slug }: { slug: string }) {
  const concept = getConcept(slug);
  if (!concept) return null;
  return (
    <li className="border-b border-line">
      <Link to="/biblioteca/$slug" params={{ slug }} className="flex min-h-11 items-center justify-between gap-4">
        <span className="font-serif text-xl">{concept.title}</span>
        <span className="font-mono text-sm text-muted">{concept.thread}</span>
      </Link>
    </li>
  );
}
