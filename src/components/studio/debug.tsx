import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { DebugResult } from "@/lib/ai/debug";
import type { FailureReport } from "@/lib/analyze/failure";
import { analyzeFailure } from "@/lib/analyze/failure";
import { askDebug } from "@/lib/ai/debug";
import { credentials, modelInUse, loadAiSettings } from "@/lib/ai/settings";
import { analyze, isLanguageId, languageIds, languageLabels, type LanguageId } from "@/lib/analyze/structure";
import { Button } from "@/components/ui/button";
import { useLevel, levelOptions } from "@/lib/level";
import { cn } from "@/lib/cn";

type BrokenSample = {
  id: string;
  title: string;
  language: LanguageId;
  code: string;
  errorMessage: string;
};

const brokenSamples: BrokenSample[] = [
  {
    id: "media-vacia",
    title: "Una media que falla con listas vacías",
    language: "javascript",
    code: `function media(numeros) {
  let suma = 0;
  for (const n of numeros) {
    suma += n;
  }
  return suma / numeros.length;
}

const lista = leerDelUsuario();
console.log(media(lista));`,
    errorMessage: `TypeError: Cannot read properties of null (reading 'length')
    at media (ejemplo/media.js:6:24)
    at ejemplo/media.js:8:13`,
  },
  {
    id: "clave-omitida",
    title: "Un diccionario que no ve la clave",
    language: "python",
    code: `def precios(letra, catalogo):
    elegidos = {}
    for articulo, valor in catalogo.items():
        if articulo[0] == letra:
            elegidos[articulo] = valor
    promedio = (elegidos['minimo'] + elegidos['maximo']) / 2
    return promedio

catalogo = {'aceite': 3.2, 'azúcar': 1.8, 'pan': 0.9}
print(precios('a', catalogo))`,
    errorMessage: `Traceback (most recent call last):
  File "ejemplo/precios.py", line 6, in <module>
    promedio = (elegidos['minimo'] + elegidos['maximo']) / 2
KeyError: 'minimo'`,
  },
];

export function DebugStudio() {
  const ask = useServerFn(askDebug);
  const { level, setLevel } = useLevel();
  const [sampleId, setSampleId] = useState("");
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);

  const analysis = useMemo(() => analyze(code || "", language), [code, language]);
  const report = useMemo(() => analyzeFailure(code || "", errorMessage || "", language), [code, errorMessage, language]);
  const settings = useMemo(() => loadAiSettings(), []);
  const lines = report.fragmento;
  const lineasSinFragmento = report.mensaje.lineasNombradas.filter(
    (linea) => linea > lines.length,
  );

  const load = (sample: BrokenSample) => {
    setSampleId(sample.id);
    setLanguage(sample.language);
    setCode(sample.code);
    setErrorMessage(sample.errorMessage);
    setQuestion("");
    setResult(null);
  };

  const submit = async () => {
    setPending(true);
    setResult(null);
    try {
      const response = await ask({
        data: {
          level,
          language,
          code,
          errorMessage,
          question: question || undefined,
          codeFacts: analysis.facts.map((fact) => `L${fact.lines}: ${fact.text}`),
          messageFacts: messageFactsDe(report),
          ...credentials(settings),
        },
      });
      setResult(response);
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "No se ha podido pedir la guía del fallo.",
      });
    } finally {
      setPending(false);
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
                if (isLanguageId(event.target.value)) setLanguage(event.target.value);
              }}
            >
              {languageIds.map((id) => (
                <option key={id} value={id}>
                  {languageLabels[id]}
                </option>
              ))}
            </select>
          </label>
          <p className="font-mono text-sm text-muted">{analysis.lineCount} líneas de código</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {brokenSamples.map((sample) => (
            <Button key={sample.id} tone={sample.id === sampleId ? "quiet" : "ghost"} onClick={() => load(sample)}>
              {sample.title}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-pretty text-muted">
          Pega aquí tu código y el mensaje tal como llegó. El mensaje es una pieza del razonamiento: se lee antes de
          tocar el código.
        </p>

        <label className="mt-6 flex flex-col gap-2 font-mono text-sm">
          Código
          <textarea
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setSampleId("");
              setResult(null);
            }}
            rows={8}
            spellCheck={false}
            aria-label="Código"
            placeholder="Pega el fragmento. Mejor con líneas numerables tal como las muestran tu editor y tu error."
            className="min-h-40 w-full border border-line bg-paper p-3 font-mono text-sm leading-6 text-ink"
          />
        </label>
        <label className="mt-4 flex flex-col gap-2 font-mono text-sm">
          Mensaje del error
          <textarea
            value={errorMessage}
            onChange={(event) => {
              setErrorMessage(event.target.value);
              setSampleId("");
              setResult(null);
            }}
            rows={6}
            spellCheck={false}
            aria-label="Mensaje del error"
            placeholder="Pega el texto completo: traza, tipo y línea. Copiado en limpio, no resumido."
            className="min-h-32 w-full border border-line bg-paper p-3 font-mono text-sm leading-6 text-ink"
          />
        </label>

        {code.trim() && (
          <div className="mt-6">
            <h2 className="font-serif text-2xl">El fragmento, en sus líneas</h2>
            <div className="mt-3 max-h-80 overflow-auto border border-line">
              {lines.map((line) => (
                <div
                  key={line.n}
                  className={cn(
                    "grid w-max min-w-full grid-cols-[3rem_1fr] items-start gap-3 border-l-2 px-3 py-1.5 font-mono text-sm leading-6",
                    line.marcada ? "border-copper bg-line text-ink" : "border-transparent text-ink",
                  )}
                >
                  <span className="text-muted tabular-nums">{line.n}</span>
                  <span className="whitespace-pre">{line.texto || " "}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 font-mono text-sm text-muted">
              En cobre, las líneas que el mensaje nombra. Un número no es una acusación: se comprueba con lo que hay
              alrededor.
            </p>
            {lineasSinFragmento.length > 0 && (
              <p className="mt-2 text-pretty text-copper">
                El mensaje nombra también las líneas {lineasSinFragmento.join(", ")}, que no existen en el fragmento
                pegado. Se señalan; no se inventan.
              </p>
            )}
          </div>
        )}

        <h2 className="mt-8 font-serif text-2xl">Lo que se ve en los dos textos</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {messageFactsDe(report).map((fact) => (
            <li key={fact} className="border-l border-line pl-4">
              <p className="font-mono text-sm text-copper">Mensaje</p>
              <p className="text-pretty">{fact}</p>
            </li>
          ))}
          {analysis.facts.map((fact) => (
            <li key={`code-${fact.lines}-${fact.text}`} className="border-l border-line pl-4">
              <p className="font-mono text-sm text-copper">Código, líneas {fact.lines}</p>
              <p className="text-pretty">{fact.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-pretty text-muted">
          Ninguna de estas observaciones es una ejecución. La guía del lado derecho tiene que decir lo que supone.
        </p>
      </section>

      <section>
        <fieldset>
          <legend className="font-mono text-sm">Nivel</legend>
          <div className="mt-2 grid grid-cols-3 border border-line">
            {levelOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={level === option.id}
                onClick={() => setLevel(option.id)}
                className={cn(
                  "tap min-h-11 px-2 font-mono text-sm",
                  level === option.id ? "bg-ink text-paper" : "text-muted",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-pretty text-muted">{levelOptions.find((option) => option.id === level)?.hint}</p>
        </fieldset>

        <label className="mt-6 flex flex-col gap-2 font-mono text-sm">
          Sospechas, si ya tienes
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            maxLength={600}
            className="w-full border border-line bg-paper p-3 font-serif text-base text-ink"
            placeholder="Opcional: «mira la línea 6, no entiendo por qué ahí»."
          />
        </label>

        <p className="mt-6 font-mono text-sm text-muted">
          Skill fija en la guía: <span className="text-ink">Depuración</span>, junto a Pedagogía y Análisis.
        </p>

        <Button tone="primary" className="mt-6 w-full" disabled={pending || !code.trim() || !errorMessage.trim()} onClick={() => void submit()}>
          {pending ? "Conduciendo el análisis…" : "Estudiar este fallo"}
        </Button>
        <p className="mt-2 font-mono text-sm text-muted">
          Usa {settings.apiKey.trim() ? `${providerLabel(settings.providerId)} · ${modelInUse(settings)}` : "la clave de plataforma, si existe"}. Una
          llamada cuando pulsas, nunca parte sola.
        </p>

        {result && !result.ok && (
          <div className="mt-6 border-l border-copper pl-4">
            <p className="text-pretty">{result.error}</p>
            {result.raw && (
              <pre className="mt-3 overflow-x-auto font-mono text-sm whitespace-pre-wrap text-muted">{result.raw}</pre>
            )}
          </div>
        )}
        {result?.ok && <DebugGuideView guide={result.guide} cached={result.cached} />}
      </section>
    </div>
  );
}

function providerLabel(providerId: string): string {
  const labels: Record<string, string> = {
    xai: "xAI",
    openai: "OpenAI",
    anthropic: "Claude",
    google: "Gemini",
  };
  return labels[providerId] ?? "tu modelo";
}

function messageFactsDe(report: FailureReport): string[] {
  const tipo = report.mensaje.tipo === "desconocido"
    ? "La lectura local no reconoce un tipo de error con nombre. Lee la primera frase del mensaje: suele nombrar la regla que se detuvo."
    : `La lectura local reconoce el tipo de error: ${report.mensaje.tipo}.`;
  const lineas = report.mensaje.lineasNombradas.length
    ? `El mensaje nombra las líneas: ${report.mensaje.lineasNombradas.join(", ")}. Cádalos con el fragmento pegado: pueden apuntar al código o al archivo original.`
    : "El mensaje no da ningún número de línea que se haya podido leer.";
  const nombres = report.mensaje.identificadoresCitados.length
    ? `El mensaje pone entre comillas: ${report.mensaje.identificadoresCitados.map((name) => `«${name}»`).join(", ")}. Suelen ser nombres, archivos o cadenas implicadas.`
    : "";
  return [tipo, lineas, nombres].filter(Boolean);
}

function DebugGuideView({
  guide,
  cached,
}: {
  guide: NonNullable<FailureReport["guia"]>;
  cached: boolean;
}) {
  return (
    <article className="mt-8 border-t border-line pt-6">
      <p className="font-mono text-sm text-copper">{cached ? "Misma guía, sin otra llamada" : "Guía del fallo"}</p>

      <div className="mt-4 flex flex-col gap-5">
        {guide.leerElMensaje.map((afirmacion, index) => (
          <section key={index}>
            <h3 className="font-serif text-xl">Lo que dice el mensaje</h3>
            <p className="mt-2 text-pretty">{afirmacion.texto}</p>
          </section>
        ))}
        {guide.localizarElSitio.map((afirmacion, index) => (
          <section key={index}>
            <h3 className="font-serif text-xl">Dónde mirar</h3>
            <p className="mt-2 text-pretty">{afirmacion.texto}</p>
          </section>
        ))}
        <section>
          <h3 className="font-serif text-xl">Hipótesis, para comprobar en orden</h3>
          <ol className="mt-3 flex flex-col gap-4">
            {guide.hipotesis.map((item, index) => (
              <li key={index} className="border-l border-line pl-4">
                <p className="text-pretty">{item.texto}</p>
                <p className="mt-1 text-pretty text-muted">
                  <span className="font-mono text-sm text-copper">
                    Coste {item.coste} de 3. Cómo comprobarla:{" "}
                  </span>
                  {item.comoComprobarla}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h3 className="font-serif text-xl">Dos entradas para una prueba</h3>
          <div className="mt-3">
            <p className="font-mono text-sm text-copper">Debería fallar hoy</p>
            <p className="mt-1 whitespace-pre-wrap text-pretty">{guide.entradaQueFallaHoy}</p>
          </div>
          <div className="mt-3">
            <p className="font-mono text-sm text-copper">Debería seguir funcionando mañana</p>
            <p className="mt-1 whitespace-pre-wrap text-pretty">{guide.entradaQueDebeSeguirFuncionando}</p>
          </div>
        </section>
        <section>
          <h3 className="font-serif text-xl">Cómo saltaba antes</h3>
          <p className="mt-2 text-pretty">{guide.comoHabriaSaltadoAntes}</p>
        </section>
      </div>
    </article>
  );
}
