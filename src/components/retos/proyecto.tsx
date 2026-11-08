import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Corrida } from "@/components/retos/entrega";
import { EditorCodigo, type TemaEditor } from "@/components/editor-codigo";
import { limitesDefecto } from "@/lib/ejecucion/limites";
import { codigoProyecto, maximoArchivoProyecto } from "@/lib/ejecucion/proyecto-javascript";
import { correrPruebasJavaScript } from "@/lib/ejecucion/pruebas";
import type { RunResult } from "@/lib/ejecucion/tipos";
import { proyectoPedidos, pruebasPedidos } from "@/lib/retos/proyecto-pedidos";

const proyecto = proyectoPedidos;
const clave = `cifra.proyecto.v1.${proyecto.id}`;
const temas: TemaEditor[] = ["Claro", "Oscuro", "Alto contraste"];
type Borrador = {
  archivos: Record<string, string>;
  ruta: string;
  tema: TemaEditor;
  tamano: number;
};
const original = Object.fromEntries(proyecto.archivos.map(({ ruta, codigo }) => [ruta, codigo]));
const inicial: Borrador = { archivos: original, ruta: proyecto.entrada, tema: "Claro", tamano: 14 };

function recuperar(): Borrador {
  try {
    const dato = JSON.parse(localStorage.getItem(clave) ?? "null") as Partial<Borrador> | null;
    if (!dato) return inicial;
    return {
      archivos: Object.fromEntries(
        proyecto.archivos.map(({ ruta, codigo }) => {
          const guardado = dato.archivos?.[ruta];
          return [
            ruta,
            typeof guardado === "string" && guardado.length <= maximoArchivoProyecto
              ? guardado
              : codigo,
          ];
        }),
      ),
      ruta:
        typeof dato.ruta === "string" && Object.hasOwn(original, dato.ruta)
          ? dato.ruta
          : inicial.ruta,
      tema: typeof dato.tema === "string" && temas.includes(dato.tema) ? dato.tema : inicial.tema,
      tamano: [12, 14, 16, 18].includes(dato.tamano ?? 0) ? dato.tamano! : inicial.tamano,
    };
  } catch {
    return inicial;
  }
}

export function RetoProyecto() {
  const [borrador, setBorrador] = useState(inicial);
  const [preparado, setPreparado] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [aviso, setAviso] = useState("");
  const [resultado, setResultado] = useState<RunResult | null>(null);
  const [pendiente, setPendiente] = useState(false);
  const [destino, setDestino] = useState<{ ruta: string; linea?: number }>();
  const { archivos, ruta, tema, tamano } = borrador;
  const codigo = archivos[ruta];

  useEffect(() => {
    setBorrador(recuperar());
    setPreparado(true);
  }, []);

  const guardar = (nuevo: Borrador) => {
    if (!preparado) return;
    setBorrador(nuevo);
    try {
      localStorage.setItem(clave, JSON.stringify(nuevo));
      setAviso("Borrador guardado en este navegador.");
    } catch {
      setAviso("No se pudo guardar el borrador en este navegador.");
    }
  };

  const entregar = async () => {
    if (!preparado || pendiente) return;
    setPendiente(true);
    setResultado(null);
    try {
      const fuentes = proyecto.archivos.map(({ ruta }) => ({ ruta, codigo: archivos[ruta] }));
      const corrida = await correrPruebasJavaScript(
        { lenguaje: "javascript", codigo: "", limites: limitesDefecto(), pruebas: pruebasPedidos },
        (prueba) => codigoProyecto(fuentes, proyecto.entrada, prueba.entrada),
      );
      setResultado(corrida);
    } catch {
      setAviso("No se pudieron iniciar las pruebas. Vuelve a intentarlo.");
    } finally {
      setPendiente(false);
    }
  };

  const error = resultado?.stderr || resultado?.pruebas?.find((p) => p.error)?.error || "";
  const ubicacion = error.match(/cifra-proyecto\/([\w/.\-]+):(\d+):\d+/);
  const archivoError =
    ubicacion?.[1] ??
    proyecto.archivos.find(({ ruta }) => error.includes(`SyntaxError: ${ruta}:`))?.ruta;
  const visibles = proyecto.archivos.filter(({ ruta }) =>
    ruta.toLowerCase().includes(busqueda.toLowerCase()),
  );
  const carpetas = [...new Set(visibles.map(({ ruta }) => ruta.slice(0, ruta.lastIndexOf("/"))))];

  return (
    <main id="contenido" className="cifra-workspace">
      <div className="cifra-split">
        <section className="cifra-brief" aria-label="Enunciado del proyecto">
          <Link to="/retos" className="underline">
            Volver a Retos
          </Link>
          <h1 className="mt-3 font-serif text-4xl">{proyecto.titulo}</h1>
          <a
            href="#editor-reto"
            className="mt-4 inline-block font-semibold text-copper underline lg:hidden"
          >
            Saltar al editor
          </a>
          <p className="mt-3 max-w-3xl">
            La tienda cobra 3 € por envío local, que pasa a ser gratis desde 50 €. Un envío remoto
            cuesta 8 €. Un carrito vacío siempre cuesta 0 €. Completa la tarifa en{" "}
            <code>envio.js</code> y haz que <code>pedido.js</code> sume el envío al subtotal. Los
            archivos se enlazan con <code>require</code> y <code>module.exports</code>.
          </p>

          <aside className="mt-6 min-w-0 rounded-xl border border-line p-3">
            <label className="grid gap-1 text-sm">
              Buscar archivos
              <input
                className="min-w-0 border border-line bg-paper p-2"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>
            {carpetas.length === 0 && (
              <p className="mt-3 text-sm text-muted">Sin archivos que coincidan.</p>
            )}
            {carpetas.map((carpeta) => (
              <div className="mt-3" key={carpeta}>
                <p className="font-mono text-sm text-muted">{carpeta}/</p>
                <ul className="pl-3">
                  {visibles
                    .filter(({ ruta }) => ruta.startsWith(carpeta + "/"))
                    .map(({ ruta: archivo }) => (
                      <li key={archivo}>
                        <button
                          type="button"
                          aria-current={archivo === ruta ? "true" : undefined}
                          className="min-h-11 text-left font-mono text-sm underline"
                          onClick={() => guardar({ ...borrador, ruta: archivo })}
                        >
                          {archivo.split("/").at(-1)}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </aside>
        </section>

        <section id="editor-reto" className="min-w-0 scroll-mt-4" aria-label="Editor del proyecto">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Archivos abiertos">
            {proyecto.archivos.map(({ ruta: archivo }) => (
              <Button
                key={archivo}
                tone={archivo === ruta ? "quiet" : "ghost"}
                aria-pressed={archivo === ruta}
                onClick={() => guardar({ ...borrador, ruta: archivo })}
              >
                {archivo.split("/").at(-1)}
              </Button>
            ))}
          </div>
          <div className="my-3 flex flex-wrap gap-4 text-sm">
            <label>
              Tema{" "}
              <select
                disabled={!preparado}
                value={tema}
                className="border border-line bg-paper p-2"
                onChange={(e) => guardar({ ...borrador, tema: e.target.value as TemaEditor })}
              >
                {temas.map((opcion) => (
                  <option key={opcion}>{opcion}</option>
                ))}
              </select>
            </label>
            <label>
              Tamaño{" "}
              <select
                value={tamano}
                className="border border-line bg-paper p-2"
                onChange={(e) => guardar({ ...borrador, tamano: Number(e.target.value) })}
              >
                {[12, 14, 16, 18].map((opcion) => (
                  <option key={opcion}>{opcion}</option>
                ))}
              </select>
            </label>
          </div>
          <EditorCodigo
            key={ruta}
            value={codigo}
            label={`Código de ${ruta}`}
            language="javascript"
            theme={tema}
            fontSize={tamano}
            maxLength={maximoArchivoProyecto}
            readOnly={!preparado || pendiente}
            output={
              pendiente
                ? "Ejecutando las pruebas…"
                : resultado && <Corrida corrida={resultado} pruebas={pruebasPedidos} />
            }
            jump={destino?.ruta === ruta ? { line: destino.linea ?? 1 } : undefined}
            onChange={(nuevo) => {
              setDestino(undefined);
              guardar({ ...borrador, archivos: { ...archivos, [ruta]: nuevo } });
              setResultado(null);
            }}
            onRun={() => void entregar()}
            onSave={() => guardar(borrador)}
            runLabel={pendiente ? "Ejecutando…" : "Ejecutar pruebas"}
          />
          <p className="mt-2 text-sm text-muted">
            Ctrl/⌘ + S guarda · Ctrl/⌘ + Intro ejecuta las pruebas.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              disabled={pendiente}
              onClick={() => {
                guardar({ ...borrador, archivos: original });
                setResultado(null);
              }}
            >
              Restaurar plantilla
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted" role="status">
            {aviso}
          </p>
          {resultado && (
            <div className="cifra-salida" aria-live="polite">
              {archivoError && Object.hasOwn(archivos, archivoError) && (
                <Button
                  onClick={() => {
                    guardar({ ...borrador, ruta: archivoError });
                    setDestino({
                      ruta: archivoError,
                      linea: ubicacion ? Math.max(1, Number(ubicacion[2]) - 2) : undefined,
                    });
                  }}
                >
                  Ir al archivo del error
                </Button>
              )}
              <Corrida corrida={resultado} pruebas={pruebasPedidos} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
