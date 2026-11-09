import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { limitesDefecto } from "@/lib/ejecucion/limites";
import { limitesEntrada } from "@/lib/ai/limits";
import type { RunResult } from "@/lib/ejecucion/tipos";

export function CodeBlock({ source, label }: { source: string; label: string }) {
  const [Editor, setEditor] = useState<typeof import("@/components/editor-codigo").EditorCodigo>();
  const [codigo, setCodigo] = useState(source);

  useEffect(() => {
    let activo = true;
    void import("@/components/editor-codigo").then(
      ({ EditorCodigo }) => {
        if (activo) setEditor(() => EditorCodigo);
      },
      () => {
        /* El editor básico conserva el ejemplo si falla la carga del editor avanzado. */
      },
    );
    return () => {
      activo = false;
    };
  }, []);
  const [nota, setNota] = useState("");
  const [corriendo, setCorriendo] = useState(false);
  const [resultado, setResultado] = useState<RunResult | null>(null);
  const lenguaje = label.toLowerCase().split(/[\s·]/)[0];
  const local = lenguaje === "javascript" || lenguaje === "python";

  useEffect(() => {
    setCodigo(source);
    setResultado(null);
    setNota("");
  }, [source]);

  const ejecutar = async () => {
    if (!local || corriendo || !codigo.trim()) return;
    if (codigo.length > limitesEntrada.codigo) {
      setNota("Acorta el programa antes de ejecutarlo.");
      return;
    }
    setNota("");
    setResultado(null);
    setCorriendo(true);
    try {
      const { ejecutarLenguaje } = await import("@/lib/modulos/lenguajes");
      setResultado(await ejecutarLenguaje({ lenguaje, codigo, limites: limitesDefecto() }));
    } catch {
      setNota("No se pudo ejecutar el ejemplo.");
    } finally {
      setCorriendo(false);
    }
  };

  return (
    <div>
      {Editor ? (
        <Editor
          value={codigo}
          label={`Ejemplo de ${label}`}
          language={lenguaje}
          readOnly={corriendo}
          runDisabled={!codigo.trim()}
          output={
            corriendo
              ? "Ejecutando…"
              : nota ||
                (resultado && (
                  <pre className="whitespace-pre-wrap">
                    {[resultado.stdout, resultado.stderr].filter(Boolean).join("\n") ||
                      resultado.estado}
                  </pre>
                ))
          }
          onRun={local ? () => void ejecutar() : undefined}
          busy={corriendo}
          runLabel={corriendo ? "Ejecutando…" : "Ejecutar"}
          onChange={(valor) => {
            setCodigo(valor);
            setResultado(null);
          }}
        />
      ) : (
        <div className="cifra-editor" data-theme="Oscuro">
          <div className="cifra-editor__barra">
            <span>Ejemplo de {label}</span>
            {local && (
              <button
                type="button"
                className="cifra-ejecutar"
                disabled={corriendo || !codigo.trim()}
                onClick={() => void ejecutar()}
              >
                {corriendo ? "Ejecutando…" : "Ejecutar"}
              </button>
            )}
          </div>
          <textarea
            aria-label={`Ejemplo de ${label}`}
            className="curso-editor-reserva"
            value={codigo}
            spellCheck={false}
            readOnly={corriendo}
            onChange={(event) => {
              setCodigo(event.target.value);
              setResultado(null);
            }}
          />
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          onClick={() => {
            void navigator.clipboard.writeText(codigo).then(
              () => setNota("Copiado."),
              () => setNota("No se ha podido copiar."),
            );
          }}
        >
          Copiar código
        </Button>
        <Button
          disabled={corriendo}
          onClick={() => {
            setCodigo(source);
            setResultado(null);
          }}
        >
          Restaurar ejemplo
        </Button>
        {lenguaje === "rust" && (
          <a
            href="https://play.rust-lang.org/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center underline"
          >
            Abrir Rust Playground
          </a>
        )}
      </div>
      {nota && (
        <p role="status" className="mt-2 text-sm text-muted">
          {nota}
        </p>
      )}
      {resultado && (
        <div className="cifra-salida" aria-live="polite">
          <p className="font-semibold">
            {resultado.estado === "ok" ? "Salida" : "Resultado de la ejecución"}
          </p>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-sm">
            {[resultado.stdout, resultado.stderr].filter(Boolean).join("\n") ||
              (resultado.estado === "ok"
                ? "El programa terminó sin escribir en la consola."
                : resultado.estado)}
          </pre>
        </div>
      )}
    </div>
  );
}
