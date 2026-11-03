import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import {
  incidentesEnOrden,
  familiasDeIncidentes,
  definicionesIncidentes,
  notasFamiliasIncidentes,
} from "@/lib/incidentes/paquetes";
import { useIncidentesProgreso } from "@/lib/incidentes/use-progreso";
import { useProgreso } from "@/lib/retos/use-progreso";

/**
 * El tablero de incidentes (0.5): 8 paquetes sintéticos, uno por familia del mínimo, listados
 * con el progreso de este navegador. Sin plan profesional activo, los paquetes se listan igual
 * y la puerta se explica: nada de botones vacíos. La pantalla de cada paquete vive en
 * `/incidentes/$id`.
 */

export const Route = createFileRoute("/incidentes/")({
  head: () => ({ meta: [{ title: "Incidentes — Cifra" }] }),
  component: IncidentesPage,
});

function IncidentesPage() {
  const { progresoIncidentes, cargado } = useIncidentesProgreso();
  const { progreso } = useProgreso();
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    if (cargado) setVisto(true);
  }, [cargado]);

  const abierto = progreso.plan === "profesional";
  const entregados = definicionesIncidentes.filter(
    (paquete) => progresoIncidentes.paquetes[paquete.id]?.estado === "entregado",
  ).length;
  const sinVolver = Object.entries(progresoIncidentes.paquetes)
    .filter(([, entrada]) => entrada.estado === "abierto")
    .map(([id]) => id);

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-5 py-10">
      <p className="font-mono text-sm text-copper">Incidentes</p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl">
        Leer qué pasó: paquetes sintéticos, con el fallo plantado.
      </h1>
      <p className="mt-4 max-w-2xl text-pretty">
        Cada paquete lleva el sistema de un incidente: código, configuración, logs y métricas
        inventados pero realistas, con un síntoma. Lo investigas con una terminal simulada de solo
        lectura, escribes tu análisis y la comparación separa lo comprobado de lo deducido. La
        terminal no se conecta a nada: los ficheros del paquete son su mundo entero.
      </p>

      {!cargado && <p className="mt-10 font-mono text-sm text-muted">Leyendo tu progreso de este navegador…</p>}

      {visto && !abierto && (
        <div className="mt-8 border border-copper p-4 text-pretty">
          <h2 className="font-serif text-xl">El camino profesional</h2>
          <p className="mt-2">
            Los incidentes son del camino profesional. Se abre con la prueba de nivel o superando
            un reto de nivel 5, y se activa después desde Ajustes: tus retos y tu progreso de
            fundamentos no cambian.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/retos"
              className="tap inline-flex min-h-11 items-center border border-line bg-paper px-4 font-mono text-sm"
            >
              Prueba de nivel en Retos →
            </Link>
            <Link
              to="/ajustes"
              className="tap inline-flex min-h-11 items-center border border-line bg-paper px-4 font-mono text-sm"
            >
              Activar el plan profesional en Ajustes →
            </Link>
          </div>
        </div>
      )}

      {visto && abierto && (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border border-line px-4 py-3 font-mono text-sm">
            <span>Camino: profesional</span>
            <span>
              Entregados: {entregados}/{definicionesIncidentes.length}
            </span>
            {sinVolver.length > 0 && (
              <span className="text-copper">sin volver a mirar: {sinVolver.length}</span>
            )}
          </div>
          <ListaIncidentes />
        </>
      )}
    </main>
  );
}

function ListaIncidentes() {
  const { progresoIncidentes } = useIncidentesProgreso();
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl">Los paquetes</h2>
      <div className="mt-6 grid gap-8">
        {familiasDeIncidentes.map((familia) => (
          <section key={familia}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-serif text-xl">{tituloFamilia(familia)}</h3>
              <p className="font-mono text-sm text-muted">{notasFamiliasIncidentes[familia]}</p>
            </div>
            <ul className="mt-3 divide-line divide-y border border-line">
              {incidentesEnOrden()
                .filter((paquete) => paquete.familia === familia)
                .map((paquete) => {
                  const estado = progresoIncidentes.paquetes[paquete.id]?.estado ?? "nuevo";
                  return (
                    <li key={paquete.id}>
                      <Link
                        to="/incidentes/$id"
                        params={{ id: paquete.id }}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <span className="min-w-0">
                          <span className="font-serif text-lg">{paquete.titulo}</span>
                          <span className="ml-3 font-mono text-sm text-muted">nivel {paquete.nivel}</span>
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

function tituloFamilia(familia: string): string {
  const tabla: Record<string, string> = {
    "valor-nulo": "Valores nulos",
    "estado-corrupto": "Estados intermedios corruptos",
    "secreto-expuesto": "Secretos expuestos",
    "permiso-de-mas": "Permisos de más",
    "consulta-lenta": "Consultas lentas",
    "bloqueo-espera": "Bloqueos y esperas",
    "desborde-recursos": "Desbordes de recursos",
    "discrepancia-mensaje": "El mensaje y lo que ocurrió",
  };
  return tabla[familia] ?? familia;
}

function etiqueta(estado: "abierto" | "entregado" | "nuevo"): string {
  if (estado === "entregado") return "entregado";
  if (estado === "abierto") return "abierto";
  return "pendiente";
}

function colorEstado(estado: "abierto" | "entregado" | "nuevo"): string {
  if (estado === "entregado") return "text-copper";
  if (estado === "abierto") return "text-muted underline decoration-line";
  return "text-muted";
}
