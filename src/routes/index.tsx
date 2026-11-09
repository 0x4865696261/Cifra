import { PortadaCursos } from "@/components/portada-cursos";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getConcept, recommendNextConcept, threads, concepts } from "@/lib/content/concepts";
import { wordCountNotes } from "@/lib/content/languages";
import { useReading } from "@/lib/reading";
import { skills, skillIds } from "@/lib/skills/registry";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { read, difficult, plan, setPlan } = useReading();
  const suggestion = recommendNextConcept(read, difficult, plan);
  const recommended = suggestion
    ? {
        ...suggestion,
        path: suggestion.thread.slugs.slice(
          Math.max(0, suggestion.thread.slugs.indexOf(suggestion.concept.slug) - 1),
          Math.min(
            suggestion.thread.slugs.length,
            suggestion.thread.slugs.indexOf(suggestion.concept.slug) + 3,
          ),
        ),
      }
    : null;

  return (
    <main id="contenido" className="curso-contenedor">
      <PortadaCursos />

      <section className="curso-seccion">
        <h2>Por temática</h2>
        <p className="mt-3 max-w-2xl text-pretty text-muted">
          La biblioteca no es una lista suelta. Cada concepto empuja hacia el siguiente.
        </p>
        <ol className="curso-temas">
          {threads.map((thread) => {
            const first = concepts.find((concept) => concept.slug === thread.slugs[0]);
            return (
              <li key={thread.id} className="curso-tarjeta">
                <Link
                  to="/biblioteca/$slug"
                  params={{ slug: thread.slugs[0] }}
                  className="flex min-h-16 flex-col justify-center gap-2"
                >
                  <span className="font-serif text-2xl">{thread.title}</span>
                  <span className="text-sm text-muted">Empieza por {first?.title} →</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-serif text-3xl">Itinerario de la red</h2>
        <p className="mt-3 text-pretty text-muted">
          Elige por dónde empezar. El progreso y las marcas de difícil se guardan en este navegador.
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Plan de lectura">
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
        {recommended ? (
          <div className="mt-6 rounded border border-line bg-panel p-5">
            <p className="font-mono text-sm text-copper">
              {recommended.motivo === "repaso" ? "Repaso sugerido" : "Siguiente paso"}
            </p>
            <h3 className="mt-2 font-serif text-3xl">{recommended.concept.title}</h3>
            <p className="mt-2 text-pretty text-muted">{recommended.thread.title}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {recommended.path.map((slug) => {
                const concept = getConcept(slug);
                if (!concept) return null;
                const isCurrent = concept.slug === recommended.concept.slug;
                return (
                  <Link
                    key={slug}
                    to="/biblioteca/$slug"
                    params={{ slug }}
                    className={
                      "inline-flex min-h-11 items-center rounded-full border px-3 font-mono text-xs " +
                      (isCurrent ? "border-copper bg-copper text-ink" : "border-line text-muted")
                    }
                  >
                    {concept.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded border border-line bg-panel p-5">
            <p className="font-mono text-sm text-copper">Red completa</p>
            <p className="mt-2 text-pretty text-muted">
              Ya has visitado la base de la red de conocimiento. Puedes seguir desde cualquier hilo
              o volver a un punto anterior.
            </p>
          </div>
        )}
      </section>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-serif text-3xl">Cómo explica</h2>
        <p className="mt-3 text-pretty">
          La explicación no sale de una orden genérica de «programa bien». Sale de skills que se
          combinan: pedagogía siempre, y además análisis, matemáticas, algoritmos, depuración,
          optimización, lenguajes o seguridad, según lo que haya delante.
        </p>
        <ul className="mt-5 border-t border-line">
          {skillIds.map((id) => (
            <li
              key={id}
              className="grid gap-1 border-b border-line py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
            >
              <span className="font-mono text-sm">{skills[id].name}</span>
              <span className="text-pretty text-muted">{skills[id].purpose}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-serif text-3xl">Qué hace esta versión</h2>
        <p className="mt-3 text-pretty">
          La biblioteca conecta conceptos con relaciones explícitas y abre seis hilos nuevos. Cada
          puente matemático enlaza con su algoritmo y con el lenguaje que lo expresa. El comparador
          resuelve el mismo conteo de palabras en {wordCountNotes.length} lenguajes de código y
          explica qué cambia en la traducción. Los retos de fundamentos y los paquetes de incidentes
          llevan a los conceptos que los sostienen.
        </p>
        <p className="mt-3 text-pretty">
          El itinerario recuerda el plan elegido, el progreso y los conceptos difíciles en este
          navegador. Cifra todavía no abre un proyecto entero ni sigue imports entre archivos;
          tampoco tiene cuentas ni ranking. El progreso de retos se puede exportar e importar como
          fichero.
        </p>
      </section>
    </main>
  );
}
