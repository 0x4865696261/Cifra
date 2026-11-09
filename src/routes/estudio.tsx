import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/studio/studio";
import { DebugStudio } from "@/components/studio/debug";
import { RunStudio } from "@/components/studio/run";
import { CompararStudio } from "@/components/studio/comparar";
import { ComprobarStudio } from "@/components/studio/comprobar";
import { isLanguageId, type LanguageId } from "@/lib/analyze/structure";
import { cn } from "@/lib/cn";

const modes = [
  { id: "lee", label: "Lee el programa" },
  { id: "fallo", label: "Estudia el fallo" },
  { id: "ejecuta", label: "Ejecuta" },
  { id: "compara", label: "Compara" },
  { id: "comprueba", label: "Comprueba" },
] as const;

type Modo = (typeof modes)[number]["id"];
export const Route = createFileRoute("/estudio")({
  head: () => ({ meta: [{ title: "Estudio — Cifra" }] }),
  validateSearch: (search): { modo?: Modo | "comprobar" } => {
    const modo = search.modo;
    if (modo === "comprobar") return { modo };
    return { modo: modes.find((opcion) => opcion.id === modo)?.id };
  },
  component: EstudioPage,
});

type PendienteFallo = { code: string; errorMessage: string; language: LanguageId };

/** La llave con la que un fallo viaja aquí desde los retos (0.4.C): la escribe `/retos/$id`. */
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
        language: typeof language === "string" && isLanguageId(language) ? language : "javascript",
      };
    }
    return null;
  } catch {
    return null;
  }
}

function EstudioPage() {
  const { modo } = Route.useSearch();
  const navigate = Route.useNavigate();
  const mode: Modo = modo === "comprobar" ? "comprueba" : modo ?? "lee";
  const setMode = (siguiente: Modo) => { void navigate({ search: { modo: siguiente }, replace: true }); };
  const [pendienteFallo, setPendienteFallo] = useState<PendienteFallo | null>(null);

  // Un fallo que llega de los retos (0.4.C) aterriza directamente en «Estudia el fallo».
  useEffect(() => {
    const vendido = falloDeLaSesion();
    if (vendido) {
      setPendienteFallo(vendido);
      void navigate({ search: { modo: "fallo" }, replace: true });
    }
  }, [navigate]);

  const llevarAlFallo = (codigo: string, mensaje: string, lenguaje: string) => {
    const language = lenguaje === "web" ? "html" : lenguaje;
    if (isLanguageId(language)) setPendienteFallo({ code: codigo, errorMessage: mensaje, language });
    setMode("fallo");
  };

  return (
    <main id="contenido" className="mx-auto max-w-[100rem] px-3 py-4 sm:px-5">
      <p className="font-mono text-sm text-copper">Estudio</p>
      <h1 className="mt-2 font-serif text-3xl">Estudia tu código</h1>
      <div className="mt-6 grid grid-cols-2 max-w-xl border border-line sm:grid-cols-5">
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
      <div className="mt-4">
        {mode === "lee" && <Studio />}
        {mode === "fallo" && <DebugStudio key={pendienteFallo ? "importado" : "local"} inicial={pendienteFallo ?? undefined} />}
        {mode === "ejecuta" && (
          <RunStudio onEstudiarFallo={(codigo, mensaje, lenguaje) => llevarAlFallo(codigo, mensaje, lenguaje)} />
        )}
        {mode === "compara" && <CompararStudio />}
        <div hidden={mode !== "comprueba"}>
          <ComprobarStudio onEstudiarFallo={(code, errorMessage) => {
            setPendienteFallo({ code, errorMessage, language: "typescript" });
            setMode("fallo");
          }} />
        </div>
      </div>
    </main>
  );
}
