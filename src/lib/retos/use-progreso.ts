import { useCallback, useEffect, useState } from "react";
import {
  cambiarPlan,
  cargarProgreso,
  guardarPruebaNivel,
  guardarProgreso,
  marcarSuperado,
  progresoInicial,
  type Progreso,
} from "./progreso.ts";
import type { Plan } from "./tipos";

/**
 * El progreso vivo en la interfaz (0.4.E). Carga desde este navegador al montar —nunca durante
 * el servidor: cada componente decide qué pinta mientras no esté cargado— y escribe en cada
 * cambio, con validación al leer y al escribir.
 */
export function useProgreso() {
  const [progreso, setProgreso] = useState<Progreso>(progresoInicial);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    setProgreso(cargarProgreso());
    setCargado(true);
  }, []);

  const actualizar = useCallback((cambio: (anterior: Progreso) => Progreso) => {
    setProgreso((anterior) => {
      const siguiente = cambio(anterior);
      guardarProgreso(siguiente);
      return siguiente;
    });
  }, []);

  const superar = useCallback(
    (id: string, nivel: number, sinComprender: boolean) => {
      let profesionalDesbloqueado = false;
      actualizar((llevado) => {
        const resultado = marcarSuperado(llevado, id, nivel, sinComprender);
        profesionalDesbloqueado = resultado.profesionalDesbloqueado;
        return resultado.progreso;
      });
      return profesionalDesbloqueado;
    },
    [actualizar],
  );

  const registrarPruebaNivel = useCallback(
    (resueltos: string[], nivelEstimado: number) => {
      let profesionalDesbloqueado = false;
      actualizar((llevado) => {
        const resultado = guardarPruebaNivel(llevado, resueltos, nivelEstimado);
        profesionalDesbloqueado = resultado.profesionalDesbloqueado;
        return resultado.progreso;
      });
      return profesionalDesbloqueado;
    },
    [actualizar],
  );

  const elegirPlan = useCallback(
    (plan: Plan): string | null => {
      let error: string | null = null;
      actualizar((llevado) => {
        const resultado = cambiarPlan(llevado, plan);
        if (resultado.error) error = resultado.error;
        return resultado.progreso;
      });
      return error;
    },
    [actualizar],
  );

  const proponerRepaso = useCallback(
    (conceptos: string[]) => {
      actualizar((llevado) => ({
        ...llevado,
        conceptosRepaso: [
          ...new Set([...llevado.conceptosRepaso, ...conceptos]),
        ],
      }));
    },
    [actualizar],
  );

  /** La importación (0.4.E) reemplaza el progreso entero por uno validado fuera. */
  const reemplazar = useCallback(
    (nuevo: Progreso) => {
      actualizar(() => nuevo);
    },
    [actualizar],
  );

  return {
    progreso,
    cargado,
    superar,
    registrarPruebaNivel,
    elegirPlan,
    proponerRepaso,
    reemplazar,
  };
}
