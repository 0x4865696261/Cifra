import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Corrida } from "@/components/retos/entrega";
import { limitesDefecto } from "@/lib/ejecucion/limites";
import { codigoProyecto, maximoArchivoProyecto } from "@/lib/ejecucion/proyecto-javascript";
import { correrPruebasJavaScript } from "@/lib/ejecucion/pruebas";
import type { RunResult } from "@/lib/ejecucion/tipos";
import { proyectoPedidos, pruebasPedidos } from "@/lib/retos/proyecto-pedidos";

const proyecto = proyectoPedidos;
const clave = `cifra.proyecto.v1.${proyecto.id}`;
const temas = {
  Claro: {
    editor: "bg-slate-50 text-slate-900",
    palabra: "text-violet-800",
    cadena: "text-green-800",
    comentario: "text-slate-600",
  },
  Oscuro: {
    editor: "bg-slate-950 text-slate-100",
    palabra: "text-violet-300",
    cadena: "text-green-300",
    comentario: "text-slate-400",
  },
  "Alto contraste": {
    editor: "bg-black text-white",
    palabra: "text-yellow-300",
    cadena: "text-cyan-300",
    comentario: "text-white",
  },
};
type Tema = keyof typeof temas;
type Borrador = { archivos: Record<string, string>; ruta: string; tema: Tema; tamano: number };
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
      tema:
        typeof dato.tema === "string" && Object.hasOwn(temas, dato.tema) ? dato.tema : inicial.tema,
      tamano: [12, 14, 16, 18].includes(dato.tamano ?? 0) ? dato.tamano! : inicial.tamano,
    };
  } catch {
    return inicial;
  }
}

function colorear(codigo: string, tema: (typeof temas)[Tema]) {
  const patron =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|function|return|if|else|for|while|throw|new|true|false|null|module|exports|require)\b)/g;
  return codigo.split(patron).map((texto, indice) =>
    indice % 2 ? (
      <span
        key={indice}
        className={
          texto.startsWith("/")
            ? tema.comentario
            : /^["'`]/.test(texto)
              ? tema.cadena
              : tema.palabra
        }
      >
        {texto}
      </span>
    ) : (
      texto
    ),
  );
}

export function RetoProyecto() {
  const [borrador, setBorrador] = useState(inicial);
  const [busqueda, setBusqueda] = useState("");
  const [aviso, setAviso] = useState("");
  const [resultado, setResultado] = useState<RunResult | null>(null);
  const [pendiente, setPendiente] = useState(false);
  const [destino, setDestino] = useState<{ ruta: string; linea?: number }>();
  const editor = useRef<HTMLTextAreaElement>(null);
  const capa = useRef<HTMLPreElement>(null);
  const gutter = useRef<HTMLPreElement>(null);
  const { archivos, ruta, tema, tamano } = borrador;
  const codigo = archivos[ruta];

  useEffect(() => setBorrador(recuperar()), []);
  useEffect(() => {
    if (!destino || destino.ruta !== ruta || !editor.current) return;
    const campo = editor.current;
    const lineas = campo.value.split("\n");
    const linea = Math.min(destino.linea ?? 1, lineas.length);
    const inicio = lineas.slice(0, linea - 1).reduce((total, texto) => total + texto.length + 1, 0);
    campo.focus();
    campo.setSelectionRange(inicio, inicio + lineas[linea - 1].length);
    campo.scrollTop = (linea - 1) * tamano * 1.5;
    setDestino(undefined);
  }, [destino, ruta, tamano]);

  const guardar = (nuevo: Borrador) => {
    setBorrador(nuevo);
    try {
      localStorage.setItem(clave, JSON.stringify(nuevo));
      setAviso("Borrador guardado en este navegador.");
    } catch {
      setAviso("No se pudo guardar el borrador en este navegador.");
    }
  };

  const entregar = async () => {
    if (pendiente) return;
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
  const estilo = { fontSize: tamano, lineHeight: 1.5, tabSize: 2 };
  const textoEditor = "m-0 whitespace-pre font-mono tracking-normal p-3";
  const visibles = proyecto.archivos.filter(({ ruta }) =>
    ruta.toLowerCase().includes(busqueda.toLowerCase()),
  );
  const carpetas = [...new Set(visibles.map(({ ruta }) => ruta.slice(0, ruta.lastIndexOf("/"))))];

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/retos" className="underline">
        Volver a Retos
      </Link>
      <h1 className="mt-3 font-serif text-4xl">{proyecto.titulo}</h1>
      <p className="mt-3 max-w-3xl">
        La tienda cobra 3 € por envío local, que pasa a ser gratis desde 50 €. Un envío remoto
        cuesta 8 €. Un carrito vacío siempre cuesta 0 €. Completa la tarifa en <code>envio.js</code>{" "}
        y haz que <code>pedido.js</code> sume el envío al subtotal. Los archivos se enlazan con{" "}
        <code>require</code> y <code>module.exports</code>.
      </p>

      <section
        className="mt-6 grid min-w-0 gap-4 md:grid-cols-[12rem_minmax(0,1fr)]"
        aria-label="Editor del proyecto"
      >
        <aside className="min-w-0 border border-line p-3">
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

        <div className="min-w-0">
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
                value={tema}
                className="border border-line bg-paper p-2"
                onChange={(e) => guardar({ ...borrador, tema: e.target.value as Tema })}
              >
                {Object.keys(temas).map((opcion) => (
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
          <div
            className={`flex h-80 min-w-0 border border-line ${temas[tema].editor}`}
            style={estilo}
          >
            <pre
              key={ruta}
              ref={gutter}
              aria-hidden="true"
              className="m-0 shrink-0 overflow-hidden border-r border-current p-3 text-right font-mono"
            >
              {codigo
                .split("\n")
                .map((_, i) => i + 1)
                .join("\n") + "\n"}
            </pre>
            <div className="relative min-w-0 flex-1">
              <pre
                key={ruta}
                ref={capa}
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 overflow-hidden ${textoEditor}`}
              >
                {colorear(codigo, temas[tema])}
                {"\n"}
              </pre>
              <textarea
                key={ruta}
                ref={editor}
                aria-label={`Código de ${ruta}`}
                spellCheck={false}
                wrap="off"
                readOnly={pendiente}
                maxLength={maximoArchivoProyecto}
                value={codigo}
                className={`relative block size-full resize-none overflow-auto border-0 bg-transparent text-transparent caret-current ${textoEditor}`}
                style={{ caretColor: tema === "Claro" ? "#0f172a" : "#fff" }}
                onChange={(e) => {
                  guardar({ ...borrador, archivos: { ...archivos, [ruta]: e.target.value } });
                  setResultado(null);
                }}
                onScroll={(e) => {
                  if (capa.current) {
                    capa.current.scrollTop = e.currentTarget.scrollTop;
                    capa.current.scrollLeft = e.currentTarget.scrollLeft;
                  }
                  if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
                }}
                onKeyDown={(e) => {
                  if (!(e.ctrlKey || e.metaKey)) return;
                  if (e.key.toLowerCase() === "s") {
                    e.preventDefault();
                    guardar(borrador);
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void entregar();
                  }
                }}
              />
            </div>
          </div>
          <p className="mt-2 text-sm text-muted">
            Ctrl/⌘ + S guarda · Ctrl/⌘ + Intro ejecuta las pruebas.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button tone="primary" disabled={pendiente} onClick={() => void entregar()}>
              {pendiente ? "Ejecutando…" : "Entregar proyecto"}
            </Button>
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
            <div className="mt-4">
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
        </div>
      </section>
    </main>
  );
}
