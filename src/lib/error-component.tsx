import type { ErrorComponentProps } from "@tanstack/react-router";

const FALLBACK_MESSAGE = "Ha ocurrido un error inesperado. Recarga la página.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-ink">
      <p className="font-mono text-sm text-copper">Cifra</p>
      <h1 className="font-serif text-2xl">Algo se ha roto en esta página</h1>
      <p className="max-w-md font-mono text-sm break-words text-muted">{errorMessage(error)}</p>
    </main>
  );
}
