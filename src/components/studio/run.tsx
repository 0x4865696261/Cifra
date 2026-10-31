import { useMemo, useState } from "react";
import { ejecutarJavaScript } from "@/lib/ejecucion/motor-javascript";
import { ejecutarPython } from "@/lib/ejecucion/motor-python";
import { limitesDefecto } from "@/lib/ejecucion/limites";
import { excedeLimite, limitesEntrada } from "@/lib/ai/limits";
import type { RunRequest, RunResult, TraceStep } from "@/lib/ejecucion/tipos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * «Ejecuta con seguridad» (0.3.G, tarea 8): un botón Ejecutar en el estudio. El código corre
 * en el navegador (Worker aislado, sin red), la salida y la traza se ven bajo el editor, y si
 * el programa falla, el puente lleva al mensaje y el código a «Estudia el fallo» con un clic.
 */

const lenguajes = [
  { id: "javascript", label: "JavaScript", notas: "corre en un Worker de tu navegador" },
  { id: "python", label: "Python", notas: "Pyodide se baja del CDN la primera vez; tarda al cargar" },
] as const;

type LenguajeRun = (typeof lenguajes)[number]["id"];

const muestras = [
  {
    id: "media",
    lenguaje: "javascript" as const,
    titulo: "Una media con un fallo escondido",
    codigo:
      "function media(numeros) {\n  let suma = 0;\n  for (let i = 0; i < numeros.length; i++) {\n    suma = suma + numeros[i];\n  }\n  return suma / numeros.length;\n}\n\nconsole.log(media([2, 4, 6]));\nconsole.log(media([]));\n",
    preguntaAlEjecutar: true,
  },
  {
    id: "bucle",
    lenguaje: "javascript" as const,
    titulo: "Un bucle que no termina",
    codigo: "let vueltas = 0;\nwhile (vueltas >= 0) {\n  vueltas = vueltas + 1;\n}\nconsole.log(vueltas);\n",
    preguntaAlEjecutar: false,
  },
  {
    id: "sabor",
    lenguaje: "python" as const,
    titulo: "Python: trazo de una lista",
    codigo:
      'sabor = ["pera", "limón", "melón"]\nfor fruta in sabor:\n    print(fruta, len(fruta))\nprint("total", len(sabor))\n',
    preguntaAlEjecutar: false,
  },
];

const etiquetasEstado: Record<RunResult["estado"], string> = {
  ok: "Terminó bien",
  error: "Fallo del programa",
  tiempo: "Corte por tiempo",
  memoria: "Corte por memoria",
  "salida-excedida": "Salida enorme",
  "no-soportado": "Aquí no se puede",
};

export function RunStudio({
  onEstudiarFallo,
}: {
  onEstudiarFallo: (codigo: string, mensaje: string, lenguaje: string) => void;
}) {
  const [muestraId, setMuestraId] = useState(muestras[0].id);
  const [language, setLanguage] = useState<LenguajeRun>("javascript");
  const [code, setCode] = useState(muestras[0].codigo);
  const [trazar, setTrazar] = useState(true);
  const [corriendo, setCorriendo] = useState(false);
  const [resultado, setResultado] = useState<RunResult | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const codigoExcedido = excedeLimite(code, limitesEntrada.codigo);
  const workerDisponible =
    typeof Worker !== "undefined" && typeof URL?.createObjectURL === "function";

  const carga = (muestra: (typeof muestras)[number]) => {
    setMuestraId(muestra.id);
    setLanguage(muestra.lenguaje);
    setCode(muestra.codigo);
    setResultado(null);
    setAviso(null);
  };

  const ejecutar = async () => {
    setCorriendo(true);
    setResultado(null);
    setAviso(null);
    const pedido: RunRequest = {
      lenguaje: language,
      codigo: code,
      limites: limitesDefecto(),
      trazar,
    };
    try {
      const respuesta = language === "javascript" ? await ejecutarJavaScript(pedido) : await ejecutarPython(pedido);
      setResultado(respuesta);
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se ha podido ejecutar aquí.");
    } finally {
      setCorriendo(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex flex-col gap-2 font-mono text-sm">
            Lenguaje
            <select
              className="min-h-11 border border-line bg-paper px-3 text-ink"
              value={language}
              onChange={(event) => {
                if (event.target.value === "javascript" || event.target.value === "python") {
                  setLanguage(event.target.value);
                  setResultado(null);
                }
              }}
            >
              {lenguajes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <p className="font-mono text-sm text-muted">{lenguajes.find((item) => item.id === language)?.notas}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {muestras.map((muestra) => (
            <Button key={muestra.id} tone={muestra.id === muestraId ? "quiet" : "ghost"} onClick={() => carga(muestra)}>
              {muestra.titulo}
            </Button>
          ))}
        </div>

        <label className="mt-6 flex flex-col gap-2 font-mono text-sm">
          Código
          <textarea
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setMuestraId("");
              setResultado(null);
            }}
            rows={10}
            spellCheck={false}
            aria-label="Código"
            className="min-h-48 w-full border border-line bg-paper p-3 font-mono text-sm leading-6 text-ink"
          />
          <p className={cn("font-mono text-sm", codigoExcedido ? "text-copper" : "text-muted")}>
            {code.length} de {limitesEntrada.codigo} caracteres
            {codigoExcedido && ": te pasas. Acorta el programa: no se ejecuta hasta que quepa."}
          </p>
        </label>

        <p className="mt-3 text-pretty text-muted">
          El código corre en tu propio navegador, dentro de un Worker sin red, con límites de
          tiempo, memoria y salida. Nada sale de tu ordenador. Rust no está aquí: su modo local
          es solo para desarrollo.
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

        <Button
          tone="primary"
          className="mt-4 w-full"
          disabled={corriendo || !code.trim() || codigoExcedido || !workerDisponible}
          onClick={() => void ejecutar()}
        >
          {corriendo ? "Ejecutando…" : "Ejecutar"}
        </Button>
        <p className="mt-2 font-mono text-sm text-muted">
          {!workerDisponible
            ? "Este navegador no da Workers: no hay ejecución real aquí."
            : "Corte por tiempo a los 5 s, salida hasta 64 KB. Un programa sin fin acaba cortado, no colgado."}
        </p>

        {aviso && (
          <div className="mt-6 border-l border-copper pl-4">
            <p className="text-pretty">{aviso}</p>
          </div>
        )}

        {resultado && <ResultadoView resultado={resultado} codigo={code} lenguaje={language} onEstudiarFallo={onEstudiarFallo} />}
      </section>
    </div>
  );
}

function ResultadoView({
  resultado,
  codigo,
  lenguaje,
  onEstudiarFallo,
}: {
  resultado: RunResult;
  codigo: string;
  lenguaje: string;
  onEstudiarFallo: (codigo: string, mensaje: string, lenguaje: string) => void;
}) {
  const elFallo = resultado.estado === "error" && resultado.stderr.trim().length > 0;
  const puedeEstudiar = elFallo && resultado.stderr.length <= limitesEntrada.mensaje;

  return (
    <article className="mt-8 border-t border-line pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm text-copper">
          {etiquetasEstado[resultado.estado]} · {resultado.duracionMs} ms
        </p>
        {puedeEstudiar && (
          <Button tone="ghost" onClick={() => onEstudiarFallo(codigo, resultado.stderr.trim(), lenguaje)}>
            Estudiar este fallo →
          </Button>
        )}
      </div>
      {elFallo && !puedeEstudiar && (
        <p className="mt-2 text-pretty text-muted">
          El mensaje del fallo es más largo de lo que la guía admite: cópialo a mano y recorta la
          parte de la pila que se repite.
        </p>
      )}

      <p className="mt-3 font-mono text-xs text-muted">
        {resultado.motor.nombre} · {resultado.motor.version} · ejecución real en tu navegador
        {resultado.estado === "ok" && resultado.memoriaMBUsada === undefined
          ? " · heap no medido en este motor"
          : ""}
      </p>

      <div className="mt-4 grid gap-4">
        {resultado.stdout.trim().length > 0 && (
          <section>
            <h3 className="font-mono text-sm text-copper">Salida</h3>
            <pre className="mt-2 max-h-72 overflow-auto border border-line bg-paper p-3 font-mono text-sm leading-6 whitespace-pre-wrap text-ink">
              {resultado.stdout}
            </pre>
          </section>
        )}
        {resultado.stderr.trim().length > 0 && (
          <section>
            <h3 className="font-mono text-sm text-copper">Errores y avisos</h3>
            <pre className="mt-2 max-h-72 overflow-auto border border-copper bg-paper p-3 font-mono text-sm leading-6 whitespace-pre-wrap text-ink">
              {resultado.stderr}
            </pre>
          </section>
        )}
        {resultado.stdout.trim().length === 0 && resultado.stderr.trim().length === 0 && (
          <p className="text-pretty text-muted">Sin salida: el programa no escribió nada.</p>
        )}
      </div>

      {resultado.traza && resultado.traza.length > 0 && (
        <TrazaView traza={resultado.traza} truncada={resultado.trazaTruncada === true} />
      )}
      {resultado.trazaTruncada === true && (
        <p className="mt-3 text-pretty text-copper">
          La traza se trunca en {limitesDefecto().pasosTraza} pasos (0.3.B): es un mapa, no la película completa.
        </p>
      )}
    </article>
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
