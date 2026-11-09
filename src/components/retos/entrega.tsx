 version/1.0
import type { LenguajeJuez } from "@/lib/ejecucion/catalogo";
import { todasPasadas, textoDe } from "@/lib/ejecucion/pruebas";
import type { RunResult, TestSpec } from "@/lib/ejecucion/tipos";
=======
import { useEffect, useState } from "react";
import { correrPruebasJavaScript, todasPasadas } from "@/lib/ejecucion/pruebas";
import { limitesDefecto } from "@/lib/ejecucion/limites";
import type { RunRequest, RunResult, TestSpec } from "@/lib/ejecucion/tipos";
import { EditorCodigo } from "@/components/editor-codigo";
import { cn } from "@/lib/cn";
import { usarSenales } from "@/lib/retos/use-senales";

import type { SenalIntegridad } from "@/lib/retos/tipos";
import { cn } from "@/lib/cn";

export type EntregaResultado = {
  resultado: RunResult;
  superado: boolean;
  codigo: string;
  lenguaje: LenguajeJuez;
  señales: SenalIntegridad[];
};



export function EntregaEditor({
  codigoInicial,
  borradorId,
  pruebas,
  boton = "Ejecutar pruebas",
  onVeredicto,
}: {
  codigoInicial: string;
  borradorId?: string;
  pruebas: TestSpec[];
  boton?: string;
  /** Se avisa en cada entrega que corrió: `superado` sale de `todasPasadas`, nunca se consulta. */
  onVeredicto: (entrega: EntregaResultado) => void;
}) {
  const [codigo, setCodigo] = useState(codigoInicial);
  const [corriendo, setCorriendo] = useState(false);
  const [resultado, setResultado] = useState<RunResult | null>(null);
  const { señales, eventos, reiniciar } = usarSenales();
  const [avisoBorrador, setAvisoBorrador] = useState("");
  const claveBorrador = borradorId ? `cifra.reto.borrador.v1.${borradorId}` : undefined;

  useEffect(() => {
    if (!claveBorrador) return;
    try {
      const guardado = localStorage.getItem(claveBorrador);
      if (guardado === null) return;
      const borrador: unknown = JSON.parse(guardado);
      if (
        borrador && typeof borrador === "object" &&
        "plantilla" in borrador && borrador.plantilla === codigoInicial &&
        "codigo" in borrador && typeof borrador.codigo === "string"
      ) {
        setCodigo(borrador.codigo);
        setAvisoBorrador("Borrador recuperado.");
      }
    } catch {
      // El editor sigue disponible aunque el almacenamiento esté bloqueado o el dato esté dañado.
    }
  }, [claveBorrador, codigoInicial]);

  const editar = (nuevo: string) => {
    setCodigo(nuevo);
    if (!claveBorrador) return;
    try {
      if (nuevo === codigoInicial) {
        localStorage.removeItem(claveBorrador);
        setAvisoBorrador("");
      } else {
        localStorage.setItem(claveBorrador, JSON.stringify({ plantilla: codigoInicial, codigo: nuevo }));
        setAvisoBorrador("Borrador guardado en este navegador.");
      }
    } catch {
      setAvisoBorrador("No se pudo guardar el borrador en este navegador.");
    }
  };

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
      <div className="grid gap-3 text-sm">
        <EditorCodigo
          value={codigo}
          onChange={editar}
          label="Código del reto"
          language="javascript"
          readOnly={corriendo}
          runDisabled={!codigo.trim()}
          output={corriendo ? "Ejecutando las pruebas…" : resultado && <Corrida corrida={resultado} pruebas={pruebas} />}
          onRun={() => { if (!corriendo && codigo.trim()) void entregar(); }}
          onSave={() => editar(codigo)}
          busy={corriendo}
          runLabel={corriendo ? "Ejecutando…" : boton}
          onPaste={eventos.onPaste}
          onKeyDown={eventos.onKeyDown}
          onBlur={eventos.onBlur}
        />
        <span className="flex flex-wrap justify-between gap-2">
          <span>
            Una corrida por prueba, en tu navegador, aislada y con límites. Las señales del editor
            ({señales.length}) solo alimentan el contexto de la defensa.
          </span>
          <button
            type="button"
            disabled={corriendo}
            onClick={() => editar(codigoInicial)}
            className="text-muted underline"
          >
            volver al código de partida
          </button>
        </span>
        <span role="status" className="text-muted">{avisoBorrador}</span>
      </div>

      {resultado && <div className="cifra-salida" aria-live="polite"><Corrida corrida={resultado} pruebas={pruebas} /></div>}
    </div>
  );
}


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
