import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/studio/studio";
import { DebugStudio } from "@/components/studio/debug";
import { RunStudio } from "@/components/studio/run";
import type { LanguageId } from "@/lib/analyze/structure";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/estudio")({
  head: () => ({ meta: [{ title: "Estudio — Cifra" }] }),
  component: EstudioPage,
});

const modes = [
  { id: "lee", label: "Lee el programa" },
  { id: "fallo", label: "Estudia el fallo" },
  { id: "ejecuta", label: "Ejecuta" },
] as const;

type PendienteFallo = { code: string; errorMessage: string; language: LanguageId };

function EstudioPage() {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("lee");
  const [pendienteFallo, setPendienteFallo] = useState<PendienteFallo | null>(null);

  const llevarAlFallo = (codigo: string, mensaje: string, lenguaje: string) => {
    if (lenguaje === "javascript" || lenguaje === "python" || lenguaje === "rust") {
      setPendienteFallo({ code: codigo, errorMessage: mensaje, language: lenguaje });
    }
    setMode("fallo");
  };

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
      <p className="font-mono text-sm text-copper">Estudio</p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl">Lee un programa antes de reescribirlo. Y cuando falla, entiende el fallo antes de taparlo.</h1>
      <p className="mt-4 max-w-2xl text-pretty">
        El análisis y la guía leen el texto y el mensaje del error, y usan el modelo solo cuando
        pulsas. La pestaña Ejecuta corre el código en tu propio navegador, aislado y con límites,
        y si falla lleva el mensaje a «Estudia el fallo».
      </p>
      <div className="mt-6 grid grid-cols-3 max-w-xl border border-line">
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
        {mode === "lee" && <Studio />}
        {mode === "fallo" && <DebugStudio inicial={pendienteFallo ?? undefined} />}
        {mode === "ejecuta" && (
          <RunStudio onEstudiarFallo={(codigo, mensaje, lenguaje) => llevarAlFallo(codigo, mensaje, lenguaje)} />
        )}
      </div>
    </main>
  );
}
