import { useState } from "react";

export function CodeBlock({ source, label }: { source: string; label: string }) {
  const [note, setNote] = useState("");

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border border-line border-b-transparent px-3">
        <p className="font-mono text-sm">{label}</p>
        <button
          type="button"
          className="min-h-11 font-mono text-sm text-copper"
          onClick={() => {
            void navigator.clipboard.writeText(source).then(
              () => setNote("Copiado."),
              () => setNote("No se ha podido copiar."),
            );
          }}
        >
          Copiar
        </button>
      </div>
      <pre className="overflow-x-auto bg-ink p-4 font-mono text-sm leading-relaxed whitespace-pre text-paper">{source}</pre>
      {note ? <p className="mt-1 font-mono text-sm text-muted">{note}</p> : null}
    </div>
  );
}
