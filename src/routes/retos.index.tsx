import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { EntregaEditor, type EntregaResultado } from "@/components/retos/entrega";
import { nivelEstimadoDePrueba, siguienteTramo, tramosDePrueba } from "@/lib/retos/prueba-nivel";
import { umbralProfesional } from "@/lib/retos/progreso";
import { definiciones, familias } from "@/lib/retos/retos";
import { notasFamilias } from "@/lib/retos/contenido/utiles";
import { useProgreso } from "@/lib/retos/use-progreso";
import type { Plan } from "@/lib/retos/tipos";
import type { TestSpec } from "@/lib/ejecucion/tipos";

/**
 * Entrada de la 0.4.A: los dos caminos. Aquí se elige el plan, se toma la prueba de nivel
 * (ocho tramos que colocan al que ya tiene experiencia) y se lista el resto de retos con el
 * progreso de este navegador. La pantalla de reto vive en `/retos/$id`.
 */

export const Route = createFileRoute("/retos/")({
  head: () => ({ meta: [{ title: "Retos — Cifra" }] }),
  component: RetosPage,
});

type Vista = { tipo: "cargar" } | { tipo: "elegir" } | { tipo: "prueba" } | { tipo: "lista" };

function RetosPage() {
  const { progreso, cargado, elegirPlan } = useProgreso();
  const [vista, setVista] = useState<Vista>({ tipo: "cargar" });

  useEffect(() => {
    if (!cargado) return;
    if (progreso.plan === null) {
      setVista({ tipo: "elegir" });
    } else {
      setVista({ tipo: "lista" });
    }
  }, [cargado, progreso.plan]);

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
      <p className="font-mono text-sm text-copper">Retos</p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl">
        Fundamentos con veredicto real: pruebas que corren en tu navegador.
      </h1>
      <p className="mt-4 max-w-2xl text-pretty">
        El veredicto de cada reto sale de la ejecución contra sus pruebas fijas, de este
        navegador. La IA lo explica y pregunta en la defensa, pero no decide nada. El progreso
        vive solo aquí y se puede exportar desde Ajustes.
      </p>

      {vista.tipo === "cargar" && (
        <p className="mt-10 font-mono text-sm text-muted">Leyendo tu progreso de este navegador…</p>
      )}

      {vista.tipo === "elegir" && (
        <ElegirCamino
          onElegir={(plan: Plan) => {
            if (plan === "desde-cero") {
              elegirPlan("desde-cero");
              setVista({ tipo: "lista" });
            } else {
              // El profesional no se elige sin haberse desbloqueado: se gana con la prueba.
              setVista(progreso.profesionalDesbloqueado ? { tipo: "lista" } : { tipo: "prueba" });
            }
          }}
        />
      )}

      {vista.tipo === "prueba" && (
        <PruebaDeNivel
          onTerminar={() => setVista({ tipo: "lista" })}
          onElegirOtro={() => setVista({ tipo: "elegir" })}
        />
      )}

      {vista.tipo === "lista" && (
        <>
          <Resumen camino={progreso.plan} />
          <ListaRetos />
          {!progreso.profesionalDesbloqueado && (
            <div className="mt-10 flex flex-wrap gap-2">
              <Button tone="ghost" onClick={() => setVista({ tipo: "prueba" })}>
                Tomar la prueba de nivel
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function ElegirCamino({ onElegir }: { onElegir: (plan: Plan) => void }) {
  return (
    <section className="mt-8 max-w-3xl">
      <h2 className="font-serif text-2xl">¿Cómo empiezas?</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onElegir("desde-cero")}
          className="tap grid gap-2 border border-line bg-paper p-5 text-left"
        >
          <span className="font-serif text-xl">Desde cero</span>
          <span className="text-pretty text-muted">
            Empieza por los retos de nivel 2, con la biblioteca al lado, y sube a tu ritmo.
          </span>
        </button>
        <button
          type="button"
          onClick={() => onElegir("profesional")}
          className="tap grid gap-2 border border-line bg-paper p-5 text-left"
        >
          <span className="font-serif text-xl">Ya tengo experiencia</span>
          <span className="text-pretty text-muted">
            Toma la prueba de nivel: {tramosDePrueba.length} tramos breves, de fácil a difícil, sin
            variantes. Tu nivel es lo que consigas en serie.
          </span>
        </button>
      </div>
      <p className="mt-3 font-mono text-sm text-muted">
        El camino se puede cambiar después (Ajustes) y nunca borra el progreso. El plan
        profesional también se desbloquea después superando un reto de nivel {umbralProfesional}
        o más.
      </p>
    </section>
  );
}

function Resumen({ camino }: { camino: Plan | null }) {
  const { progreso, cargado } = useProgreso();
  if (!cargado) return null;
  const superados = definiciones.filter(
    (reto) => progreso.retos[reto.id]?.estado === "superado",
  ).length;
  const sinComprender = definiciones.filter(
    (reto) => progreso.retos[reto.id]?.estado === "superado-sin-comprender",
  ).length;
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border border-line px-4 py-3 font-mono text-sm">
      <span>Camino: {camino === "profesional" ? "profesional" : "desde cero"}</span>
      <span>
        Superados: {superados}/{definiciones.length}
        {sinComprender > 0 ? ` · con repaso pendiente: ${sinComprender}` : ""}
      </span>
      {progreso.profesionalDesbloqueado && <span className="text-copper">profesional desbloqueado</span>}
      {!progreso.profesionalDesbloqueado && (
        <span className="text-muted">
          profesional al superar un reto de nivel {umbralProfesional} o más
        </span>
      )}
    </div>
  );
}

function ListaRetos() {
  const { progreso, cargado } = useProgreso();
  if (!cargado) return null;
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl">El tablero</h2>
      <p className="mt-2 max-w-2xl text-pretty">
        {definiciones.length} retos en {familias.length} familias, a niveles 2, 5 y 8. Los datos
        cambian con la semilla de este navegador: una solución copiada de otro sitio no vale tal
        cual, y tras superar un reto la defensa pregunta cómo lo hiciste.
      </p>
      <div className="mt-6 grid gap-8">
        {familias.map((familia) => (
          <section key={familia}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-serif text-xl">{tituloFamilia(familia)}</h3>
              <p className="font-mono text-sm text-muted">{notasFamilias[familia]}</p>
            </div>
            <ul className="mt-3 divide-line divide-y border border-line">
              {definiciones
                .filter((reto) => reto.familia === familia)
                .map((reto) => {
                  const estado = progreso.retos[reto.id]?.estado ?? "pendiente";
                  return (
                    <li key={reto.id}>
                      <Link
                        to="/retos/$id"
                        params={{ id: reto.id }}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <span className="min-w-0">
                          <span className="font-serif text-lg">{reto.titulo}</span>
                          <span className="ml-3 font-mono text-sm text-muted">nivel {reto.nivel}</span>
                        </span>
                        <span className={cn("font-mono text-sm", colorEstado(estado))}>{etiqueta(estado)}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

/** La prueba de nivel (0.4.A): tramos en orden, con colocación consecutiva desde el primero. */
function PruebaDeNivel({ onTerminar, onElegirOtro }: { onTerminar: () => void; onElegirOtro: () => void }) {
  const { progreso, cargado, registrarPruebaNivel, elegirPlan } = useProgreso();
  const [resueltos, setResueltos] = useState<string[] | null>(null);
  const [parada, setParada] = useState(false);

  const listos = resueltos ?? progreso.pruebaNivel?.resueltos ?? [];
  const nivelEstimado = nivelEstimadoDePrueba(listos);
  const tramo = siguienteTramo(listos);

  if (!cargado) {
    return <p className="mt-10 font-mono text-sm text-muted">Cargando…</p>;
  }

  const terminar = (listas: string[]) => {
    const nivel = nivelEstimadoDePrueba(listas);
    registrarPruebaNivel(listas, nivel);
    // Con el umbral alcanzado, el camino profesional queda fijado para la próxima visita.
    if (nivel >= umbralProfesional && progreso.plan === null) {
      elegirPlan("profesional");
    }
  };

  const aPasar = (tramoId: string, superado: boolean) => {
    if (superado) {
      const siguientes = [...listos, tramoId];
      setResueltos(siguientes);
      setParada(false);
      terminar(siguientes);
    } else {
      setParada(true);
      terminar(listos);
    }
  };

  if (parada || !tramo) {
    const finalizado = !tramo && !parada && listos.length === tramosDePrueba.length;
    return (
      <section className="mt-8 max-w-2xl">
        <h2 className="font-serif text-2xl">{finalizado ? "Prueba terminada" : "Aquí te coloca la prueba"}</h2>
        <p className="mt-2 text-pretty">
          Nivel estimado: <strong>{nivelEstimado}</strong> de {tramosDePrueba.length}.
        </p>
        <p className="mt-2 text-pretty text-muted">
          {nivelEstimado >= umbralProfesional
            ? `Alcanzas el umbral (${umbralProfesional} de 10): el plan profesional queda desbloqueado y con tu progreso intacto.`
            : `El umbral profesional es el nivel ${umbralProfesional}. Sigues en el camino desde cero con tus retos: superar un reto de nivel ${umbralProfesional} o más también desbloquea el profesional.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button tone="primary" onClick={onTerminar}>
            Ir a los retos
          </Button>
          <Button
            tone="ghost"
            onClick={() => {
              setResueltos([]);
              setParada(false);
              terminar([]);
            }}
          >
            Repetir la prueba
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl">Tramo {tramo.numero} de {tramosDePrueba.length}: {tramo.titulo}</h2>
        <p className="font-mono text-sm text-muted">consecutivos: {nivelEstimado}</p>
      </div>
      <ol className="mt-3 flex flex-wrap gap-1" aria-label="Tramos, en orden de dificultad">
        {tramosDePrueba.map((cada) => (
          <li
            key={cada.id}
            aria-current={cada.id === tramo.id ? "step" : undefined}
            className={cn(
              "border px-2 py-1 font-mono text-xs",
              listos.includes(cada.id)
                ? "border-copper text-copper"
                : cada.id === tramo.id
                  ? "border-ink"
                  : "border-line text-muted",
            )}
          >
            {cada.numero}
          </li>
        ))}
      </ol>
      <div className="mt-6 max-w-3xl">
        <p className="text-pretty">{tramo.enunciado}</p>
        <p className="mt-2 font-mono text-sm text-muted">
          Si fallas, la prueba para y te coloca. También puedes dejarla: el nivel queda guardado
          con lo que ya tengas en serie.
        </p>
        <EntregaEditor
          key={tramo.id}
          codigoInicial={tramo.codigoDePartida}
          pruebas={tramo.pruebas}
          boton="Entregar el tramo"
          onVeredicto={(entrega: EntregaResultado) => aPasar(tramo.id, entrega.superado)}
        />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button tone="ghost" onClick={onElegirOtro}>
          Elegir otro camino
        </Button>
        <Button tone="ghost" onClick={() => { setParada(true); terminar(listos); }}>
          Dejar la prueba aquí
        </Button>
      </div>
    </section>
  );
}

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

function etiqueta(estado: "pendiente" | "superado" | "superado-sin-comprender"): string {
  if (estado === "superado") return "superado";
  if (estado === "superado-sin-comprender") return "superado, con repaso";
  return "pendiente";
}

function colorEstado(estado: "pendiente" | "superado" | "superado-sin-comprender"): string {
  if (estado === "superado") return "text-copper";
  if (estado === "superado-sin-comprender") return "text-muted underline decoration-line";
  return "text-muted";
}
