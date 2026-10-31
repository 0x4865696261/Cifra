import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EntregaEditor, Corrida, type EntregaResultado } from "@/components/retos/entrega";
import { explicarVeredicto, defenderSolucion } from "@/lib/ai/retos";
import type { GuiaVeredicto, JuicioDefensa } from "@/lib/ai/retos-parse";
import { limitesEntrada } from "@/lib/ai/limits";
import { todasPasadas } from "@/lib/ejecucion/pruebas";
import type { RunResult } from "@/lib/ejecucion/tipos";
import { definicionPorId, instanciaReto } from "@/lib/retos/retos";
import { useProgreso } from "@/lib/retos/use-progreso";
import { semillaPorPersona } from "@/lib/retos/semilla";
import { umbralProfesional } from "@/lib/retos/progreso";
import type { InstanciaReto, SenalIntegridad } from "@/lib/retos/tipos";

/**
 * La pantalla de reto (0.4.C): enunciado con los datos de esta persona, editor, entrega y
 * veredicto del ejecutor. Tras la primera superación entra la defensa (0.4.D): la IA explica
 * el veredicto con `explicarVeredicto` y juzga la defensa con `defenderSolucion`; ninguna de
 * las dos puede cambiar el resultado, que ya salió de `todasPasadas`. Si no pasa, el puente
 * lleva el fallo al estudio (`/estudio`, pestaña «Estudia el fallo»).
 */

export const Route = createFileRoute("/retos/$id")({
  head: () => ({ meta: [{ title: "Reto — Cifra" }] }),
  component: RetoPage,
});

/** La llave con la que un fallo viaja a «Estudia el fallo»: la escribe esta página, la bebe `/estudio`. */
const CLAVE_FALLO_ESTUDIO = "cifra.fallo-estudio";

function RetoPage() {
  const { id } = Route.useParams();
  const definicion = definicionPorId(id);
  const navigate = useNavigate();

  // La instancia nace en el navegador: la semilla por persona vive en localStorage y el
  // servidor no debe inventarse ninguna.
  const [instancia, setInstancia] = useState<InstanciaReto | null>(null);
  const { progreso, cargado, superar, proponerRepaso } = useProgreso();

  useEffect(() => {
    if (definicion) setInstancia(instanciaReto(definicion, semillaPorPersona()));
  }, [definicion]);

  if (!definicion) {
    return (
      <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-pretty">
          Ese reto no está en la plataforma.{" "}
          <Link className="underline" to="/retos">
            Vuelve al tablero.
          </Link>
        </p>
      </main>
    );
  }

  if (!cargado || !instancia) {
    return (
      <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
        <p className="font-mono text-sm text-muted">Preparando tu variante del reto…</p>
      </main>
    );
  }

  return (
    <RetoViva
      instancia={instancia}
      estadoGuardado={progreso.retos[id]?.estado ?? "pendiente"}
      profesionalYa={progreso.profesionalDesbloqueado}
      onSuperar={superar}
      proponerRepaso={proponerRepaso}
      alEstudiarFallo={(codigo, mensaje) => {
        sessionStorage.setItem(
          CLAVE_FALLO_ESTUDIO,
          JSON.stringify({ code: codigo, errorMessage: mensaje, language: "javascript" }),
        );
        void navigate({ to: "/estudio" });
      }}
    />
  );
}

/**
 * La máquina del reto. La fase se deriva, no se apila:
 * - sin superación reciente → «resolver»;
 * - superación reciente con estado «pendiente» → «defensa»: toca defender (0.4.D);
 * - superación reciente y ya guardado → «hecho», sin volver a defensas ni marcas.
 */
function RetoViva({
  instancia,
  estadoGuardado,
  profesionalYa,
  onSuperar,
  proponerRepaso,
  alEstudiarFallo,
}: {
  instancia: InstanciaReto;
  estadoGuardado: "pendiente" | "superado" | "superado-sin-comprender";
  profesionalYa: boolean;
  onSuperar: (id: string, nivel: number, sinComprender: boolean) => boolean;
  proponerRepaso: (conceptos: string[]) => void;
  alEstudiarFallo: (codigo: string, mensaje: string) => void;
}) {
  const [entrega, setEntrega] = useState<EntregaResultado | null>(null);
  const [juiciosDefensa, setJuiciosDefensa] = useState<JuicioDefensa[] | null>(null);
  const [desbloqueo, setDesbloqueo] = useState(false);

  const superadoGuardado = estadoGuardado !== "pendiente";
  const fase: "resolver" | "defensa" | "hecho" =
    entrega?.superado && !superadoGuardado ? "defensa" : entrega?.superado ? "hecho" : "resolver";

  /** Cierra la defensa y guarda el estado — ya aprobado por las pruebas. */
  const cerrarDefensa = (defendido: boolean) => {
    const desbloqueado = onSuperar(instancia.id, instancia.nivel, !defendido);
    if (!defendido) proponerRepaso(instancia.conceptos);
    if (desbloqueado && !profesionalYa) setDesbloqueo(true);
  };

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
      <p className="font-mono text-sm text-copper">
        <Link to="/retos" className="underline">
          Retos
        </Link>{" "}
        · {tituloFamilia(instancia.familia)} · nivel {instancia.nivel} ·{" "}
        {entiquetaEstado(estadoGuardado)}
      </p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl">{instancia.titulo}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="min-w-0">
          <h2 className="font-serif text-2xl">El enunciado</h2>
          <ol className="mt-3 grid gap-2">
            {instancia.enunciado
              .split("\n")
              .filter((linea) => linea.trim().length > 0)
              .map((linea, indice) => (
                <li key={indice} className="text-pretty border-0">
                  {indice + 1}. {linea}
                </li>
              ))}
          </ol>
          <h3 className="mt-6 font-mono text-sm">Tu variante</h3>
          <pre className="mt-2 overflow-auto border border-line bg-paper p-3 font-mono text-sm leading-6 text-ink">
            {Object.entries(instancia.datos)
              .map(([nombre, valor]) => `${nombre} = ${valor}`)
              .join("\n")}
          </pre>
          <p className="mt-2 font-mono text-sm text-muted">
            Los datos salen de la semilla de este navegador: otra persona tiene otros y una
            solución copiada de fuera con su salida incluida no vale tal cual.
          </p>
          <div className="mt-6">
            <h3 className="font-mono text-sm">Conceptos por detrás</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {instancia.conceptos.map((concepto) => (
                <li key={concepto} className="border border-line px-2 py-1 font-mono text-xs">
                  {concepto}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="min-w-0">
          {fase === "defensa" && entrega && (
            <Defensa
              instancia={instancia}
              codigo={entrega.codigo}
              señales={entrega.señales}
              onCerrada={cerrarDefensa}
              onPlana={() => cerrarDefensa(false)}
            />
          )}

          <EntregaEditor
            key={instancia.id}
            codigoInicial={instancia.codigoDePartida}
            pruebas={instancia.pruebas}
            onVeredicto={(dada) => {
              setJuiciosDefensa(null);
              setEntrega(dada);
            }}
          />

          {entrega && !entrega.superado && (
            <div className="mt-8 border-t border-line pt-6">
              <ExplicarIA
                enunciado={instancia.enunciado}
                codigo={entrega.codigo}
                superado={entrega.superado}
                resultado={entrega.resultado}
                pruebas={instancia.pruebas}
              />
              {hayFalloEstudiable(entrega.resultado) && (
                <Button
                  className="mt-3"
                  tone="ghost"
                  onClick={() => alEstudiarFallo(entrega.codigo, mensajeDelFallo(entrega.resultado))}
                >
                  Estudiar este fallo →
                </Button>
              )}
            </div>
          )}

          {fase === "hecho" && entrega?.superado && (
            <section className="mt-8 border-t border-line pt-6">
              <h2 className="font-mono text-sm text-copper">
                {juiciosDefensa === null
                  ? "Superado antes: nada cambia en tu progreso"
                  : entrenarProgreso(estadoGuardado)}
              </h2>
              {juiciosDefensa && (
                <ul className="mt-3 grid gap-2">
                  {juiciosDefensa.map((juicio, indice) => (
                    <li key={indice} className="border border-line px-3 py-2 text-pretty">
                      <span className="mr-2">{juicio.entendido ? "✓" : "✗"}</span>
                      {juicio.comentario}
                    </li>
                  ))}
                </ul>
              )}
              {desbloqueo && (
                <p className="mt-4 text-pretty">
                  Has alcanzado el umbral del nivel {umbralProfesional}: el camino profesional
                  queda desbloqueado en Ajustes, con tu progreso intacto.
                </p>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */

/** La defensa (0.4.D): preguntas propias del reto, juicios del modelo, resultado sí guarda. */
function Defensa({
  instancia,
  codigo,
  señales,
  onCerrada,
  onPlana,
}: {
  instancia: InstanciaReto;
  codigo: string;
  señales: SenalIntegridad[];
  onCerrada: (defendido: boolean) => void;
  /** Sin modelo no hay juicio: en vez de esperar, queda con la marca de repaso. */
  onPlana: () => void;
}) {
  const preguntas = instancia.preguntasDefensa.slice(0, 2);
  const [respuestas, setRespuestas] = useState<string[]>(() => preguntas.map(() => ""));
  const [juicios, setJuicios] = useState<JuicioDefensa[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await defenderSolucion({
        data: {
          enunciado: instancia.enunciado.slice(0, limitesEntrada.mensaje),
          codigo: codigo.slice(0, limitesEntrada.codigo),
          preguntas: preguntas.map((pregunta) => pregunta.slice(0, 600)),
          respuestas: respuestas.map((respuesta) => respuesta.slice(0, 4000)),
          señales: señales.map((senal) => ({ tipo: senal.tipo, detalle: senal.detalle.slice(0, 300) })),
        },
      });
      if (respuesta.ok) {
        setJuicios(respuesta.juicios);
      } else {
        setError(respuesta.error);
      }
    } catch (errorRed) {
      setError(errorRed instanceof Error ? errorRed.message : "No ha salido la petición al modelo.");
    } finally {
      setCargando(false);
    }
  };

  const defendido = juicios ? juicios.every((juicio) => juicio.entendido) : null;

  return (
    <section className="mb-8 border border-copper p-4">
      <h2 className="font-serif text-2xl">Defiende tu solución</h2>
      <p className="mt-2 text-pretty">
        Las pruebas pasaron; el reto podría quedar superado ya, pero antes: explica en tus
        palabras tu propio código. Si no lo entiendes, queda «superado, con repaso», que no
        degrada nada cuando la defensa salga bien más tarde.
      </p>
      {señales.length > 0 && (
        <p className="mt-2 font-mono text-sm text-muted">
          Contexto del editor (solo consulta, nunca bloquea): {señales.length}{" "}
          {señales.length === 1 ? "señal" : "señales"} — {señales.map((senal) => senal.tipo).join(", ")}.
        </p>
      )}

      <div className="mt-4 grid gap-4">
        {preguntas.map((pregunta, indice) => (
          <label key={indice} className="flex flex-col gap-2">
            <span className="text-pretty">{pregunta}</span>
            <textarea
              value={respuestas[indice] ?? ""}
              onChange={(evento) =>
                setRespuestas(respuestas.map((dada, j) => (j === indice ? evento.target.value : dada)))
              }
              rows={4}
              disabled={juicios !== null || cargando}
              className="border border-line bg-paper p-3 font-mono text-sm leading-6"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {defendido === null && (
          <>
            <Button
              tone="primary"
              disabled={cargando || respuestas.some((respuesta) => respuesta.trim().length === 0)}
              onClick={() => void enviar()}
            >
              {cargando ? "Leyendo tus respuestas…" : "Enviar la defensa"}
            </Button>
            <Button tone="ghost" onClick={onPlana}>
              Guardar como superado, con repaso
            </Button>
          </>
        )}
        {defendido !== null && (
          <Button tone="primary" onClick={() => onCerrada(defendido)}>
            Cerrar el reto
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-3 border-l border-copper pl-4 text-pretty">
          {error} — puedes reintentar la defensa o guardar el reto con la marca de repaso.
        </p>
      )}

      {juicios && (
        <div className="mt-4">
          <p className="font-mono text-sm">
            {defendido ? "Defensa superada: queda registrado como superado." : "Defensa sin comprensión: queda «superado, con repaso»."}
          </p>
          <ul className="mt-2 grid gap-2">
            {juicios.map((juicio, indice) => (
              <li key={indice} className="border border-line px-3 py-2 text-pretty">
                <span className="mr-2">{juicio.entendido ? "✓" : "✗"}</span>
                {juicio.comentario}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** La explicación del veredicto (0.4.C, paso 4): la IA lee el resultado real y lo explica. */
function ExplicarIA({
  enunciado,
  codigo,
  superado,
  resultado,
  pruebas,
}: {
  enunciado: string;
  codigo: string;
  superado: boolean;
  resultado: RunResult;
  pruebas: { id: string; nombre: string }[];
}) {
  const [guia, setGuia] = useState<GuiaVeredicto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nombreDe = new Map(pruebas.map((prueba) => [prueba.id, prueba.nombre]));

  const pedir = async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await explicarVeredicto({
        data: {
          enunciado: enunciado.slice(0, limitesEntrada.mensaje),
          codigo: codigo.slice(0, limitesEntrada.codigo),
          paso: superado,
          pruebas: (resultado.pruebas ?? []).map((prueba) => ({
            id: prueba.id,
            nombre: nombreDe.get(prueba.id) ?? prueba.id,
            pasada: prueba.pasada,
            obtenido: prueba.obtenido === undefined ? undefined : aTexto(prueba.obtenido).slice(0, 400),
            error: prueba.error?.slice(0, 600),
          })),
          señales: [],
        },
      });
      if (respuesta.ok) setGuia(respuesta.guia);
      else setError(respuesta.error);
    } catch (errorRed) {
      setError(errorRed instanceof Error ? errorRed.message : "No ha salido la petición al modelo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      {!guia && (
        <Button tone="ghost" disabled={cargando} onClick={() => void pedir()}>
          {cargando ? "Pidiendo la explicación…" : "Que la IA lo explique"}
        </Button>
      )}
      {error && <p className="mt-3 border-l border-copper pl-4 text-pretty">{error}</p>}
      {guia && (
        <div>
          <h3 className="font-mono text-sm text-copper">La lectura de la IA, sobre el veredicto real</h3>
          <p className="mt-2 text-pretty">{guia.resumen}</p>
          <ul className="mt-3 grid gap-2">
            {guia.constata.map((comentario, indice) => (
              <li key={indice} className="border border-line px-3 py-2 text-pretty">
                <span
                  className={
                    comentario.procedencia === "prueba"
                      ? "mr-2 inline-block border border-copper px-1 font-mono text-xs text-copper"
                      : "mr-2 inline-block border border-line px-1 font-mono text-xs text-muted"
                  }
                >
                  {comentario.procedencia === "prueba" ? "prueba" : "opinión"}
                </span>
                {comentario.texto}
              </li>
            ))}
          </ul>
          {guia.siNoPasa.length > 0 && (
            <p className="mt-3 text-pretty">
              Por dónde empezar: <em>{guia.siNoPasa}</em>
            </p>
          )}
          <p className="mt-3 font-mono text-sm text-muted">
            Este texto explica lo que la ejecución ya dijo. El veredicto —{" "}
            {superado ? "todas las pruebas pasaron" : "no pasó"} — no salió de aquí y no puede ser
            cambiado por la IA.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function tituloFamilia(familia: string): string {
  const tabla: Record<string, string> = {
    bucles: "Bucles",
    condicionales: "Condicionales",
    funciones: "Funciones",
    colecciones: "Colecciones",
    cadenas: "Cadenas",
  };
  return tabla[familia] ?? familia;
}

function entiquetaEstado(estado: "pendiente" | "superado" | "superado-sin-comprender"): string {
  if (estado === "superado") return "ya superado antes";
  if (estado === "superado-sin-comprender") return "ya superado, con repaso";
  return "pendiente";
}

function entrenarProgreso(estado: "pendiente" | "superado" | "superado-sin-comprender"): string {
  if (estado === "superado") return "Guardado: superado, con la defensa bien explicada.";
  if (estado === "superado-sin-comprender") return "Guardado: «superado, con repaso»; el repaso está en tu biblioteca de conceptos.";
  return "Sin cambio guardado todavía.";
}

function hayFalloEstudiable(resultado: RunResult): boolean {
  const mensaje = mensajeDelFallo(resultado);
  return mensaje.length > 0 && mensaje.length <= limitesEntrada.mensaje;
}

function mensajeDelFallo(resultado: RunResult): string {
  if (resultado.stderr.trim().length > 0) return resultado.stderr.trim();
  // Sin error del motor, el fallo está en una prueba caída: se lo cuento para el estudio.
  const caida = (resultado.pruebas ?? []).find((prueba) => !prueba.pasada);
  if (!caida) return "";
  return `La prueba ${caida.id} no pasó: salió ${aTexto(caida.obtenido)} y la prueba pedía ${aTexto(caida.esperado)}.`;
}

function aTexto(valor: unknown): string {
  const texto = typeof valor === "string" ? valor : JSON.stringify(valor);
  const limpio = texto ?? "n/d";
  return limpio.length > 200 ? `${limpio.slice(0, 200)}…` : limpio;
}
