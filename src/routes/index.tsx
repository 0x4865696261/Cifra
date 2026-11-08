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
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <p className="font-mono text-sm text-copper">Versión 0.8 · Un compilador que comprueba</p>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.24em] text-muted">
        Una plataforma para leer software
      </p>
      <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
        Entender el código es tan importante como escribirlo.
      </h1>
      <p className="mt-6 max-w-2xl border-l border-copper pl-5 text-lg leading-relaxed text-pretty">
        Generar un programa ya es rápido. Cifra existe para la otra mitad: leerlo, saber qué se está
        suponiendo y poder ir de una ecuación a los pasos que la calculan. En esta versión, la
        biblioteca funciona como red: cada concepto enlaza con el que lo sostiene y con el siguiente
        paso.
      </p>
      <Link to="/estudio" search={{ modo: "comprobar" }} className="mt-4 inline-block underline">
        Probar el comprobador de Cifra
      </Link>

      <div className="mt-12 grid gap-10 border-t border-line pt-8 md:grid-cols-3">
        <Link to="/retos" className="group block min-h-11">
          <p className="font-mono text-sm text-muted">01</p>
          <h2 className="mt-2 font-serif text-3xl group-hover:text-copper">Retos</h2>
          <p className="mt-3 max-w-md text-pretty">
            Fundamentos con veredicto real: pruebas que corren en tu navegador y una defensa que
            comprueba que entiendes lo que escribiste.
          </p>
        </Link>
        <Link to="/estudio" className="group block min-h-11">
          <p className="font-mono text-sm text-muted">02</p>
          <h2 className="mt-2 font-serif text-3xl group-hover:text-copper">Un programa</h2>
          <p className="mt-3 max-w-md text-pretty">
            Pega un fragmento. Cifra separa lo que está escrito de lo que solo se puede deducir, y
            lo explica al nivel que elijas.
          </p>
        </Link>
        <Link to="/matematicas" className="group block min-h-11">
          <p className="font-mono text-sm text-muted">03</p>
          <h2 className="mt-2 font-serif text-3xl group-hover:text-copper">Una ecuación</h2>
          <p className="mt-3 max-w-md text-pretty">
            De la fórmula al razonamiento, al pseudocódigo y a una implementación cuyos valores
            puedes mover.
          </p>
        </Link>
      </div>

      <section className="mt-16">
        <h2 className="font-serif text-3xl">Hilos</h2>
        <p className="mt-3 max-w-2xl text-pretty text-muted">
          La biblioteca no es una lista suelta. Cada concepto empuja hacia el siguiente.
        </p>
        <ol className="mt-6 border-t border-line">
          {threads.map((thread) => {
            const first = concepts.find((concept) => concept.slug === thread.slugs[0]);
            return (
              <li key={thread.id} className="border-b border-line">
                <Link
                  to="/biblioteca/$slug"
                  params={{ slug: thread.slugs[0] }}
                  className="flex min-h-16 flex-col justify-center gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="font-serif text-2xl">{thread.title}</span>
                  <span className="font-mono text-sm text-muted">{first?.title}</span>
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
