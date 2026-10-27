import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/studio/studio";

export const Route = createFileRoute("/estudio")({
  head: () => ({ meta: [{ title: "Estudio — Cifra" }] }),
  component: EstudioPage,
});

function EstudioPage() {
  return (
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
      <p className="font-mono text-sm text-copper">Estudio</p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl">Lee un programa antes de reescribirlo.</h1>
      <p className="mt-4 max-w-2xl text-pretty">
        El análisis de la izquierda mira el texto. La explicación de la derecha, si la pides, usa el modelo y las
        skills que dejes activas. No son la misma cosa.
      </p>
      <div className="mt-10">
        <Studio />
      </div>
    </main>
  );
}
