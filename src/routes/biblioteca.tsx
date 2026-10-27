import { createFileRoute, Link } from "@tanstack/react-router";
import { concepts, threads } from "@/lib/content/concepts";
import { useReading } from "@/lib/reading";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({ meta: [{ title: "Biblioteca — Cifra" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const { read } = useReading();
  return (
    <main id="contenido" className="mx-auto max-w-3xl px-5 py-10">
      <p className="font-mono text-sm text-copper">Biblioteca</p>
      <h1 className="mt-3 font-serif text-4xl">Una red pequeña, y de verdad.</h1>
      <p className="mt-4 text-pretty">
        Dieciocho textos. No está «todo sobre compiladores». Está lo necesario para no leer cada idea como si
        empezara de cero. {read.length > 0 ? `En este navegador hay ${read.length} de ${concepts.length} marcados.` : "Nada marcado todavía."}
      </p>
      <div className="mt-10 flex flex-col gap-10">
        {threads.map((thread) => (
          <section key={thread.id}>
            <h2 className="font-serif text-2xl">{thread.title}</h2>
            <ul className="mt-3 border-t border-line">
              {thread.slugs.map((slug) => {
                const concept = concepts.find((item) => item.slug === slug);
                if (!concept) return null;
                const seen = read.includes(slug);
                return (
                  <li key={slug} className="border-b border-line">
                    <Link to="/biblioteca/$slug" params={{ slug }} className="block py-4">
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="font-serif text-2xl">{concept.title}</span>
                        {seen ? <span className="font-mono text-sm text-copper">leído</span> : null}
                      </span>
                      <span className="mt-1 block text-pretty text-muted">{concept.summary}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
