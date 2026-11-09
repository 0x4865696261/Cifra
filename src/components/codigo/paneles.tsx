import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PanelCodigo = "problema" | "codigo" | "resultado";

export function PanelesCodigo({
  contexto,
  codigo,
  resultado,
  panel,
  onPanel,
  titulo = "Problema",
}: {
  contexto: ReactNode;
  codigo: ReactNode;
  resultado: ReactNode;
  panel: PanelCodigo;
  onPanel: (panel: PanelCodigo) => void;
  titulo?: string;
}) {
  const [ancho, setAncho] = useState(43);
  const superficie = useRef<HTMLDivElement>(null);
  const cambiarAncho = (valor: number) => setAncho(Math.max(27, Math.min(68, valor)));
  return (
    <div>
      <div className="mb-3 flex gap-1 lg:hidden" aria-label="Paneles">
        {(
          [
            ["problema", titulo],
            ["codigo", "Código"],
            ["resultado", "Resultado"],
          ] as const
        ).map(([id, nombre]) => (
          <button
            type="button"
            key={id}
            aria-pressed={panel === id}
            onClick={() => onPanel(id)}
            className={cn(
              "min-h-11 flex-1 rounded-md border border-line px-2 font-mono text-xs",
              panel === id && "bg-ink text-paper",
            )}
          >
            {nombre}
          </button>
        ))}
      </div>
      <div ref={superficie} className="lg:flex lg:h-[max(36rem,calc(100dvh-9rem))] lg:min-w-0">
        <section
          aria-label={titulo}
          style={{ "--cifra-ancho": ancho + "%" } as React.CSSProperties}
          className={cn(
            "min-w-0 rounded-lg border border-line bg-paper p-4 lg:block lg:w-[var(--cifra-ancho)] lg:shrink-0 lg:overflow-y-auto lg:p-6",
            panel !== "problema" && "hidden",
          )}
        >
          {contexto}
        </section>
        <div
          role="separator"
          aria-label="Anchura del panel izquierdo"
          aria-orientation="vertical"
          aria-valuemin={27}
          aria-valuemax={68}
          aria-valuenow={ancho}
          tabIndex={0}
          className="hidden w-3 shrink-0 touch-none cursor-col-resize rounded hover:bg-copper/20 focus-visible:bg-copper/20 lg:block"
          onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            const caja = superficie.current?.getBoundingClientRect();
            if (caja) cambiarAncho(Math.round(((e.clientX - caja.left) / caja.width) * 100));
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              cambiarAncho(ancho + (e.key === "ArrowLeft" ? -3 : 3));
            }
          }}
        />
        <div className="min-w-0 flex-1 space-y-3 lg:overflow-y-auto">
          <section
            aria-label="Código"
            className={cn(
              "min-w-0 rounded-lg border border-line bg-paper p-4 lg:block",
              panel !== "codigo" && "hidden",
            )}
          >
            {codigo}
          </section>
          <section
            aria-label="Resultado"
            className={cn(
              "min-w-0 rounded-lg border border-line bg-paper p-4 lg:block",
              panel !== "resultado" && "hidden",
            )}
          >
            {resultado}
          </section>
        </div>
      </div>
    </div>
  );
}
