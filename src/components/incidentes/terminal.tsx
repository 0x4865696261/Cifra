import { useMemo, useRef, useState } from "react";
import { creaSistema } from "@/lib/incidentes/sistema";
import { COMANDOS_TERMINAL, ejecutarComando, terminalVacia, type EstadoTerminal } from "@/lib/incidentes/terminal";

/**
 * La terminal simulada en la pantalla de incidente (0.5.B). Es la capa de interfaz del
 * intérprete puro de `src/lib/incidentes/terminal.ts`: lista cerrada de comandos, solo
 * lectura, historial revisable. No se conecta a nada: sus ficheros son el paquete.
 */
export function TerminalViva({ ficheros }: { ficheros: Record<string, string> }) {
  const sistema = useMemo(() => creaSistema(ficheros), [ficheros]);
  const [estado, setEstado] = useState<EstadoTerminal>(terminalVacia);
  const [entrada, setEntrada] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const parche = useRef<HTMLDivElement | null>(null);

  const correr = (linea: string) => {
    setAviso(null);
    try {
      setEstado((anterior) => ejecutarComando(linea, sistema, anterior));
    } catch {
      setAviso("Esa línea no ha corrido en la terminal. Repásala y prueba de nuevo.");
    }
  };

  const respuestas = [...estado.historial].reverse();

  return (
    <section aria-label="Terminal simulada del paquete, de solo lectura">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(evento) => {
          evento.preventDefault();
          if (entrada.trim().length === 0) return;
          correr(entrada);
          setEntrada("");
          requestAnimationFrame(() => {
            parche.current?.focus();
          });
        }}
      >
        <label className="grid min-w-0 flex-1 basis-64 gap-1">
          <span className="font-mono text-sm">Comando</span>
          <input
            value={entrada}
            onChange={(evento) => setEntrada(evento.target.value)}
            placeholder="ls logs"
            spellCheck={false}
            autoComplete="off"
            className="min-h-11 border border-line bg-paper px-3 font-mono text-sm"
          />
        </label>
        <button type="submit" className="tap min-h-11 border border-line bg-ink px-4 font-mono text-sm text-paper">
          Ejecutar
        </button>
      </form>
      <p className="mt-2 font-mono text-sm text-muted">
        {COMANDOS_TERMINAL.join(" · ")} — y nada más: otros comandos no se ejecutan. Puedes unir
        dos con tubería: <code className="font-mono">grep ERROR logs/app.log | wc -l</code>.
      </p>

      {aviso && (
        <p role="alert" className="mt-3 border-l border-copper pl-4">
          {aviso}
        </p>
      )}

      <div aria-live="polite" className="mt-4 space-y-3">
        {respuestas.length === 0 && (
          <p className="font-mono text-sm text-muted">
            La terminal está vacía. Empieza por <code className="font-mono">ls</code>.
          </p>
        )}
        {respuestas.map((entradaHist, indice) => (
          <article key={estado.historial.length - 1 - indice} className="border border-line">
            <p className="border-b border-line bg-paper px-3 py-2 font-mono text-sm">
              <span className="text-copper">$&nbsp;</span>
              {entradaHist.comando}
            </p>
            <pre
              className={
                "max-h-72 overflow-auto px-3 py-2 font-mono text-sm leading-6 " +
                (entradaHist.ok ? "text-ink" : "text-copper")
              }
            >
              {entradaHist.lineas.join("\n")}
            </pre>
          </article>
        ))}
      </div>
      <div ref={parche} tabIndex={-1} className="sr-only">
        Última salida de la terminal
      </div>
    </section>
  );
}
