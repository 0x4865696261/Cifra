import { useState } from "react";
import { correrPruebasJavaScript, todasPasadas } from "@/lib/ejecucion/pruebas";
import { limitesDefecto } from "@/lib/ejecucion/limites";
import type { RunRequest, RunResult, TestSpec } from "@/lib/ejecucion/tipos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { usarSenales } from "@/lib/retos/use-senales";
import type { SenalIntegridad } from "@/lib/retos/tipos";

/**
 * La entrega de un reto (0.4.C): el código de partida con los casos plantados, el botón
 * «Entregar» y la corrida real en el navegador contra las pruebas fijas del reto. El
 * veredicto sale aquí y de aquí, con `todasPasadas`; sube hacia arriba y nadie lo negocia.
 *
 * Las señales de integridad (0.4.D) se anotan mientras se escribe y suben con el veredicto
 * para que la defensa tenga contexto. Nunca bloquean un envío.
 */

export type EntregaResultado = {
  resultado: RunResult;
  superado: boolean;
  codigo: string;
  señales: SenalIntegridad[];
};

export function EntregaEditor({
  codigoInicial,
  pruebas,
  boton = "Entregar",
  onVeredicto,
}: {
  codigoInicial: string;
  pruebas: TestSpec[];
  boton?: string;
  /** Se avisa en cada entrega que corrió: `superado` sale de `todasPasadas`, nunca se consulta. */
  onVeredicto: (entrega: EntregaResultado) => void;
}) {
  const [codigo, setCodigo] = useState(codigoInicial);
  const [corriendo, setCorriendo] = useState(false);
  const [resultado, setResultado] = useState<RunResult | null>(null);
  const { señales, eventos, reiniciar } = usarSenales();

  const entregar = async () => {
    setCorriendo(true);
    setResultado(null);
    const pedido: RunRequest = {
      lenguaje: "javascript",
      codigo,
      limites: limitesDefecto(),
      pruebas,
    };
    try {
      const corrida = await correrPruebasJavaScript(pedido);
      setResultado(corrida);
      onVeredicto({
        resultado: corrida,
        superado: todasPasadas(corrida),
        codigo,
        señales: [...señales],
      });
      reiniciar();
    } finally {
      setCorriendo(false);
    }
  };

  return (
    <div className="grid gap-6">
      <label className="flex flex-col gap-2 font-mono text-sm">
        Tu código
        <textarea
          value={codigo}
          onChange={(evento) => setCodigo(evento.target.value)}
          onPaste={eventos.onPaste}
          onKeyDown={eventos.onKeyDown}
          onBlur={eventos.onBlur}
          rows={12}
          spellCheck={false}
          aria-label="Código del reto"
          className="min-h-64 w-full border border-line bg-paper p-3 font-mono text-sm leading-6 text-ink"
        />
        <span className="flex flex-wrap justify-between gap-2">
          <span>
            Una corrida por prueba, en tu navegador, aislada y con límites. Las señales del editor
            ({señales.length}) solo alimentan el contexto de la defensa.
          </span>
          <button
            type="button"
            onClick={() => setCodigo(codigoInicial)}
            className="text-muted underline"
          >
            volver al código de partida
          </button>
        </span>
      </label>

      <Button tone="primary" disabled={corriendo || !codigo.trim()} onClick={() => void entregar()}>
        {corriendo ? "Ejecutando las pruebas…" : boton}
      </Button>

      {resultado && <Corrida corrida={resultado} pruebas={pruebas} />}
    </div>
  );
}

const etiquetasEstado: Record<RunResult["estado"], string> = {
  ok: "El programa terminó bien",
  error: "El programa falló",
  tiempo: "Corte por tiempo",
  memoria: "Corte por memoria",
  "salida-excedida": "Salida enorme",
  "no-soportado": "Aquí no se puede ejecutar",
};

export function Corrida({ corrida, pruebas }: { corrida: RunResult; pruebas: TestSpec[] }) {
  const superado = todasPasadas(corrida);
  const nombreDe = new Map(pruebas.map((prueba) => [prueba.id, prueba.nombre]));
  return (
    <section className="border-t border-line pt-4">
      <p className={cn("font-mono text-sm", superado ? "text-copper" : "text-muted")}>
        Veredicto: {superado ? "todas las pruebas pasaron" : "no pasó"} · {etiquetasEstado[corrida.estado]} ·{" "}
        {corrida.duracionMs} ms
      </p>
      <p className="mt-1 font-mono text-xs text-muted">
        {corrida.motor.nombre} · {corrida.motor.version} · ejecución real en tu navegador
      </p>

      <ol className="mt-4 grid gap-2">
        {(corrida.pruebas ?? []).map((prueba, indice) => {
          const nombre = nombreDe.get(prueba.id) ?? `prueba ${indice + 1}`;
          return (
            <li key={prueba.id} className="border border-line px-3 py-2">
              <p className={cn("font-mono text-sm", prueba.pasada ? "text-copper" : "text-muted")}>
                {prueba.pasada ? "✓" : "✗"} {nombre}
              </p>
              {!prueba.pasada && (
                <p className="mt-1 text-pretty text-muted">
                  {prueba.error
                    ? `El programa dijo: ${prueba.error}`
                    : `Lo que salió: ${textoCorto(prueba.obtenido)}. Lo que pedía la prueba: ${textoCorto(prueba.esperado)}.`}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {corrida.stderr.trim().length > 0 && (
        <pre className="mt-4 max-h-40 overflow-auto border border-copper bg-paper p-3 font-mono text-sm leading-6 whitespace-pre-wrap text-ink">
          {corrida.stderr}
        </pre>
      )}
    </section>
  );
}

function textoCorto(valor: unknown): string {
  const texto = typeof valor === "string" ? valor : JSON.stringify(valor);
  return texto.length > 200 ? `${texto.slice(0, 200)}…` : texto;
}
