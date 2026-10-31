import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { observacionDe, observacionVacia, type ObservacionIntegridad } from "./integridad.ts";
import type { SenalIntegridad } from "./tipos.ts";

/**
 * La observación de integridad viva en la pantalla (0.4.D): pérdida de foco, pegados grandes y
 * ritmo imposible, con las reglas fijas de `integridad.ts`. Nunca bloquea nada: solo llena el
 * contexto que le llega al modelo con la defensa.
 */
export function usarSenales(): {
  señales: SenalIntegridad[];
  observacion: ObservacionIntegridad;
  eventos: {
    onPaste: (evento: ClipboardEvent<unknown>) => void;
    onKeyDown: (evento: KeyboardEvent<unknown>) => void;
    onBlur: () => void;
  };
  reiniciar: () => void;
} {
  const [señales, setSeñales] = useState<SenalIntegridad[]>([]);
  const escrituras = useRef<number[]>([]);

  useEffect(() => {
    const perdioElFoco = () =>
      setSeñales((lasQueHabia) => {
        const ahora = performance.now();
        return lasQueHabia.some((senal) => senal.tipo === "foco-perdido")
          ? lasQueHabia
          : [...lasQueHabia, { tipo: "foco-perdido", detalle: "la pestaña perdió el foco", cuando: ahora }];
      });
    window.addEventListener("blur", perdioElFoco);
    return () => window.removeEventListener("blur", perdioElFoco);
  }, []);

  const onPaste = useCallback((evento: React.ClipboardEvent<unknown>) => {
    const texto = evento.clipboardData?.getData("text") ?? "";
    const ahora = performance.now();
    setSeñales((lasQueHabia) =>
      texto.length <= 80
        ? lasQueHabia
        : [...lasQueHabia, { tipo: "pegado-grande", detalle: `un pegado de ${texto.length} caracteres (tope anotado: 80)`, cuando: ahora }],
    );
  }, []);

  const onKeyDown = useCallback((evento: React.KeyboardEvent<unknown>) => {
    const ahora = performance.now();
    escrituras.current = [...escrituras.current.filter((marca) => ahora - marca < 1000), ahora];
    const desdeMs = escrituras.current[0] ? ahora - escrituras.current[0] : 1000;
    const caracteres = escrituras.current.length;
    setSeñales((lasQueHabia) =>
      caracteres < 60 || desdeMs >= 1000
        ? lasQueHabia
        : [...lasQueHabia, { tipo: "ritmo-imposible", detalle: `${caracteres} caracteres en menos de 1000 ms`, cuando: ahora }],
    );
  }, []);

  const onBlur = useCallback(() => {
    setSeñales((lasQueHabia) =>
      lasQueHabia.some((senal) => senal.tipo === "foco-perdido")
        ? lasQueHabia
        : [...lasQueHabia, { tipo: "foco-perdido", detalle: "el editor perdió el foco", cuando: performance.now() }],
    );
  }, []);

  const reiniciar = useCallback(() => {
    escrituras.current = [];
    setSeñales([]);
  }, []);

  const observacion = useMemo(
    () => (señales.length === 0 ? observacionVacia() : observacionDe(señales)),
    [señales],
  );

  return { señales, observacion, eventos: { onPaste, onKeyDown, onBlur }, reiniciar };
}
