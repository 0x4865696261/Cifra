 version/1.0
import { useEffect, useMemo, useState } from "react";

import { EditorCodigo } from "@/components/editor-codigo";
import { useEffect, useMemo, useState } from "react";
import { limitesDefecto } from "@/lib/ejecucion/limites";
import { excedeLimite, limitesEntrada } from "@/lib/ai/limits";
import type { RunRequest, RunResult, TraceStep } from "@/lib/ejecucion/tipos";
import {
  ejecutarLenguaje,
  isLanguageId,
  lenguajesConMotor,
  languageLabels,
  motorDe,
  type LanguageId,
} from "@/lib/modulos/lenguajes";
 main
import { Button } from "@/components/ui/button";
import { CuentaJuez } from "@/components/codigo/cuenta-juez";
import { EditorCodigo, useBorrador } from "@/components/codigo/editor";
import { PanelesCodigo, type PanelCodigo } from "@/components/codigo/paneles";
import { VistaWeb } from "@/components/codigo/vista-web";
import { Corrida } from "@/components/retos/entrega";
import {
  etiquetasJuez,
  esLenguajeJuez,
  lenguajesJuez,
  type LenguajeJuez,
} from "@/lib/ejecucion/catalogo";
import { juzgarCodigo } from "@/lib/ejecucion/juez";
import { limitesDefecto } from "@/lib/ejecucion/limites";
import type { RunResult, TraceStep } from "@/lib/ejecucion/tipos";
import { ejecutarLenguaje } from "@/lib/modulos/lenguajes";
import { cn } from "@/lib/cn";

const muestras: Record<LenguajeJuez, string> = {
  javascript: "for (const n of [2, 4, 6]) console.log(n * n);\n",
  typescript: "const numeros: number[] = [2, 4, 6];\nconsole.log(numeros.map(n => n * n));\n",
  python: "for n in [2, 4, 6]:\n    print(n * n)\n",
  rust: 'fn main() {\n    for n in [2, 4, 6] {\n        println!("{}", n * n);\n    }\n}\n',
  go: 'package main\nimport "fmt"\nfunc main() { fmt.Println("Hola, Cifra") }\n',
  c: '#include <stdio.h>\nint main(void) { puts("Hola, Cifra"); }\n',
  cpp: '#include <iostream>\nint main() { std::cout << "Hola, Cifra\\n"; }\n',
  java: 'class Main {\n    public static void main(String[] args) {\n        System.out.println("Hola, Cifra");\n    }\n}\n',
  csharp: 'System.Console.WriteLine("Hola, Cifra");\n',
  ruby: 'puts "Hola, Cifra"\n',
  php: '<?php\necho "Hola, Cifra\\n";\n',
  sql: "SELECT titulo, paginas FROM libros ORDER BY paginas DESC;\n",
  web: '<article class="tarjeta">\n  <h2>Hola, Cifra</h2>\n  <p>Una tarjeta de ejemplo.</p>\n</article>\n',
};
const cssInicial = ".tarjeta { padding: 16px; background: #f0f4ff; }\n";
const ejemplosJavaScript = [
  {
    titulo: "Una media con un fallo escondido",
    codigo:
      "function media(numeros) {\n  const suma = numeros.reduce((a, n) => a + n, 0);\n  return suma / numeros.length;\n}\n\nconsole.log(media([2, 4, 6]));\nconsole.log(media([]));\n",
  },
  {
    titulo: "Un bucle que no termina",
    codigo: "let vueltas = 0;\nwhile (vueltas >= 0) {\n  vueltas = vueltas + 1;\n}\n",
  },
];

export function RunStudio({
  onEstudiarFallo,
}: {
  onEstudiarFallo: (codigo: string, mensaje: string, lenguaje: string) => void;
}) {
 version/1.0
  const [lenguaje, setLenguaje] = useState<LenguajeJuez>("javascript");
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("cifra.estudio.ejecuta.lenguaje");
      if (esLenguajeJuez(guardado)) setLenguaje(guardado);
    } catch {
      /* almacenamiento bloqueado */
    }
  }, []);
  const [panel, setPanel] = useState<PanelCodigo>("codigo");
  const [archivo, setArchivo] = useState<"html" | "css">("html");
  const [entrada, setEntrada] = useBorrador("cifra.estudio.ejecuta.stdin", "");
  const [codigo, editarCodigo] = useBorrador(
    `cifra.estudio.ejecuta:${lenguaje}`,
    muestras[lenguaje],
  );
  const [css, editarCss] = useBorrador("cifra.estudio.ejecuta:css", cssInicial);
  const [trazar, setTrazar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");
  const [resultado, setResultado] = useState<{
    corrida: RunResult;
    codigo: string;
    lenguaje: LenguajeJuez;
  }>();
  const [traza, setTraza] = useState<RunResult>();
  const trazable = lenguaje === "javascript" || lenguaje === "python";
=======
  const [muestraId, setMuestraId] = useState(muestras[0].id);
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [code, setCode] = useState(muestras[0].codigo);
  const [trazar, setTrazar] = useState(true);
  const [corriendo, setCorriendo] = useState(false);
  const [resultado, setResultado] = useState<RunResult | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const codigoExcedido = excedeLimite(code, limitesEntrada.codigo);
  const [workerDisponible, setWorkerDisponible] = useState<boolean | null>(null);
  useEffect(() => {
    setWorkerDisponible(typeof Worker !== "undefined" && typeof URL?.createObjectURL === "function");
  }, []);

  const carga = (muestra: (typeof muestras)[number]) => {
    setMuestraId(muestra.id);
    setLanguage(muestra.lenguaje);
    setCode(muestra.codigo);
    setResultado(null);
    setAviso(null);
  };
 main

  const ejecutar = async () => {
    setOcupado(true);
    setAviso("");
    setResultado(undefined);
    setTraza(undefined);
    setPanel("resultado");
    try {
      const respuesta = await juzgarCodigo({
        data: {
          modo: "libre",
          codigo,
          lenguaje,
          css: lenguaje === "web" ? css : undefined,
          entrada: lenguaje !== "web" && lenguaje !== "sql" ? entrada : undefined,
        },
      });
      if (!respuesta.ok) {
        setAviso(respuesta.mensaje);
        return;
      }
      setResultado({ corrida: respuesta.resultado, codigo, lenguaje });
      if (trazar && trazable) {
        try {
          setTraza(
            await ejecutarLenguaje({
              codigo,
              lenguaje,
              entrada,
              limites: limitesDefecto(),
              trazar: true,
            }),
          );
        } catch {
          setAviso("No se pudo generar la traza local.");
        }
      }
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se pudo ejecutar el programa.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <PanelesCodigo
      titulo="Contexto"
      panel={panel}
      onPanel={setPanel}
      contexto={
        <div className="grid gap-4">
          <h2 className="font-serif text-2xl">Ejecuta un programa</h2>
          <p>
            Escribe un programa y consulta su salida. El código se ejecuta en un servidor aislado
            con límites de tiempo y salida.
          </p>
          {lenguaje === "sql" && (
            <p className="text-sm text-muted">
              SQLite incluye libros(titulo, paginas) con Luz (120), Arena (95) y Mar (180). Usa una
              consulta de lectura.
            </p>
          )}
          {lenguaje !== "sql" && lenguaje !== "web" && (
            <label className="grid gap-2 font-mono text-sm">
              Entrada estándar (stdin)
              <textarea
                rows={4}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                className="rounded border border-line bg-paper p-3"
              />
            </label>
          )}
          {trazable && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={trazar}
                onChange={(e) => setTrazar(e.target.checked)}
              />
              Añadir una traza local en el navegador
            </label>
          )}
          <Button
            tone="ghost"
            onClick={() => {
              editarCodigo(muestras[lenguaje]);
              if (lenguaje === "web") editarCss(cssInicial);
              setPanel("codigo");
            }}
          >
            Cargar ejemplo
          </Button>
          {lenguaje === "javascript" && (
            <div className="flex flex-wrap gap-2">
              {ejemplosJavaScript.map((ejemplo) => (
                <Button
                  key={ejemplo.titulo}
                  tone="ghost"
                  onClick={() => {
                    editarCodigo(ejemplo.codigo);
                    setPanel("codigo");
                  }}
                >
                  {ejemplo.titulo}
                </Button>
              ))}
            </div>
          )}
        </div>
      }
      codigo={
        <div className="grid gap-3">
          <label className="flex items-center gap-2 font-mono text-sm">
            Lenguaje
            <select
              value={lenguaje}
              disabled={ocupado}
              className="min-h-11 rounded border border-line bg-paper px-2"
              onChange={(e) => {
                if (!esLenguajeJuez(e.target.value)) return;
                setLenguaje(e.target.value);
                try {
                  localStorage.setItem("cifra.estudio.ejecuta.lenguaje", e.target.value);
                } catch {
                  /* bloqueado */
                }
                setResultado(undefined);
                setTraza(undefined);
                setAviso("");
              }}
            >
              {lenguajesJuez.map((id) => (
                <option key={id} value={id}>
                  {etiquetasJuez[id]}
                </option>
              ))}
            </select>
          </label>
          {lenguaje === "web" && (
            <div className="flex gap-2">
              <Button
                tone="ghost"
                aria-pressed={archivo === "html"}
                onClick={() => setArchivo("html")}
              >
                index.html
              </Button>
              <Button
                tone="ghost"
                aria-pressed={archivo === "css"}
                onClick={() => setArchivo("css")}
              >
                styles.css
              </Button>
            </div>
          )}
          <EditorCodigo
            key={lenguaje + archivo}
            etiqueta="Código de Estudio"
            lenguaje={lenguaje === "web" ? archivo : lenguaje}
            valor={lenguaje === "web" && archivo === "css" ? css : codigo}
            onChange={lenguaje === "web" && archivo === "css" ? editarCss : editarCodigo}
          />
          <div>
            <Button
              tone="primary"
              disabled={ocupado || !codigo.trim()}
              onClick={() => void ejecutar()}
            >
              Ejecutar
            </Button>
 version/1.0

          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 font-mono text-sm">
          Código
          <EditorCodigo
            value={code}
            label="Código"
            language={language}
            readOnly={corriendo}
            runDisabled={workerDisponible === false || codigoExcedido || !code.trim()}
            output={corriendo ? "Ejecutando…" : aviso || (resultado && <pre className="whitespace-pre-wrap">{[resultado.stdout, resultado.stderr].filter(Boolean).join("\n") || resultado.estado}</pre>)}
            onRun={() => { if (workerDisponible && !corriendo && !codigoExcedido && code.trim()) void ejecutar(); }}
            busy={corriendo}
            runLabel={corriendo ? "Ejecutando…" : "Ejecutar"}
            onChange={(nuevo) => {
              setCode(nuevo);
              setMuestraId("");
              setResultado(null);
            }}
          />
          <p className={cn("font-mono text-sm", codigoExcedido ? "text-copper" : "text-muted")}>
            {code.length} de {limitesEntrada.codigo} caracteres
            {codigoExcedido && ": te pasas. Acorta el programa: no se ejecuta hasta que quepa."}
          </p>
        </div>

        <p className="mt-3 text-pretty text-muted">
          El código corre en tu propio navegador, dentro de un Worker sin red, con límites de
          tiempo, memoria y salida. Nada sale de tu ordenador. Rust no está aquí: su modo local es
          solo para desarrollo.
        </p>
      </section>

      <section>
        <label className="flex items-center gap-3 font-mono text-sm">
          <input
            type="checkbox"
            checked={trazar}
            onChange={(event) => setTrazar(event.target.checked)}
            className="min-h-11 accent-current"
          />
          Trazar el paso a paso
        </label>

        <p className="mt-2 font-mono text-sm text-muted">
          {workerDisponible === false
            ? "Este navegador no da Workers: no hay ejecución real aquí."
            : "Corte por tiempo a los 5 s, salida hasta 64 KB. Un programa sin fin acaba cortado, no colgado."}
        </p>

        {aviso && (
          <div className="mt-6 border-l border-copper pl-4">
            <p className="text-pretty">{aviso}</p>
 main
          </div>
          <CuentaJuez />
        </div>
      }
      resultado={
        <div className="grid gap-3" aria-live="polite">
          <h2 className="font-mono text-sm">Resultado</h2>
          {ocupado && <p role="status">Ejecutando…</p>}
          {aviso && (
            <>
              <p role="alert">{aviso}</p>
              <CuentaJuez />
            </>
          )}
          {lenguaje === "web" && <VistaWeb html={codigo} css={css} />}
          {!resultado && !aviso && !ocupado && lenguaje !== "web" && (
            <p className="text-sm text-muted">Aquí aparecerán la salida y los diagnósticos.</p>
          )}
          {resultado && <Corrida corrida={resultado.corrida} />}
          {resultado?.corrida.stderr.trim() && resultado.corrida.estado !== "ok" && (
            <div>
              <Button
                tone="ghost"
                onClick={() =>
                  onEstudiarFallo(
                    resultado.codigo,
                    resultado.corrida.stderr.trim().slice(0, 4_000),
                    resultado.lenguaje,
                  )
                }
              >
                Estudiar este fallo →
              </Button>
            </div>
          )}
          {traza?.traza?.length ? (
            <TrazaView traza={traza.traza} truncada={traza.trazaTruncada === true} />
          ) : null}
        </div>
      }
    />
  );
}

function TrazaView({ traza, truncada }: { traza: TraceStep[]; truncada: boolean }) {
  const visibles = useMemo(() => traza.slice(0, 200), [traza]);
  return (
    <section className="mt-6">
      <h3 className="font-serif text-xl">La traza, paso a paso</h3>
      <p className="mt-2 text-pretty text-muted">
        {truncada
          ? "Trunca al tope de pasos. En cobre, lo que cambia en cada paso respecto al anterior."
          : "En cobre, lo que cambia en cada paso respecto al anterior."}
      </p>
      <ol className="mt-3 flex flex-col gap-1 border border-line">
        {visibles.map((paso, indice) => {
          const anterior = indice === 0 ? null : visibles[indice - 1];
          const cambiadas = variablesCambiadas(paso, anterior);
          const enCambio = Object.keys(paso.variables).filter((nombre) => cambiadas.has(nombre));
          return (
            <li
              key={paso.paso}
              className="grid grid-cols-[3.5rem_3rem_1fr] items-start gap-3 border-l-2 border-transparent px-3 py-2 font-mono text-sm leading-6"
            >
              <span className="text-muted tabular-nums">#{paso.paso}</span>
              <span className="text-muted tabular-nums">L{paso.linea || "·"}</span>
              <span>
                {enCambio.length > 0 && (
                  <span className="mr-2 text-copper">
                    {enCambio.map((nombre) => `${nombre} = ${paso.variables[nombre]}`).join(" · ")}
                  </span>
                )}
                {Object.keys(paso.variables)
                  .filter((nombre) => !cambiadas.has(nombre))
                  .map((nombre) => `${nombre} = ${paso.variables[nombre]}`)
                  .join(" · ")}
                {Object.keys(paso.variables).length === 0 && "—"}
              </span>
            </li>
          );
        })}
      </ol>
      {traza.length > visibles.length && (
        <p className="mt-2 font-mono text-sm text-muted">
          Se muestran los primeros {visibles.length} pasos de {traza.length}.
        </p>
      )}
    </section>
  );
}

function variablesCambiadas(paso: TraceStep, anterior: TraceStep | null): Set<string> {
  if (!anterior) return new Set(Object.keys(paso.variables));
  const cambiadas = new Set<string>();
  for (const [nombre, valor] of Object.entries(paso.variables)) {
    if (anterior.variables[nombre] !== valor) cambiadas.add(nombre);
  }
  return cambiadas;
}
