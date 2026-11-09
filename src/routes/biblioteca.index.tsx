import { createFileRoute, Link } from "@tanstack/react-router";
import { concepts, getConcept, recommendNextConcept, threads } from "@/lib/content/concepts";
import { useReading } from "@/lib/reading";

export const Route = createFileRoute("/biblioteca/")({
  head: () => ({ meta: [{ title: "Biblioteca — Cifra" }] }),
  validateSearch: (search): { q?: string } =>
    typeof search.q === "string" && search.q.trim() ? { q: search.q.trim().slice(0, 100) } : {},
  component: LibraryPage,
});

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function LibraryPage() {
  const { q } = Route.useSearch();
  const filtro = normalizar(q ?? "");
  const visibles = new Set(
    concepts
      .filter((concepto) => normalizar(concepto.title + " " + concepto.summary).includes(filtro))
      .map((concepto) => concepto.slug),
  );
  const { read, difficult, plan, setPlan } = useReading();
  const recommendation = recommendNextConcept(read, difficult, plan);
  return (
    <main id="contenido" className="curso-contenedor">
      <p className="curso-etiqueta">Biblioteca de Cifra</p>
      <h1 className="mt-3 font-serif text-4xl">Tutoriales por temática</h1>
      <p className="mt-4 text-pretty">
        {concepts.length} conceptos conectados. Desde cualquiera puedes seguir sus relaciones o
        volver al mapa completo.{" "}
        {read.length > 0
          ? `Has leído ${read.length} y marcado ${difficult.length} como difíciles.`
          : "El progreso se guarda en este navegador."}
      </p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Plan de lectura">
        <button
          type="button"
          aria-pressed={plan === "desde-cero"}
          onClick={() => setPlan("desde-cero")}
          className={
            "tap min-h-11 px-4 font-mono text-sm " +
            (plan === "desde-cero" ? "bg-ink text-paper" : "border border-line")
          }
        >
          Empiezo desde cero
        </button>
        <button
          type="button"
          aria-pressed={plan === "ya-se"}
          onClick={() => setPlan("ya-se")}
          className={
            "tap min-h-11 px-4 font-mono text-sm " +
            (plan === "ya-se" ? "bg-ink text-paper" : "border border-line")
          }
        >
          Ya programo
        </button>
      </div>
      {recommendation && (
        <p
          className="mt-5 border-l border-copper pl-4 text-pretty"
          role="status"
          aria-live="polite"
        >
          {recommendation.motivo === "repaso" ? "Repasa " : "Sigue con "}
          <Link
            to="/biblioteca/$slug"
            params={{ slug: recommendation.concept.slug }}
            className="font-serif text-xl underline decoration-copper underline-offset-4"
          >
            {recommendation.concept.title}
          </Link>{" "}
          · {recommendation.thread.title}
        </p>
      )}
      {q && (
        <p className="mt-5" role="status">
          {visibles.size} resultados para «{q}».{" "}
          <Link to="/biblioteca" className="underline">
            Quitar filtro
          </Link>
        </p>
      )}
      <div className="curso-temas">
        {threads
          .filter((thread) => thread.slugs.some((slug) => visibles.has(slug)))
          .map((thread) => (
            <section key={thread.id} className="curso-tarjeta">
              <h2 className="font-serif text-2xl">{thread.title}</h2>
              <ul className="mt-3 border-t border-line">
                {thread.slugs
                  .filter((slug) => visibles.has(slug))
                  .map((slug) => {
                    const concept = getConcept(slug);
                    if (!concept) return null;
                    const seen = read.includes(slug);
                    const markedDifficult = difficult.includes(slug);
                    return (
                      <li key={slug} className="border-b border-line">
                        <Link to="/biblioteca/$slug" params={{ slug }} className="block py-4">
                          <span className="flex items-baseline justify-between gap-4">
                            <span className="font-serif text-2xl">{concept.title}</span>
                            <span className="flex flex-wrap gap-3 font-mono text-sm">
                              {seen ? <span className="text-copper">leído</span> : null}
                              {markedDifficult ? <span className="text-muted">difícil</span> : null}
                            </span>
                          </span>
                          <span className="mt-1 block text-pretty text-muted">
                            {concept.summary}
                          </span>
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
