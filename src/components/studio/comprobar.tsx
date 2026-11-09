 version/1.0
import { EditorCodigo, useBorrador } from "@/components/codigo/editor";
import { PanelesCodigo, type PanelCodigo } from "@/components/codigo/paneles";
import { EditorCodigo } from "@/components/editor-codigo";
 main
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { DiagnosticoCifra } from "@/lib/analyze/compiler";

const ejemplo = `function precio(valor: number | null): number {
  if (valor === null) {
    return 0;
  }
  return valor;
}

const precios: number[] = [5, 10];
const total: number = precio(precios.length);`;

const practica = `function precio(valor: number | null): number {
  return valor + 1;
}`;

type Resultado = { codigo: string; diagnosticos: DiagnosticoCifra[] };

export function ComprobarStudio({
  onEstudiarFallo,
}: {
  onEstudiarFallo: (codigo: string, mensaje: string) => void;
}) {

  const [codigo, setCodigo] = useBorrador("cifra.estudio.comprueba", ejemplo);
  const [panel, setPanel] = useState<PanelCodigo>("codigo");

  const [codigo, setCodigo] = useState(ejemplo);

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");

  const cambiarCodigo = (nuevo: string) => {
    setCodigo(nuevo);
    setResultado(null);
    setAviso("");
  };

  const comprobar = async () => {
    setOcupado(true);
    setResultado(null);
    setAviso("");
    try {
      const { comprobarCifra } = await import("@/lib/analyze/compiler");
      setResultado({ codigo, diagnosticos: comprobarCifra(codigo) });
    } catch {
      setAviso("No se pudo completar la comprobación. Reduce el programa o inténtalo de nuevo.");
    } finally {
      setOcupado(false);
    }
  };

  return (

    <PanelesCodigo titulo="Contexto" panel={panel} onPanel={setPanel} contexto={<div className="grid gap-4">

    <section className="grid max-w-3xl gap-4">

      <h2 className="font-serif text-2xl">Comprueba un programa Cifra</h2>
      <p>
        El comprobador revisa el código en tu navegador. Admite funciones con tipos, listas,
        variables y condiciones. Detecta problemas antes de ejecutar y deja el programa intacto.
      </p>
      <p>
        Practica con un precio ausente: cambia la función para que devuelva 0 cuando recibe
        <code> null</code> y sume 1 cuando recibe un número.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button tone="ghost" disabled={ocupado} onClick={() => cambiarCodigo(ejemplo)}>
          Cargar ejemplo válido
        </Button>
        <Button tone="ghost" disabled={ocupado} onClick={() => cambiarCodigo(practica)}>
          Cargar reto de tipos
        </Button>
      </div>

      </div>} codigo={<div className="grid gap-3">
      <EditorCodigo etiqueta="Código Cifra" valor={codigo} onChange={cambiarCodigo} lenguaje="cifra" />
      <div>
        <Button
          tone="primary"
          disabled={ocupado || !codigo.trim()}
          onClick={() => { setPanel("resultado"); void comprobar(); }}
        >
          {ocupado ? "Comprobando…" : "Comprobar código"}
        </Button>
      </div>
      </div>} resultado={<div aria-live="polite" className="grid gap-3">
        <h2 className="font-mono text-sm">Resultado</h2>

      <div className="grid gap-2 font-mono text-sm">
        Código Cifra
        <EditorCodigo
            value={codigo}
            label="Código Cifra"
            language="cifra"
          readOnly={ocupado}
          runDisabled={!codigo.trim()}
          output={ocupado ? "Comprobando…" : aviso || (resultado && (resultado.diagnosticos.length === 0 ? "Programa aceptado." : <ul>{resultado.diagnosticos.map((diagnostico, indice) => <li key={indice}>Línea {diagnostico.linea}. {diagnostico.mensaje}</li>)}</ul>))}
          onRun={() => { if (!ocupado && codigo.trim()) void comprobar(); }}
          busy={ocupado}
          runLabel={ocupado ? "Comprobando…" : "Comprobar código"}
            onChange={(nuevo) => cambiarCodigo(nuevo)}
          />
      </div>
      <div aria-live="polite">

        {aviso && <p>{aviso}</p>}
        {resultado &&
          (resultado.diagnosticos.length === 0 ? (
            <p>Programa aceptado por las reglas estáticas de Cifra.</p>
          ) : (
            <ul className="grid gap-3">
              {resultado.diagnosticos.map((diagnostico, indice) => {
                const ubicacion = `Línea ${diagnostico.linea}, columna ${diagnostico.columna}`;
                return (
                  <li key={indice} className="border border-line p-3">
                    <p>
                      <strong>{diagnostico.regla}</strong> · {ubicacion}
                    </p>
                    <p>{diagnostico.mensaje}</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <Link
                        className="underline"
                        to="/biblioteca/$slug"
                        params={{ slug: diagnostico.concepto }}
                      >
                        Leer el concepto
                      </Link>
                      <button
                        className="underline"
                        type="button"
                        onClick={() =>
                          onEstudiarFallo(
                            resultado.codigo,
                            `Diagnóstico estático: ${diagnostico.regla}. ${diagnostico.mensaje}\n    at programa.cifra.ts:${diagnostico.linea}:${diagnostico.columna}`,
                          )
                        }
                      >
                        Estudiar el fallo
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ))}
 version/1.0

      </div>
 main
      <p className="text-sm text-muted">
        Cifra exige firmas explícitas y comprueba la ausencia de valores. Puedes contrastar estas
        reglas con TypeScript y JavaScript en{" "}
        <Link className="underline" to="/lenguajes">
          Lenguajes
        </Link>
        .
      </p>
 version/1.0
      </div>}
    />

    </section>
 main
  );
}
