 version/1.0
import { EditorCodigo, useBorrador } from "@/components/codigo/editor";
import { PanelesCodigo, type PanelCodigo } from "@/components/codigo/paneles";
import { authClient } from "@/lib/auth/client";
import { CuentaJuez } from "@/components/codigo/cuenta-juez";
import { useState } from "react";
=======
import { EditorCodigo } from "@/components/editor-codigo";
import { useEffect, useState } from "react";
 main
import { ejecutarJavaScript } from "@/lib/ejecucion/motor-javascript";
import { limitesDefecto } from "@/lib/ejecucion/limites";
import { compararMediciones, type Comparacion } from "@/lib/ejecucion/mediciones";
import { excedeLimite, limitesEntrada } from "@/lib/ai/limits";
import type { RunRequest } from "@/lib/ejecucion/tipos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * «Compara dos versiones» (0.3.F en la web, tarea 7): dos programas, el original y la versión
 * que quieres comparar. Ambos corren de verdad en tu navegador (2 calentamientos que se
 * descartan + 10 corridas válidas) y el veredicto solo nombra ganadora cuando la diferencia
 * de medianas supera el doble del mayor MAD; si no, cae dentro de la dispersión. Las cifras
 * valen para este equipo con estos límites, nunca para otro sitio.
 *
 * Solo JavaScript: Pyodide cargaría el CDN en cada corrida y las cifras dirían de la carga,
 * no del programa. Se lo decimos en la propia interfaz.
 */

const etiquetasVeredicto: Record<Comparacion["veredicto"], string> = {
  "mas-rapida-la-original": "Más rápida la original",
  "mas-rapida-la-optimizada": "Más rápida la optimizada",
  "dentro-de-la-dispersion": "Diferencia dentro de la dispersión",
};

const textosVeredicto: Record<Comparacion["veredicto"], string> = {
  "mas-rapida-la-original":
    "La versión optimizada acabó más lenta: cuidado, el «cambio para mejorar» retrocedió en este equipo.",
  "mas-rapida-la-optimizada":
    "La versión optimizada acabó antes por encima de la dispersión de las corridas: en este equipo se nota.",
  "dentro-de-la-dispersion":
    "Ninguna versión gana: la diferencia cabe dentro del vaivén natural de las corridas. Es honesto decirlo.",
};

function MedidaView({ titulo, medida }: { titulo: string; medida: Comparacion["original"] }) {
  return (
    <section className="min-w-0">
      <h3 className="font-mono text-sm text-copper">{titulo}</h3>
      <dl className="mt-2 grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 font-mono text-sm">
        <dt className="text-muted">Mediana</dt>
        <dd className="tabular-nums">{medida.mediana} ms</dd>
        <dt className="text-muted">Dispersión (MAD)</dt>
        <dd className="tabular-nums">± {medida.mad} ms</dd>
        <dt className="text-muted">Corridas válidas</dt>
        <dd className="tabular-nums truncate" title={medida.corridas.join(", ")}>
          {medida.corridas.join(", ")}
        </dd>
      </dl>
    </section>
  );
}

export function CompararStudio() {
  const [original, setOriginal] = useBorrador("cifra.estudio.compara.original", "");
  const [optimizada, setOptimizada] = useBorrador("cifra.estudio.compara.optimizada", "");
  const [panel, setPanel] = useState<PanelCodigo>("codigo");
  const sesion = authClient.useSession();
  const [comparando, setComparando] = useState(false);
  const [resultado, setResultado] = useState<Comparacion | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const originalExcedido = excedeLimite(original, limitesEntrada.codigo);
  const optimizadaExcedida = excedeLimite(optimizada, limitesEntrada.codigo);
  const [workerDisponible, setWorkerDisponible] = useState<boolean | null>(null);
  useEffect(() => {
    setWorkerDisponible(typeof Worker !== "undefined" && typeof URL?.createObjectURL === "function");
  }, []);

  const comparar = async () => {
    setComparando(true);
    setResultado(null);
    setAviso(null);
    const pedido = (codigo: string): RunRequest => ({
      lenguaje: "javascript",
      codigo,
      limites: limitesDefecto(),
      trazar: false,
    });
    try {
      const comparacion = await compararMediciones(
        async () => {
          const resultado = await ejecutarJavaScript(pedido(original));
          if (resultado.estado !== "ok") {
            throw new Error(
              "La versión original no terminó bien (estado: " +
                resultado.estado +
                "). Un programa cortado no da una medición del programa: corrígela antes de comparar.",
            );
          }
          return resultado;
        },
        async () => {
          const resultado = await ejecutarJavaScript(pedido(optimizada));
          if (resultado.estado !== "ok") {
            throw new Error(
              "La versión optimizada no terminó bien (estado: " +
                resultado.estado +
                "). Un programa cortado no da una medición del programa: corrígela antes de comparar.",
            );
          }
          return resultado;
        },
      );
      setResultado(comparacion);
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se han podido comparar aquí.");
    } finally {
      setComparando(false);
    }
  };

  return (
    <PanelesCodigo titulo="Contexto" panel={panel} onPanel={setPanel} contexto={<>

        <h2 className="font-serif text-2xl">¿Tu cambio hizo el programa más rápido? Mídelo.</h2>
        <p className="mt-3 max-w-2xl text-pretty text-muted">
          Pega dos versiones del mismo programa. Cada una corre 12 veces de verdad (2 de
          calentamiento y 10 que cuentan) en tu navegador, y el veredicto no nombra ganadora
          cuando la diferencia es tan pequeña como el propio vaivén de las corridas. Las cifras
          están medidas en este equipo con estos límites: no generalices.
        </p>
        {workerDisponible === false && (
          <p className="mt-3 text-pretty text-copper">
            Este navegador no da Workers: la comparación necesita ejecución real.
          </p>
        )}
 version/1.0
      </>} codigo={<div className="grid gap-4">
      <div className="grid gap-4">
        <label className="flex flex-col gap-2 font-mono text-sm">
          Versión original
          <EditorCodigo valor={original} lenguaje="javascript" etiqueta="Código de la versión original"
            onChange={(valor) => { setOriginal(valor); setResultado(null); }} />

      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-2 font-mono text-sm">
          Versión original
          <EditorCodigo
            value={original}
            label="Código de la versión original"
            language="javascript"
            onChange={(nuevo) => {
              setOriginal(nuevo);
              setResultado(null);
            }}
          />
 main
          <span className={cn("font-mono text-sm", originalExcedido ? "text-copper" : "text-muted")}>
            {original.length} de {limitesEntrada.codigo} caracteres
            {originalExcedido && ": no cabe, acótalo."}
          </span>
        </div>

        <div className="flex flex-col gap-2 font-mono text-sm">
          Versión optimizada
 version/1.0
          <EditorCodigo valor={optimizada} lenguaje="javascript" etiqueta="Código de la versión optimizada"
            onChange={(valor) => { setOptimizada(valor); setResultado(null); }} />

          <EditorCodigo
            value={optimizada}
            label="Código de la versión optimizada"
            language="javascript"
            onChange={(nuevo) => {
              setOptimizada(nuevo);
              setResultado(null);
            }}
          />
 main
          <span className={cn("font-mono text-sm", optimizadaExcedida ? "text-copper" : "text-muted")}>
            {optimizada.length} de {limitesEntrada.codigo} caracteres
            {optimizadaExcedida && ": no cabe, acótalo."}
          </span>
        </div>
      </div>

      <div>
        <Button
          tone="primary"
          disabled={
            !sesion.data || comparando ||
            !original.trim() ||
            !optimizada.trim() ||
            originalExcedido ||
            optimizadaExcedida ||
            !workerDisponible
          }
          onClick={() => { setPanel("resultado"); void comparar(); }}
        >
          {comparando ? "Midiendo 24 corridas…" : "Comparar mediciones"}
        </Button>
        <p className="mt-2 max-w-2xl font-mono text-sm text-muted">
          Solo JavaScript: en Python las cifras dirían de la carga de Pyodide, no del programa.
          Un corte por tiempo en cualquiera de las dos versiones no da comparación.
        </p>
      </div>

      <CuentaJuez />
      </div>} resultado={<div className="grid gap-3" aria-live="polite">
      <h2 className="font-mono text-sm">Resultado</h2>
      {comparando && <p role="status">Midiendo…</p>}
      {aviso && (
        <div className="border-l border-copper pl-4">
          <p className="text-pretty">{aviso}</p>
        </div>
      )}

      {resultado && (
        <article className="border-t border-line pt-6">
          <p className="font-serif text-xl">
            {etiquetasVeredicto[resultado.veredicto]} · {textosVeredicto[resultado.veredicto]}
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <MedidaView titulo="Original" medida={resultado.original} />
            <MedidaView titulo="Optimizada" medida={resultado.optimizada} />
          </div>
          <p className="mt-5 max-w-2xl text-pretty text-muted">{resultado.notas}</p>
        </article>
      )}
      </div>}
    />
  );
}
