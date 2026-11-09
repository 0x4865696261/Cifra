import type { LenguajeJuez } from "@/lib/ejecucion/catalogo";
import { todasPasadas, textoDe } from "@/lib/ejecucion/pruebas";
import type { RunResult, TestSpec } from "@/lib/ejecucion/tipos";
import type { SenalIntegridad } from "@/lib/retos/tipos";
import { cn } from "@/lib/cn";

export type EntregaResultado = {
  resultado: RunResult;
  superado: boolean;
  codigo: string;
  lenguaje: LenguajeJuez;
  señales: SenalIntegridad[];
};

const etiquetasEstado: Record<RunResult["estado"], string> = {
  ok: "El programa terminó",
  error: "Error de compilación o ejecución",
  tiempo: "Límite de tiempo",
  memoria: "Límite de memoria",
  "salida-excedida": "Límite de salida",
  "no-soportado": "Ejecución no disponible",
};

export function Corrida({ corrida, pruebas = [] }: { corrida: RunResult; pruebas?: TestSpec[] }) {
  const paso = todasPasadas(corrida);
  const nombres = new Map(pruebas.map((prueba) => [prueba.id, prueba.nombre]));
  return (
    <section className="min-w-0 border-t border-line pt-3">
      <p className={cn("font-mono text-sm", paso ? "text-copper" : "text-muted")}>
        {corrida.pruebas?.length
          ? paso
            ? "Todas las pruebas pasaron"
            : "Hay pruebas sin superar"
          : etiquetasEstado[corrida.estado]}
      </p>
      <p className="mt-1 font-mono text-xs text-muted">
        {corrida.motor.nombre} · {corrida.motor.version} · {corrida.duracionMs} ms
      </p>
      {corrida.pruebas?.length ? (
        <ol className="mt-3 grid gap-2">
          {corrida.pruebas.map((prueba, indice) => (
            <li key={prueba.id} className="min-w-0 rounded border border-line px-3 py-2">
              <p className="font-mono text-sm">
                {prueba.pasada ? "✓" : "✗"}{" "}
                {nombres.get(prueba.id) ??
                  (prueba.id.startsWith("oculto") ? "Caso oculto" : `Caso ${indice + 1}`)}
              </p>
              {!prueba.pasada && (
                <p className="mt-1 break-words text-sm text-muted">
                  {prueba.obtenido === undefined
                    ? prueba.error
                    : `Salida: ${textoDe(prueba.obtenido).slice(0, 200)}. Esperado: ${textoDe(prueba.esperado).slice(0, 200)}.`}
                </p>
              )}
            </li>
          ))}
        </ol>
      ) : null}
      {corrida.stdout && (
        <pre
          aria-label="Salida"
          className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap break-words rounded border border-line p-3 text-sm"
        >
          {corrida.stdout}
        </pre>
      )}
      {corrida.stderr && (
        <pre
          aria-label="Diagnóstico"
          className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap break-words rounded border border-copper p-3 text-sm"
        >
          {corrida.stderr}
        </pre>
      )}
    </section>
  );
}
