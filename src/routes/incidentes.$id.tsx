import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { limitesEntrada } from "@/lib/ai/limits";
import { redactarComparacion } from "@/lib/ai/incidentes";
import type { RedaccionComparacion } from "@/lib/ai/incidentes-parse";
import { getConcept } from "@/lib/content/concepts";
import { evaluar } from "@/lib/incidentes/evaluar";
import { definicionIncidentePorId } from "@/lib/incidentes/paquetes";
import { useIncidentesProgreso } from "@/lib/incidentes/use-progreso";
import { useProgreso } from "@/lib/retos/use-progreso";
import { umbralProfesional } from "@/lib/retos/progreso";
import type {
  DefinicionIncidente,
  AnalizoIncidente,
  EvaluacionIncidente,
} from "@/lib/incidentes/tipos";
import type { ResumenEvaluacion } from "@/lib/incidentes/progreso";
import { TerminalViva } from "@/components/incidentes/terminal";

/**
 * La pantalla de incidente (0.5.C): el síntoma con el que se llega, la terminal simulada de
 * solo lectura y el análisis con campos fijos. Al entregar, la comparación `comprobado-regla`
 * marca campo por campo, y la IA (opcional) redacta lo marcado sin poder cambiarlo. Sin plan
 * profesional activo, la pantalla explica cómo se abre el camino y no abre nada más.
 */

export const Route = createFileRoute("/incidentes/$id")({
  head: () => ({ meta: [{ title: "Incidente — Cifra" }] }),
  component: IncidentePage,
});

function IncidentePage() {
  const { id } = Route.useParams();
  const paquete = definicionIncidentePorId(id);
  const { progresoIncidentes, cargado, abrir } = useIncidentesProgreso();
  const { progreso } = useProgreso();

  useEffect(() => {
    if (paquete && cargado) abrir(paquete.id, paquete.nivel);
  }, [paquete, cargado, abrir]);

  if (!paquete) {
    return (
      <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-pretty">
          Ese paquete no está en la plataforma.{" "}
          <Link className="underline" to="/incidentes">
            Vuelve al tablero.
          </Link>
        </p>
      </main>
    );
  }

  if (!cargado) {
    return (
      <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
        <p className="font-mono text-sm text-muted">Preparando el paquete…</p>
      </main>
    );
  }

  const profesional = progreso.plan === "profesional";
  const estadoGuardado = progresoIncidentes.paquetes[paquete.id]?.estado ?? "nuevo";

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
      <p className="font-mono text-sm text-copper">
        <Link to="/incidentes" className="underline">
          Incidentes
        </Link>{" "}
        · nivel {paquete.nivel} ·{" "}
        {estadoGuardado === "entregado"
          ? "análisis entregado (puedes entregar de nuevo)"
          : estadoGuardado === "abierto"
            ? "abierto, sin entrega"
            : "nuevo"}
      </p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl">{paquete.titulo}</h1>

      {!profesional ? <PuertaProfesional /> : <IncidenteVivo paquete={paquete} />}
    </main>
  );
}

/** La puerta del profesional (hereda de 0.4): explica y enlaza; sin botones vacíos. */
function PuertaProfesional() {
  return (
    <div className="mt-8 max-w-2xl border border-copper p-4 text-pretty">
      <h2 className="font-serif text-xl">Este paquete pide el camino profesional</h2>
      <p className="mt-2">
        Los incidentes son del plan profesional. Se abre con la prueba de nivel de Retos o superando
        un reto de nivel {umbralProfesional}; con el camino alcanzado, actívalo en Ajustes y vuelve:
        el paquete sigue donde lo dejaste (0.5.H) y tu progreso de retos no cambia en nada.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to="/retos"
          className="tap inline-flex min-h-11 items-center border border-line bg-paper px-4 font-mono text-sm"
        >
          Ir a Retos →
        </Link>
        <Link
          to="/ajustes"
          className="tap inline-flex min-h-11 items-center border border-line bg-paper px-4 font-mono text-sm"
        >
          Ir a Ajustes →
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function IncidenteVivo({ paquete }: { paquete: DefinicionIncidente }) {
  const { entregar } = useIncidentesProgreso();
  const [juicio, setJuicio] = useState<EvaluacionIncidente | null>(null);
  const [analizo, setAnalizo] = useState<AnalizoIncidente | null>(null);

  const entregarAnalizo = (dado: AnalizoIncidente) => {
    const comparado = evaluar(paquete, dado);
    setJuicio(comparado);
    setAnalizo(dado);
    entregar(
      paquete.id,
      paquete.nivel,
      resumenDe(comparado, paquete.respuestaEsperada.evidencia.length),
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <section className="mt-8">
        <h2 className="font-serif text-2xl">El síntoma</h2>
        <p className="mt-3 max-w-3xl border-l border-copper pl-5 text-lg text-pretty">
          {paquete.sintoma}
        </p>
        <p className="mt-3 max-w-3xl font-mono text-sm text-muted">
          Familia del fallo: {paquete.notaFamilia}
        </p>
        {paquete.conceptos.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Conceptos de la biblioteca">
            {paquete.conceptos.map((concepto) => (
              <li key={concepto}>
                <Link
                  to="/biblioteca/$slug"
                  params={{ slug: concepto }}
                  className="tap inline-flex min-h-9 border border-line px-3 py-1 font-mono text-xs"
                >
                  {getConcept(concepto)?.title ?? concepto}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">La terminal simulada</h2>
        <p className="mt-2 max-w-3xl text-pretty">
          De solo lectura: mira, filtra y compara. Nada se ejecuta fuera del paquete, y nada toca un
          sistema real. Todo lo que corras queda en el historial de abajo.
        </p>
        <div className="mt-4">
          <TerminalViva ficheros={paquete.ficheros} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Tu análisis</h2>
        <p className="mt-2 max-w-3xl text-pretty">
          Los campos son los de un informe real: qué pasó, con qué evidencia, con qué impacto, cómo
          se corrige y cómo se habría detectado antes. La cita lleva fichero y, si quieres, línea,
          con dos de tolerancia. En este camino puedes usar la IA que quieras, como en el trabajo:
          lo que se evalúa es la calidad del análisis, no que no hayas tenido ayuda.
        </p>
      </section>

      {juicio && analizo && (
        <section className="mt-8 border border-copper p-4" aria-live="polite">
          <h3 className="font-serif text-xl">La comparación, campo por campo</h3>
          <p className="mt-2 font-mono text-sm text-muted">
            Cada marca sale de una regla local que puedes volver a correr{" "}
            <span className="mx-1 border border-line px-1">comprobado-regla</span>. La IA (si la
            pides) solo redacta esto último: no puede cambiar una marca.
          </p>
          <ul className="mt-4 grid gap-2">
            {(
              [
                ["causa", "Qué pasó"],
                ["impacto", "Impacto"],
                ["correccion", "Corrección"],
                ["comoDetectarlo", "Cómo detectarlo antes"],
              ] as const
            ).map(([campo, titulo]) => (
              <li key={campo} className="border border-line px-3 py-2">
                <span className="font-mono text-sm">{titulo}: </span>
                <span
                  className={
                    "inline-block border px-1 font-mono text-xs " + bordeCampo(juicio.campos[campo])
                  }
                >
                  {etiquetaCampo(juicio.campos[campo])}
                </span>
              </li>
            ))}
          </ul>
          <h4 className="mt-4 font-mono text-sm">Tu evidencia</h4>
          <ul className="mt-2 grid gap-2">
            {juicio.evidencia.map((cuerpo, indice) => (
              <li key={indice} className="border border-line px-3 py-2 text-pretty">
                <span
                  className={
                    "mr-2 inline-block border px-1 font-mono text-xs " + bordeCita(cuerpo.estado)
                  }
                >
                  {etiquetaCita(cuerpo.estado)}
                </span>
                <span className="font-mono text-sm">
                  {cuerpo.cita.ruta}
                  {cuerpo.cita.linea === undefined ? "" : ` línea ${cuerpo.cita.linea}`}:
                </span>{" "}
                {cuerpo.detalle}
              </li>
            ))}
            {juicio.evidencia.length === 0 && (
              <li className="font-mono text-sm text-muted">
                Sin citas: nada queda marcado como sostenido, así que ningún campo puede quedar
                «acertado».
              </li>
            )}
          </ul>
          {juicio.pasadoPorAlto.length > 0 && (
            <p className="mt-4 text-pretty">
              <strong>Pasado por alto:</strong> la evidencia del paquete que ninguna cita sostenida
              cubrió — <span className="font-mono">{juicio.pasadoPorAlto.join(" · ")}</span>.
            </p>
          )}
          <RedaccionIA
            evaluacion={juicio}
            analizo={analizo}
            titulo={paquete.titulo}
            sintoma={paquete.sintoma}
          />
        </section>
      )}

      <div className="mt-2">
        <AnalizoForm paquete={paquete} onEntregar={entregarAnalizo} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

/** El análisis con campos fijos (0.5.C): textos y citas. La entrega llama a `evaluar`. */
function AnalizoForm({
  paquete,
  onEntregar,
}: {
  paquete: DefinicionIncidente;
  onEntregar: (analizo: AnalizoIncidente) => void;
}) {
  const [quePaso, setQuePaso] = useState("");
  const [impacto, setImpacto] = useState("");
  const [correccion, setCorreccion] = useState("");
  const [comoDetectarlo, setComoDetectarlo] = useState("");
  const [citas, setCitas] = useState<Array<{ ruta: string; linea: string; afirmacion: string }>>([
    { ruta: "", linea: "", afirmacion: "" },
  ]);

  const citaValidas = citas.filter(
    (cita) => cita.ruta.trim().length > 0 && cita.afirmacion.trim().length > 0,
  );
  const completo =
    quePaso.trim().length > 0 &&
    impacto.trim().length > 0 &&
    correccion.trim().length > 0 &&
    comoDetectarlo.trim().length > 0 &&
    citaValidas.length > 0 &&
    citaValidas.every((cita) => cita.linea.trim().length === 0 || /^\d+$/.test(cita.linea.trim()));

  const entregar = () => {
    const analizo: AnalizoIncidente = {
      idPaquete: paquete.id,
      quePaso,
      evidencia: citaValidas.map((cita) => ({
        ruta: cita.ruta.trim(),
        ...(cita.linea.trim().length > 0 ? { linea: Number(cita.linea.trim()) } : {}),
        afirmacion: cita.afirmacion.trim(),
      })),
      impacto,
      correccion,
      comoDetectarlo,
    };
    onEntregar(analizo);
  };

  const textAria = "w-full min-h-11 border border-line bg-paper p-3 text-pretty text-sm leading-6";
  const textMono =
    "w-full min-w-0 min-h-11 border border-line bg-paper px-3 font-mono text-sm leading-6";

  return (
    <section className="border border-line bg-paper p-4 sm:p-5">
      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="font-mono text-sm">Qué pasó</span>
          <textarea
            value={quePaso}
            onChange={(evento) => setQuePaso(evento.target.value)}
            rows={3}
            className={textAria}
            placeholder="La causa, contada con tus palabras."
          />
        </label>

        <fieldset className="grid gap-3" aria-label="Evidencia citada">
          <legend className="font-mono text-sm">Evidencia (fichero y lo que dice ahí)</legend>
          {citas.map((cita, indice) => (
            <div key={indice} className="grid gap-2 border border-line p-3">
              <label className="grid gap-1 sm:grid-cols-[1fr_10rem] sm:items-end">
                <span className="grid gap-1">
                  <span className="font-mono text-xs text-muted">Ruta</span>
                  <input
                    value={cita.ruta}
                    onChange={(evento) =>
                      setCitas(
                        citas.map((cada, j) =>
                          j === indice ? { ...cada, ruta: evento.target.value } : cada,
                        ),
                      )
                    }
                    placeholder="logs/app.log"
                    spellCheck={false}
                    autoComplete="off"
                    className={textMono}
                  />
                </span>
                <span className="grid gap-1">
                  <span className="font-mono text-xs text-muted">
                    Línea (vacía: el fichero entero)
                  </span>
                  <input
                    value={cita.linea}
                    onChange={(evento) =>
                      setCitas(
                        citas.map((cada, j) =>
                          j === indice ? { ...cada, linea: evento.target.value } : cada,
                        ),
                      )
                    }
                    inputMode="numeric"
                    autoComplete="off"
                    className={textMono}
                  />
                </span>
              </label>
              <label className="grid gap-1">
                <span className="font-mono text-xs text-muted">Qué dice ahí</span>
                <textarea
                  value={cita.afirmacion}
                  onChange={(evento) =>
                    setCitas(
                      citas.map((cada, j) =>
                        j === indice ? { ...cada, afirmacion: evento.target.value } : cada,
                      ),
                    )
                  }
                  rows={2}
                  className={textAria}
                  placeholder="Copia el texto de la línea o cuéntalo con sus palabras: la comparación lo busca en el fichero."
                />
              </label>
              {citas.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCitas(citas.filter((_, j) => j !== indice))}
                  className="tap min-h-11 justify-self-start border border-line px-3 font-mono text-sm"
                >
                  Quitar esta cita
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setCitas([...citas, { ruta: "", linea: "", afirmacion: "" }])}
            className="tap min-h-11 justify-self-start border border-line px-3 font-mono text-sm"
          >
            Añadir otra cita
          </button>
        </fieldset>

        <label className="grid gap-2">
          <span className="font-mono text-sm">Impacto</span>
          <textarea
            value={impacto}
            onChange={(evento) => setImpacto(evento.target.value)}
            rows={2}
            className={textAria}
          />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-sm">Corrección</span>
          <textarea
            value={correccion}
            onChange={(evento) => setCorreccion(evento.target.value)}
            rows={2}
            className={textAria}
          />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-sm">Cómo se habría detectado antes</span>
          <textarea
            value={comoDetectarlo}
            onChange={(evento) => setComoDetectarlo(evento.target.value)}
            rows={2}
            className={textAria}
          />
        </label>
      </div>

      <p className="mt-4 font-mono text-sm text-muted">
        La entrega no pide al modelo: la comparación es local y sale en claro al momento.
      </p>
      <button
        type="button"
        disabled={!completo}
        onClick={entregar}
        className="tap mt-3 min-h-11 border border-line bg-ink px-4 font-mono text-sm text-paper disabled:opacity-50"
      >
        Entregar el análisis
      </button>
      <p className="mt-2 font-mono text-xs text-muted">
        Para entregar hacen falta los cuatro textos y al menos una cita con ruta. Los textos van
        acotados a {limitesEntrada.mensaje.toLocaleString("es")} caracteres, como en el estudio.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** La redacción del modelo (0.5.E), opcional: llega solo la comparación, nunca la respuesta. */
function RedaccionIA({
  evaluacion,
  analizo,
  titulo,
  sintoma,
}: {
  evaluacion: EvaluacionIncidente;
  analizo: AnalizoIncidente;
  titulo: string;
  sintoma: string;
}) {
  const [redaccion, setRedaccion] = useState<RedaccionComparacion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pedir = async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await redactarComparacion({
        data: {
          titulo: titulo.slice(0, 300),
          sintoma: sintoma.slice(0, 2000),
          analizo: {
            quePaso: analizo.quePaso.slice(0, limitesEntrada.mensaje),
            impacto: analizo.impacto.slice(0, limitesEntrada.mensaje),
            correccion: analizo.correccion.slice(0, limitesEntrada.mensaje),
            comoDetectarlo: analizo.comoDetectarlo.slice(0, limitesEntrada.mensaje),
          },
          evaluacion: {
            campos: Object.fromEntries(
              Object.entries(evaluacion.campos).map(([nombre, estado]) => [nombre, { estado }]),
            ) as Record<
              "causa" | "impacto" | "correccion" | "comoDetectarlo",
              { estado: EvaluacionIncidente["campos"]["causa"] }
            >,
            evidencia: evaluacion.evidencia.slice(0, 12).map((cuerpo) => ({
              cita: {
                ruta: cuerpo.cita.ruta.slice(0, 300),
                ...(cuerpo.cita.linea === undefined ? {} : { linea: cuerpo.cita.linea }),
                afirmacion: cuerpo.cita.afirmacion.slice(0, 2000),
              },
              estado: cuerpo.estado,
              detalle: cuerpo.detalle.slice(0, 600),
            })),
            pasadoPorAlto: evaluacion.pasadoPorAlto.slice(0, 12),
          },
        },
      });
      if (respuesta.ok) setRedaccion(respuesta.redaccion);
      else setError(respuesta.error);
    } catch (errorRed) {
      setError(
        errorRed instanceof Error ? errorRed.message : "No ha salido la petición al modelo.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mt-4 border-t border-line pt-4">
      {!redaccion && (
        <button
          type="button"
          disabled={cargando}
          onClick={() => void pedir()}
          className="tap min-h-11 border border-line bg-paper px-4 font-mono text-sm"
        >
          {cargando ? "Redactando…" : "Que la IA lo redacte"}
        </button>
      )}
      {error && <p className="mt-3 border-l border-copper pl-4 text-pretty">{error}</p>}
      {redaccion && (
        <div>
          <h4 className="font-mono text-sm text-copper">
            La lectura de la IA, sobre la comparación
          </h4>
          {redaccion.parrafos.map((parrafo, indice) => (
            <p key={indice} className="mt-2 text-pretty">
              <span
                className={
                  parrafo.procedencia === "comprobado-regla"
                    ? "mr-2 inline-block border border-copper px-1 font-mono text-xs text-copper"
                    : "mr-2 inline-block border border-line px-1 font-mono text-xs text-muted"
                }
              >
                {parrafo.procedencia === "comprobado-regla" ? "comprobado-regla" : "opinión"}
              </span>
              {parrafo.texto}
            </p>
          ))}
          <p className="mt-3 font-mono text-sm text-muted">
            La comparación quedó decidida antes de que existiera este texto; el modelo la cuenta, no
            la cambia, y la respuesta esperada del paquete no sale de Cifra.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function resumenDe(juicio: EvaluacionIncidente, puntosTotales: number): ResumenEvaluacion {
  const estados = Object.values(juicio.campos);
  return {
    acertados: estados.filter((estado) => estado === "acertado").length,
    deducidos: estados.filter((estado) => estado === "deducido-sin-evidencia").length,
    altos: estados.filter((estado) => estado === "pasado-por-alto").length,
    sostenidas: juicio.evidencia.filter((cuerpo) => cuerpo.estado === "sostenida").length,
    citas: juicio.evidencia.length,
    puntosAlto: juicio.pasadoPorAlto.length,
    puntosTotales,
  };
}

function etiquetaCampo(estado: EvaluacionIncidente["campos"]["causa"]): string {
  if (estado === "acertado") return "acertado";
  if (estado === "deducido-sin-evidencia") return "deducido sin evidencia";
  return "pasado por alto";
}

function bordeCampo(estado: EvaluacionIncidente["campos"]["causa"]): string {
  if (estado === "acertado") return "border-copper text-copper";
  if (estado === "deducido-sin-evidencia") return "border-line text-muted";
  return "border-ink text-ink";
}

function etiquetaCita(estado: EvaluacionIncidente["evidencia"][number]["estado"]): string {
  if (estado === "sostenida") return "sostenida";
  if (estado === "no-existe") return "no existe en el paquete";
  return "no sostiene";
}

function bordeCita(estado: EvaluacionIncidente["evidencia"][number]["estado"]): string {
  if (estado === "sostenida") return "border-copper text-copper";
  if (estado === "no-existe") return "border-ink text-ink";
  return "border-line text-muted";
}
