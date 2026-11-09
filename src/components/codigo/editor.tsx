import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Compartment } from "@codemirror/state";
import { languages } from "@codemirror/language-data";
import { etiquetasJuez, type LenguajeJuez } from "@/lib/ejecucion/catalogo";

const tema = EditorView.theme({
  "&": { minHeight: "17rem", height: "100%", background: "var(--paper)", color: "var(--ink)" },
  ".cm-content": { minHeight: "17rem", padding: "12px 0", caretColor: "var(--ink)" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono, monospace)",
    fontSize: "0.875rem",
    overflow: "auto",
  },
  ".cm-gutters": { background: "var(--paper)", color: "var(--muted)", borderColor: "var(--line)" },
  ".cm-activeLine, .cm-activeLineGutter": {
    background: "color-mix(in srgb, var(--ink) 7%, transparent)",
  },
});

export function EditorCodigo({
  valor,
  onChange,
  lenguaje,
  etiqueta = "Código",
  onPaste,
  onBlur,
}: {
  valor: string;
  onChange: (value: string) => void;
  lenguaje: LenguajeJuez | "html" | "css" | "cifra";
  etiqueta?: string;
  onPaste?: (event: ClipboardEvent) => void;
  onBlur?: () => void;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const [compartimento] = useState(() => new Compartment());
  const actual = useRef({ valor, onChange, onPaste, onBlur });
  const label = useRef(etiqueta);

  useEffect(() => {
    actual.current = { valor, onChange, onPaste, onBlur };
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== valor) {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: valor } });
    }
  }, [valor, onChange, onPaste, onBlur]);

  useEffect(() => {
    if (!contenedor.current) return;
    const editor = new EditorView({
      parent: contenedor.current,
      doc: actual.current.valor,
      extensions: [
        basicSetup,
        tema,
        compartimento.of([]),
        EditorView.contentAttributes.of({ "aria-label": label.current, spellcheck: "false" }),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          const siguiente = update.state.doc.toString();
          if (siguiente !== actual.current.valor) actual.current.onChange(siguiente);
        }),
        EditorView.domEventHandlers({
          paste: (evento) => actual.current.onPaste?.(evento),
          blur: () => actual.current.onBlur?.(),
        }),
      ],
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, [compartimento]);

  useEffect(() => {
    let cancelado = false;
    const nombre =
      lenguaje === "web" || lenguaje === "html"
        ? "HTML"
        : lenguaje === "css"
          ? "CSS"
          : lenguaje === "cifra"
            ? "JavaScript"
            : etiquetasJuez[lenguaje];
    view.current?.dispatch({ effects: compartimento.reconfigure([]) });
    const modo = languages.find(
      (candidate) =>
        candidate.name.toLowerCase() === nombre.toLowerCase() ||
        candidate.alias?.some((alias) => alias.toLowerCase() === nombre.toLowerCase()),
    );
    void modo
      ?.load()
      .then((soporte) => {
        if (!cancelado) view.current?.dispatch({ effects: compartimento.reconfigure(soporte) });
      })
      .catch(() => undefined);
    return () => {
      cancelado = true;
    };
  }, [compartimento, lenguaje]);

  return <div ref={contenedor} className="min-w-0 overflow-hidden rounded-md border border-line" />;
}

export function useBorrador(clave: string, inicial: string) {
  const [guardado, setGuardado] = useState<{ clave: string; valor: string } | null>(null);
  useEffect(() => {
    try {
      setGuardado({ clave, valor: localStorage.getItem(clave) ?? inicial });
    } catch {
      setGuardado({ clave, valor: inicial });
    }
  }, [clave, inicial]);
  const cambiar = (valor: string) => {
    setGuardado({ clave, valor });
    try {
      localStorage.setItem(clave, valor);
    } catch {
      /* almacenamiento bloqueado */
    }
  };
  return [guardado?.clave === clave ? guardado.valor : inicial, cambiar] as const;
}
