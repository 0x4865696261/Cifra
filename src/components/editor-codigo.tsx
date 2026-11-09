import { useEffect, useRef, useState } from "react";
import type {
  ClipboardEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  ReactNode,
} from "react";
import { basicSetup } from "codemirror";
import { Annotation, Compartment, EditorState, Prec, Transaction } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";

export type TemaEditor = "Claro" | "Oscuro" | "Alto contraste";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  language?: string;
  theme?: TemaEditor;
  fontSize?: number;
  maxLength?: number;
  readOnly?: boolean;
  jump?: { line: number };
  onRun?: () => void;
  onSave?: () => void;
  runLabel?: string;
  runDisabled?: boolean;
  busy?: boolean;
  output?: ReactNode;
  className?: string;
  onPaste?: ClipboardEventHandler<HTMLDivElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  onBlur?: FocusEventHandler<HTMLDivElement>;
};

const externo = Annotation.define<boolean>();

function sintaxis(lenguaje?: string) {
  if (lenguaje === "python") return python();
  if (lenguaje === "rust") return rust();
  if (lenguaje === "typescript" || lenguaje === "cifra") return javascript({ typescript: true });
  if (lenguaje === "javascript" || lenguaje === undefined) return javascript();
  return [];
}

function aspecto(tema: TemaEditor, tamano: number) {
  const oscuro = tema !== "Claro";
  const color = oscuro
    ? ["#9cc7ff", "#9ee9b0", "#ffe69a", "#c6d0e0"]
    : ["#5331a2", "#14643e", "#8b3c09", "#4a5e78"];
  return [
    EditorView.theme(
      {
        "&": { height: "100%", fontSize: `${tamano}px` },
        ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.6" },
        ".cm-content": { padding: "0.75rem 0" },
        ".cm-line": { paddingLeft: "0.75rem" },
        ".cm-gutters": { borderRight: "1px solid var(--editor-divider)" },
        ".cm-gutterElement": { paddingRight: "0.6rem" },
      },
      { dark: oscuro },
    ),
    syntaxHighlighting(
      HighlightStyle.define([
        { tag: [tags.keyword, tags.operatorKeyword, tags.definitionKeyword], color: color[0] },
        { tag: [tags.string, tags.regexp], color: color[1] },
        { tag: [tags.number, tags.bool, tags.null], color: color[2] },
        { tag: tags.comment, color: color[3], fontStyle: "italic" },
      ]),
    ),
  ];
}

export function EditorCodigo({
  value,
  onChange,
  label,
  language,
  theme = "Oscuro",
  fontSize = 15,
  maxLength,
  readOnly = false,
  jump,
  onRun,
  onSave,
  runLabel = "Ejecutar",
  runDisabled = false,
  busy = false,
  output,
  className = "",
  onPaste,
  onKeyDown,
  onBlur,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const vista = useRef<EditorView | null>(null);
  const props = useRef({
    value,
    onChange,
    maxLength,
    onRun,
    onSave,
    runDisabled,
    language,
    theme,
    fontSize,
    readOnly,
    label,
  });
  props.current = {
    value,
    onChange,
    maxLength,
    onRun,
    onSave,
    runDisabled,
    language,
    theme,
    fontSize,
    readOnly,
    label,
  };
  const [compartimentos] = useState(() => ({
    lenguaje: new Compartment(),
    tema: new Compartment(),
    acceso: new Compartment(),
  }));
  const [ampliado, setAmpliado] = useState(false);
  const expandir = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!host.current) return;
    const inicial = props.current;
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: inicial.value,
        extensions: [
          basicSetup,
          compartimentos.lenguaje.of(sintaxis(inicial.language)),
          compartimentos.tema.of(aspecto(inicial.theme, inicial.fontSize)),
          compartimentos.acceso.of([
            EditorState.readOnly.of(inicial.readOnly),
            EditorView.editable.of(!inicial.readOnly),
          ]),
          EditorView.contentAttributes.of(() => ({
            "aria-label": props.current.label,
            spellcheck: "false",
          })),
          EditorState.transactionFilter.of((tx) => {
            const maximo = props.current.maxLength;
            if (
              tx.docChanged &&
              maximo !== undefined &&
              tx.newDoc.length > maximo &&
              tx.newDoc.length >= tx.startState.doc.length &&
              !tx.annotation(externo)
            )
              return [];
            return tx;
          }),
          Prec.highest(
            keymap.of([
              {
                key: "Mod-Enter",
                run: () => {
                  if (!props.current.onRun || props.current.readOnly || props.current.runDisabled)
                    return false;
                  props.current.onRun();
                  return true;
                },
              },
              {
                key: "Mod-s",
                run: () => {
                  if (!props.current.onSave) return false;
                  props.current.onSave();
                  return true;
                },
              },
            ]),
          ),
          EditorView.updateListener.of((actualizacion) => {
            if (
              actualizacion.docChanged &&
              !actualizacion.transactions.every((tx) => tx.annotation(externo))
            ) {
              props.current.onChange(actualizacion.state.doc.toString());
            }
          }),
        ],
      }),
    });
    vista.current = editor;
    return () => {
      editor.destroy();
      vista.current = null;
    };
  }, [compartimentos]);

  useEffect(() => {
    const editor = vista.current;
    if (!editor || editor.state.doc.toString() === value) return;
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: value },
      annotations: [externo.of(true), Transaction.addToHistory.of(false)],
    });
  }, [value]);

  useEffect(() => {
    vista.current?.dispatch({
      effects: [
        compartimentos.lenguaje.reconfigure(sintaxis(language)),
        compartimentos.tema.reconfigure(aspecto(theme, fontSize)),
        compartimentos.acceso.reconfigure([
          EditorState.readOnly.of(readOnly),
          EditorView.editable.of(!readOnly),
        ]),
      ],
    });
    vista.current?.contentDOM.setAttribute("aria-label", label);
  }, [compartimentos, language, theme, fontSize, readOnly, label]);

  useEffect(() => {
    const editor = vista.current;
    if (!jump || !editor) return;
    const linea = editor.state.doc.line(Math.max(1, Math.min(jump.line, editor.state.doc.lines)));
    editor.dispatch({ selection: { anchor: linea.from, head: linea.to }, scrollIntoView: true });
    editor.focus();
  }, [jump]);

  useEffect(() => {
    if (!ampliado) return;
    vista.current?.focus();
    const salir = (evento: globalThis.KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAmpliado(false);
        requestAnimationFrame(() => expandir.current?.focus());
      }
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", salir);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", salir);
    };
  }, [ampliado]);

  return (
    <div className={className}>
      <div
        className={`cifra-editor ${ampliado ? "cifra-editor--ampliado" : ""}`}
        data-theme={theme}
        onPasteCapture={onPaste}
        onKeyDownCapture={onKeyDown}
        onBlur={(evento) => {
          if (!evento.currentTarget.contains(evento.relatedTarget)) onBlur?.(evento);
        }}
      >
        <div className="cifra-editor__barra">
          <span>{label}</span>
          <div className="flex items-center gap-2">
            {onRun && (
              <button
                type="button"
                disabled={readOnly || runDisabled || busy}
                aria-busy={busy}
                onClick={onRun}
                className="cifra-ejecutar"
              >
                <span aria-hidden="true" className={busy ? "cifra-espera" : undefined}>
                  {busy ? "" : "▶"}
                </span>
                {runLabel}
              </button>
            )}
            <button
              ref={expandir}
              type="button"
              className="cifra-ampliar"
              aria-pressed={ampliado}
              onClick={() => setAmpliado(!ampliado)}
            >
              {ampliado ? "Salir de pantalla completa" : "Ampliar"}
            </button>
          </div>
        </div>
        <div ref={host} className="cifra-editor__documento" />
        {ampliado && output && (
          <div className="cifra-editor__consola" aria-live="polite">
            {output}
          </div>
        )}
      </div>
    </div>
  );
}
