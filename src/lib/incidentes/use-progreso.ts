import { useCallback, useEffect, useState } from "react";
import {
  cargarProgresoIncidentes,
  guardarEntrega,
  guardarProgresoIncidentes,
  marcarAbierto,
  progresoIncidentesInicial,
  type ProgresoIncidentes,
  type ResumenEvaluacion,
} from "./progreso.ts";

/**
 * El progreso de los incidentes vivo en la interfaz (0.5.H): carga desde este navegador al
 * montar y escribe en cada cambio, como el de los retos. Se abre un paquete al entrar en su
 * pantalla y queda entregado con el resumen de la comparación cuando la persona entrega.
 */
export function useIncidentesProgreso() {
  const [progreso, setProgreso] = useState<ProgresoIncidentes>(progresoIncidentesInicial);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    setProgreso(cargarProgresoIncidentes());
    setCargado(true);
  }, []);

  const actualizar = useCallback((cambio: (anterior: ProgresoIncidentes) => ProgresoIncidentes) => {
    setProgreso((anterior) => {
      const siguiente = cambio(anterior);
      guardarProgresoIncidentes(siguiente);
      return siguiente;
    });
  }, []);

  const abrir = useCallback(
    (id: string, nivel: number) => {
      actualizar((llevado) => marcarAbierto(llevado, id, nivel));
    },
    [actualizar],
  );

  const entregar = useCallback(
    (id: string, nivel: number, resumen: ResumenEvaluacion) => {
      actualizar((llevado) => guardarEntrega(llevado, id, nivel, resumen).progreso);
    },
    [actualizar],
  );

  /** La importación reemplaza el progreso entero por uno validado fuera. */
  const reemplazar = useCallback(
    (nuevo: ProgresoIncidentes) => {
      actualizar(() => nuevo);
    },
    [actualizar],
  );

  return { progresoIncidentes: progreso, cargado, abrir, entregar, reemplazar };
}
