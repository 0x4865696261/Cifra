import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { aiStatus, type AiStatus } from "@/lib/ai/explain";
import { providers } from "@/lib/ai/providers";
import { clearAiSettings, loadAiSettings, modelInUse, saveAiSettings, type AiSettings } from "@/lib/ai/settings";
import {
  exportarProgreso,
  importarProgreso,
  umbralProfesional,
  versionProgreso,
  type Progreso,
} from "@/lib/retos/progreso";
import { useProgreso } from "@/lib/retos/use-progreso";
import type { Plan } from "@/lib/retos/tipos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/ajustes")({
  head: () => ({ meta: [{ title: "Ajustes — Cifra" }] }),
  component: AjustesPage,
});

function AjustesPage() {
  const status = useServerFn(aiStatus);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [providerId, setProviderId] = useState<AiSettings["providerId"]>("xai");
  const [message, setMessage] = useState<string | null>(null);
  const [platformKey, setPlatformKey] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = loadAiSettings();
    setProviderId(saved.providerId);
    setApiKey(saved.apiKey);
    setModel(saved.model);
  }, []);

  useEffect(() => {
    status()
      .then((value: AiStatus) => setPlatformKey(value.platformKey))
      .catch(() => setPlatformKey(null));
  }, [status]);

  const hasOwnKey = apiKey.trim().length > 0;
  const provider = providers.find((item) => item.id === providerId) ?? providers[0];

  const save = () => {
    const outcome = saveAiSettings({ providerId, apiKey, model });
    setMessage(
      outcome.ok
        ? hasOwnKey
          ? "Guardado en este navegador. Las explicaciones usan tu clave y tu modelo."
          : "Guardado. Sin clave propia, se usa la clave de plataforma si existe."
        : outcome.error ?? "No se ha podido guardar.",
    );
  };

  const clear = () => {
    clearAiSettings();
    setApiKey("");
    setModel("");
    setMessage("Borrado. Sin clave propia, se usa la clave de plataforma si existe.");
  };

  return (
    <main id="contenido" className="mx-auto max-w-3xl px-5 py-10">
      <p className="font-mono text-sm text-copper">Ajustes</p>
      <h1 className="mt-3 font-serif text-4xl">Tu modelo, tus claves, tu cuota.</h1>
      <p className="mt-4 text-pretty">
        Cifra llama al modelo una vez por cada clic que pides una explicación o una guía de fallo. Aquí decides con
        qué clave y qué modelo: la de plataforma (si el servidor la trae) o la tuya propia, pegada en este
        navegador.
      </p>

      <div className="mt-8 border border-line p-5">
        <fieldset>
          <legend className="font-mono text-sm">Proveedor</legend>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {providers.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={providerId === item.id}
                onClick={() => {
                  setProviderId(item.id);
                  setModel("");
                  setMessage(null);
                }}
                className={cn(
                  "tap min-h-11 px-2 font-mono text-sm",
                  providerId === item.id ? "bg-ink text-paper" : "border border-line bg-paper text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-pretty text-muted">{provider.note}</p>
        </fieldset>

        <label className="mt-6 flex flex-col gap-2 font-mono text-sm">
          Clave de este proveedor
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(event) => {
              setApiKey(event.target.value);
              setMessage(null);
            }}
            className="min-h-11 w-full border border-line bg-paper px-3 font-mono text-sm text-ink"
            placeholder={hasOwnKey ? "•••• ya guardada; escribe para cambiar" : `Pega tu clave de ${provider.label}`}
          />
        </label>
        <p className="mt-2 text-pretty text-muted">
          La clave se guarda solo en este navegador y viaja con cada petición para usarse en esa llamada. El servidor
          no la guarda ni la anota.
        </p>

        <label className="mt-6 flex flex-col gap-2 font-mono text-sm">
          Modelo (opcional)
          <input
            type="text"
            value={model}
            onChange={(event) => {
              setModel(event.target.value);
              setMessage(null);
            }}
            className="min-h-11 w-full border border-line bg-paper px-3 font-mono text-sm text-ink"
            placeholder={provider.defaultModel}
          />
        </label>
        <p className="mt-2 font-mono text-sm text-muted">
          En uso: <span className="text-ink">{modelInUse({ providerId, apiKey, model })}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button tone="primary" onClick={save}>
            Guardar aquí
          </Button>
          <Button tone="ghost" onClick={clear}>
            Borrar la clave de este navegador
          </Button>
        </div>
        {message && <p className="mt-4 text-pretty text-muted">{message}</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-2xl">Clave de plataforma</h2>
        <p className="mt-3 text-pretty">
          {platformKey === null
            ? "Comprobando si el servidor trae clave de plataforma…"
            : platformKey
              ? "El servidor trae su propia clave. Si no pones la tuya, las llamadas gastan la cuota de la plataforma, no la tuya."
              : "El servidor no trae clave. Sin una tuya aquí, las explicaciones y la guía de fallo no tienen modelo; el análisis de texto del estudio sigue funcionando igual."}
        </p>
      </div>

      <SeccionProgreso />
    </main>
  );
}

/**
 * El camino y el progreso (0.4.A/E): cambiar de plan es reversible y no toca el progreso; el
 * progreso se exporta e importa como fichero. Nada de esto sale de este navegador.
 */
function SeccionProgreso() {
  const { progreso, cargado, elegirPlan, reemplazar } = useProgreso();
  const [aviso, setAviso] = useState<string | null>(null);

  const cambiar = (plan: Plan) => {
    const error = elegirPlan(plan);
    setAviso(error ?? `Camino cambiado a ${plan === "profesional" ? "profesional" : "desde cero"}.`);
  };

  const exportar = () => {
    const texto = exportarProgreso(progreso);
    const fichero = new Blob([texto], { type: "application/json" });
    const url = URL.createObjectURL(fichero);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cifra-progreso-v${versionProgreso}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setAviso("Progreso exportado: un JSON con todo lo que hay en este navegador.");
  };

  const alImportar = async (evento: ChangeEvent<HTMLInputElement>) => {
    const fichero = evento.target.files?.[0];
    evento.target.value = "";
    if (!fichero) return;
    const leido = await fichero.text();
    const resultado = importarProgreso(leido);
    if (resultado.ok) {
      reemplazar(resultado.progreso);
      setAviso("Progreso importado: reemplazó al de este navegador, tras validar la forma entera.");
    } else {
      setAviso(resultado.error);
    }
  };

  if (!cargado) {
    return (
      <div className="mt-10 border border-line p-5">
        <p className="font-mono text-sm text-muted">Leyendo tu progreso…</p>
      </div>
    );
  }

  const superados = Object.values(progreso.retos).length;

  return (
    <div className="mt-10 border border-line p-5">
      <h2 className="font-serif text-2xl">Tu camino en los retos</h2>
      <p className="mt-3 text-pretty">
        El camino (0.4.A) es reversible y nunca borra lo que llevas. Superado:{" "}
        {superados === 1 ? "un reto" : `${superados} retos`}
        {progreso.pruebaNivel
          ? ` · prueba de nivel: nivel ${progreso.pruebaNivel.nivelEstimado}`
          : ""}{" "}
        · profesional{" "}
        {progreso.profesionalDesbloqueado
          ? "desbloqueado"
          : `cerrado (se abre superando un reto de nivel ${umbralProfesional} o más)`}
        .
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          aria-pressed={progreso.plan === "desde-cero"}
          onClick={() => cambiar("desde-cero")}
          className={cn(
            "tap min-h-11 px-3 font-mono text-sm",
            progreso.plan === "desde-cero" ? "bg-ink text-paper" : "border border-line bg-paper text-ink",
          )}
        >
          Desde cero
        </button>
        <button
          type="button"
          aria-pressed={progreso.plan === "profesional"}
          onClick={() => cambiar("profesional")}
          className={cn(
            "tap min-h-11 px-3 font-mono text-sm",
            progreso.plan === "profesional" ? "bg-ink text-paper" : "border border-line bg-paper text-ink",
          )}
        >
          Profesional
        </button>
        <Button tone="ghost" onClick={exportar}>
          Exportar el progreso
        </Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center border border-line bg-paper px-4 font-mono text-sm text-ink">
          Importar un fichero…
          <input type="file" accept="application/json,.json" className="sr-only" onChange={alImportar} />
        </label>
      </div>
      {aviso && <p className="mt-3 text-pretty text-muted">{aviso}</p>}
      <p className="mt-3 text-pretty text-muted">
        Importar reemplaza el progreso de este navegador por el del fichero: solo se acepta un
        JSON exportado por Cifra con la misma versión.
      </p>
    </div>
  );
}
