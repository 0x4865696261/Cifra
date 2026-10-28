import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/studio/studio";
import { DebugStudio } from "@/components/studio/debug";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/estudio")({
  head: () => ({ meta: [{ title: "Estudio — Cifra" }] }),
  component: EstudioPage,
});

const modes = [
  { id: "lee", label: "Lee el programa" },
  { id: "fallo", label: "Estudia el fallo" },
] as const;

function EstudioPage() {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("lee");

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
      <p className="font-mono text-sm text-copper">Estudio</p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl">Lee un programa antes de reescribirlo. Y cuando falla, entiende el fallo antes de taparlo.</h1>
      <p className="mt-4 max-w-2xl text-pretty">
        El análisis de la izquierda mira el texto, y mira también el mensaje del error si hay uno. La guía de la
        derecha, si la pides, usa el modelo, las skills y la clave que dejes activas. No ejecuta nada.
      </p>
      <div className="mt-6 grid grid-cols-2 max-w-md border border-line">
        {modes.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={mode === option.id}
            onClick={() => setMode(option.id)}
            className={cn(
              "tap min-h-11 px-2 font-mono text-sm",
              mode === option.id ? "bg-ink text-paper" : "text-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-10">
        {mode === "lee" ? <Studio /> : <DebugStudio />}
      </div>
    </main>
  );
}
