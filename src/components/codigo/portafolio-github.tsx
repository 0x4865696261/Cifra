import { useState } from "react";
import { Button } from "@/components/ui/button";
import { publicarLogros, type ResultadoPortafolio } from "@/lib/retos/logros";

export function PortafolioGithub({ autorizar }: { autorizar: () => Promise<void> }) {
  const [ocupado, setOcupado] = useState(false);
  const [resultado, setResultado] = useState<ResultadoPortafolio>();
  const actuar = async (modo: "manual" | "pausar") => {
    setOcupado(true);
    try {
      setResultado(await publicarLogros({ data: modo }));
    } catch {
      setResultado({
        estado: "error",
        mensaje: "No se pudo contactar con Cifra. Inténtalo de nuevo.",
      });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <details className="w-full rounded border border-line px-3 py-2">
      <summary className="cursor-pointer font-mono text-xs text-ink">Portafolio en GitHub</summary>
      <p className="my-2 text-sm">
        Publica el reto, el lenguaje y la fecha en tu repositorio público cifra-logros. Una vez
        publicado, Cifra lo actualiza al superar nuevos retos. Puedes fijarlo en tu perfil.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" tone="ghost" disabled={ocupado} onClick={() => void actuar("manual")}>
          Publicar logros
        </Button>
        <Button type="button" tone="ghost" disabled={ocupado} onClick={() => void actuar("pausar")}>
          Pausar sincronización
        </Button>
      </div>
      {resultado && (
        <div role="status" className="mt-2 space-y-2">
          {resultado.estado === "publicado" ? (
            <a href={resultado.url} target="_blank" rel="noreferrer" className="underline">
              Abrir mi repositorio de logros
            </a>
          ) : (
            <p>{resultado.mensaje}</p>
          )}
          {resultado.estado === "permiso" && (
            <>
              <p>
                GitHub solicitará acceso a repositorios públicos. Cifra usará ese permiso para
                actualizar cifra-logros.
              </p>
              <Button
                type="button"
                tone="primary"
                disabled={ocupado}
                onClick={async () => {
                  setOcupado(true);
                  try {
                    await autorizar();
                  } finally {
                    setOcupado(false);
                  }
                }}
              >
                Autorizar publicación en GitHub
              </Button>
            </>
          )}
        </div>
      )}
    </details>
  );
}
