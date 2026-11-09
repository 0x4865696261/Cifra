import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CuentaJuez } from "@/components/codigo/cuenta-juez";
import { EditorCodigo, useBorrador } from "@/components/codigo/editor";
import { PanelesCodigo } from "@/components/codigo/paneles";
import { VistaWeb } from "@/components/codigo/vista-web";
import { etiquetasJuez, type LenguajeJuez } from "@/lib/ejecucion/catalogo";
import { juzgarCodigo, verEjemplos, type PeticionJuez } from "@/lib/ejecucion/juez";
import type { RunResult } from "@/lib/ejecucion/tipos";
import { usarSenales } from "@/lib/retos/use-senales";
import { Corrida, type EntregaResultado } from "./entrega";

type Ejemplo = { id: string; entrada: unknown; esperado: unknown };

export function TallerReto({
  id,
  contexto,
  lenguajes,
  codigoInicial,
  cssInicial = "",
  semilla,
  ejemplos: fijos,
  esNivel = false,
  onVeredicto,
  onEstudiarFallo,
  extra,
}: {
  id: string;
  contexto: ReactNode;
  lenguajes: readonly LenguajeJuez[];
  codigoInicial: (lenguaje: LenguajeJuez) => string;
  cssInicial?: string;
  semilla?: string;
  ejemplos?: readonly Ejemplo[];
  esNivel?: boolean;
  onVeredicto: (entrega: EntregaResultado) => void;
  onEstudiarFallo?: (codigo: string, mensaje: string, lenguaje: LenguajeJuez) => void;
  extra?: ReactNode;
}) {
  const [lenguaje, setLenguaje] = useState<LenguajeJuez>(lenguajes[0]);
  const [panel, setPanel] = useState<"problema" | "codigo" | "resultado">("problema");
  const [archivo, setArchivo] = useState<"html" | "css">("html");
  const [ocupado, setOcupado] = useState(false);
  const [estado, setEstado] = useState<{
    resultado?: RunResult;
    aviso?: string;
    modo: PeticionJuez["modo"];
    codigo?: string;
    css?: string;
  }>();
  const [ejemplos, setEjemplos] = useState<readonly Ejemplo[]>([]);
  const [errorEjemplos, setErrorEjemplos] = useState(false);
  const [codigo, editarCodigo] = useBorrador(
    `cifra.borrador.v1:${id}:${lenguaje}`,
    codigoInicial(lenguaje),
  );
  const [css, editarCss] = useBorrador(`cifra.borrador.v1:${id}:css`, cssInicial);
  const { señales, eventos, reiniciar } = usarSenales();

  useEffect(() => {
    if (!semilla || fijos) return;
    let vigente = true;
    void verEjemplos({ data: { reto: id, semilla } })
      .then((respuesta) => {
        if (vigente) setEjemplos(respuesta);
      })
      .catch(() => {
        if (vigente) setErrorEjemplos(true);
      });
    return () => {
      vigente = false;
    };
  }, [id, semilla, fijos]);

  const correr = async (modo: "ejecutar" | "enviar" | "nivel") => {
    setOcupado(true);
    setEstado(undefined);
    setPanel("resultado");
    try {
      const respuesta = await juzgarCodigo({
        data: {
          modo,
          reto: id,
          semilla,
          lenguaje,
          codigo,
          css: lenguaje === "web" ? css : undefined,
        },
      });
      if (!respuesta.ok) {
        setEstado({ modo, aviso: respuesta.mensaje });
        return;
      }
      setEstado({ modo, resultado: respuesta.resultado, codigo, css });
      if (modo !== "ejecutar") {
        onVeredicto({
          codigo,
          lenguaje,
          señales,
          resultado: respuesta.resultado,
          superado: respuesta.superado,
        });
        reiniciar();
      }
    } catch (error) {
      setEstado({
        modo,
        aviso: error instanceof Error ? error.message : "No se pudo completar la ejecución.",
      });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <PanelesCodigo
      panel={panel}
      onPanel={setPanel}
      contexto={
        <>
          {contexto}
          {errorEjemplos && (
            <p role="status" className="mt-5 text-sm text-muted">
              No se pudieron cargar los ejemplos.
            </p>
          )}
          {(fijos ?? ejemplos).length > 0 && (
            <section className="mt-6 space-y-3">
              <h3 className="font-mono text-sm">Ejemplos</h3>
              {(fijos ?? ejemplos).map((ejemplo) => (
                <div key={ejemplo.id} className="rounded-md border border-line p-3">
                  <p className="mb-2 text-sm">Caso {ejemplo.id}</p>
                  <pre className="overflow-auto whitespace-pre-wrap break-words text-xs">
                    Entrada: {JSON.stringify(ejemplo.entrada)}
                    {"\n"}Salida: {JSON.stringify(ejemplo.esperado)}
                  </pre>
                </div>
              ))}
            </section>
          )}
        </>
      }
      codigo={
        <div className="grid gap-3" onKeyDown={eventos.onKeyDown}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 font-mono text-sm">
              Lenguaje
              <select
                value={lenguaje}
                disabled={ocupado || lenguajes.length === 1}
                className="min-h-10 rounded border border-line bg-paper px-2"
                onChange={(e) => {
                  const siguiente = lenguajes.find((id) => id === e.target.value);
                  if (siguiente) {
                    setLenguaje(siguiente);
                    setEstado(undefined);
                    reiniciar();
                  }
                }}
              >
                {lenguajes.map((id) => (
                  <option key={id} value={id}>
                    {etiquetasJuez[id]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="text-xs text-muted underline"
              onClick={() => {
                if (lenguaje === "web" && archivo === "css") editarCss(cssInicial);
                else editarCodigo(codigoInicial(lenguaje));
              }}
            >
              Restablecer código
            </button>
          </div>
          {lenguaje === "web" && (
            <div className="flex gap-2" aria-label="Archivos">
              <Button
                tone="ghost"
                aria-pressed={archivo === "html"}
                onClick={() => setArchivo("html")}
              >
                index.html
              </Button>
              <Button
                tone="ghost"
                aria-pressed={archivo === "css"}
                onClick={() => setArchivo("css")}
              >
                styles.css
              </Button>
            </div>
          )}
          <EditorCodigo
            key={lenguaje + archivo}
            valor={lenguaje === "web" && archivo === "css" ? css : codigo}
            onChange={lenguaje === "web" && archivo === "css" ? editarCss : editarCodigo}
            lenguaje={lenguaje === "web" ? archivo : lenguaje}
            etiqueta="Código del reto"
            onPaste={eventos.onPaste}
            onBlur={eventos.onBlur}
          />
          <div className="flex flex-wrap gap-2">
            {!esNivel && (
              <Button
                tone="ghost"
                disabled={ocupado || !codigo.trim()}
                onClick={() => void correr("ejecutar")}
              >
                Ejecutar
              </Button>
            )}
            <Button
              tone="primary"
              disabled={ocupado || !codigo.trim()}
              onClick={() => void correr(esNivel ? "nivel" : "enviar")}
            >
              {esNivel ? "Entregar el tramo" : "Enviar"}
            </Button>
          </div>
          <CuentaJuez />
        </div>
      }
      resultado={
        <div className="space-y-3" aria-live="polite">
          <h2 className="font-mono text-sm">
            {estado?.modo === "ejecutar" ? "Resultado de los ejemplos" : "Resultado"}
          </h2>
          {ocupado && (
            <p role="status" className="text-sm text-muted">
              Ejecutando en el servidor…
            </p>
          )}
          {estado?.aviso && (
            <>
              <p role="alert" className="text-sm text-copper">
                {estado.aviso}
              </p>
              <CuentaJuez />
            </>
          )}
          {!estado && !ocupado && (
            <p className="text-sm text-muted">Ejecuta o envía tu código para ver el resultado.</p>
          )}
          {estado?.resultado && <Corrida corrida={estado.resultado} />}
          {estado?.modo === "ejecutar" &&
            estado.codigo &&
            estado.resultado?.stderr.trim() &&
            onEstudiarFallo && (
              <Button
                tone="ghost"
                onClick={() =>
                  onEstudiarFallo(
                    estado.codigo!,
                    estado.resultado!.stderr.trim().slice(0, 4_000),
                    lenguaje,
                  )
                }
              >
                Estudiar este fallo →
              </Button>
            )}
          {lenguaje === "web" && (
            <VistaWeb html={estado?.codigo ?? codigo} css={estado?.css ?? css} />
          )}
          {extra}
        </div>
      }
    />
  );
}
