import { createFileRoute, Link } from "@tanstack/react-router";
import { threads, concepts } from "@/lib/content/concepts";
import { skills, skillIds } from "@/lib/skills/registry";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <p className="font-mono text-sm text-copper">Una plataforma para leer software</p>
      <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
        Entender el código es tan importante como escribirlo.
      </h1>
      <p className="mt-6 max-w-2xl border-l border-copper pl-5 text-lg leading-relaxed text-pretty">
        Generar un programa ya es rápido. Cifra existe para la otra mitad: leerlo, saber qué se está suponiendo y
        poder ir de una ecuación a los pasos que la calculan.
      </p>

      <div className="mt-12 grid gap-10 border-t border-line pt-8 md:grid-cols-2">
        <Link to="/estudio" className="group block min-h-11">
          <p className="font-mono text-sm text-muted">01</p>
          <h2 className="mt-2 font-serif text-3xl group-hover:text-copper">Un programa</h2>
          <p className="mt-3 max-w-md text-pretty">
            Pega un fragmento. Cifra separa lo que está escrito de lo que solo se puede deducir, y lo explica al nivel
            que elijas.
          </p>
        </Link>
        <Link to="/matematicas" className="group block min-h-11">
          <p className="font-mono text-sm text-muted">02</p>
          <h2 className="mt-2 font-serif text-3xl group-hover:text-copper">Una ecuación</h2>
          <p className="mt-3 max-w-md text-pretty">
            De la fórmula al razonamiento, al pseudocódigo y a una implementación cuyos valores puedes mover.
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

      <section className="mt-16 max-w-2xl">
        <h2 className="font-serif text-3xl">Cómo explica</h2>
        <p className="mt-3 text-pretty">
          La explicación no sale de una orden genérica de «programa bien». Sale de skills que se combinan: pedagogía
          siempre, y además análisis, matemáticas, algoritmos, depuración, optimización, lenguajes o seguridad, según
          lo que haya delante.
        </p>
        <ul className="mt-5 border-t border-line">
          {skillIds.map((id) => (
            <li key={id} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <span className="font-mono text-sm">{skills[id].name}</span>
              <span className="text-pretty text-muted">{skills[id].purpose}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-serif text-3xl">Qué hace esta versión</h2>
        <p className="mt-3 text-pretty">
          Puedes leer un fragmento, pedir una explicación al nivel que marques y recorrer ocho puentes entre una idea
          matemática y su código. Hay dieciocho conceptos enlazados y el mismo conteo de palabras escrito en cinco
          lenguajes, con lo que de verdad cambia.
        </p>
        <p className="mt-3 text-pretty">
          Todavía no ejecuta tu código: haría falta un entorno aislado, y fingirlo sería mentir. Tampoco abre un
          proyecto entero, ni sigue imports entre archivos, ni tiene cuentas. El progreso de lectura se queda en este
          navegador. Los frameworks no tienen todavía un ensayo propio; si aparecen, será con contenido, no con un
          botón vacío.
        </p>
      </section>
    </main>
  );
}
