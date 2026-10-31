import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/studio/studio";
import { DebugStudio } from "@/components/studio/debug";
import { RunStudio } from "@/components/studio/run";
import { CompararStudio } from "@/components/studio/comparar";
import type { LanguageId } from "@/lib/analyze/structure";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/estudio")({
  head: () => ({ meta: [{ title: "Estudio â€” Cifra" }] }),
  component: EstudioPage,
});

const modes = [
  { id: "lee", label: "Lee el programa" },
  { id: "fallo", label: "Estudia el fallo" },
  { id: "ejecuta", label: "Ejecuta" },
  { id: "compara", label: "Compara" },
] as const;

type PendienteFallo = { code: string; errorMessage: string; language: LanguageId };

/** La llave con la que un fallo viaja aquÃ­ desde los retos (0.4.C): la escribe `/retos/$id`. */
const CLAVE_FALLO_ESTUDIO = "cifra.fallo-estudio";

function falloDeLaSesion(): PendienteFallo | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const crudo = sessionStorage.getItem(CLAVE_FALLO_ESTUDIO);
    if (!crudo) return null;
    sessionStorage.removeItem(CLAVE_FALLO_ESTUDIO);
    const leido = JSON.parse(crudo) as unknown;
    if (
      leido &&
      typeof leido === "object" &&
      "code" in leido &&
      "errorMessage" in leido &&
      typeof (leido as { code: unknown }).code === "string" &&
      typeof (leido as { errorMessage: unknown }).errorMessage === "string"
    ) {
      const language = (leido as { language?: unknown }).language;
      return {
        code: (leido as { code: string }).code,
        errorMessage: (leido as { errorMessage: string }).errorMessage,
        language: language === "python" || language === "rust" ? language : "javascript",
      };
    }
    return null;
  } catch {
    return null;
  }
}

function EstudioPage() {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("lee");
  const [pendienteFallo, setPendienteFallo] = useState<PendienteFallo | null>(null);

  // Un fallo que llega de los retos (0.4.C) aterriza directamente en Â«Estudia el falloÂ».
  useEffect(() => {
    const vendido = falloDeLaSesion();
    if (vendido) {
      setPendienteFallo(vendido);
      setMode("fallo");
    }
  }, []);

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
        El anÃ¡lisis y la guÃ­a leen el texto y el mensaje del error, y usan el modelo solo cuando
        pulsas. La pestaÃ±a Ejecuta corre el cÃ³digo en tu propio navegador, aislado y con lÃ­mites,
        y si falla lleva el mensaje a Â«Estudia el falloÂ».
      </p>
      <div className="mt-6 grid grid-cols-2 max-w-xl border border-line sm:grid-cols-4">
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
        {mode === "compara" && <CompararStudio />}
      </div>
    </main>
  );
}
