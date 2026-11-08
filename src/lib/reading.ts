import { useCallback, useEffect, useState } from "react";
import type { LearningPlan } from "@/lib/content/concepts";

const KEY = "cifra.leidos";
const DIFFICULT_KEY = "cifra.dificiles";
const PLAN_KEY = "cifra.plan-lectura";

function guardarLectura(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // La lectura sigue disponible cuando el navegador impide guardar el progreso.
  }
}

export function useReading() {
  const [read, setRead] = useState<string[]>([]);
  const [difficult, setDifficult] = useState<string[]>([]);
  const [plan, setPlanState] = useState<LearningPlan>("desde-cero");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRead(parsed.filter((item): item is string => typeof item === "string"));
        }
      }
      const difficultRaw = localStorage.getItem(DIFFICULT_KEY);
      if (difficultRaw) {
        const parsedDifficult: unknown = JSON.parse(difficultRaw);
        if (Array.isArray(parsedDifficult)) {
          setDifficult(parsedDifficult.filter((item): item is string => typeof item === "string"));
        }
      }
      const storedPlan = localStorage.getItem(PLAN_KEY);
      if (storedPlan === "desde-cero" || storedPlan === "ya-se") setPlanState(storedPlan);
    } catch {
      setRead([]);
      setDifficult([]);
      setPlanState("desde-cero");
    }
  }, []);

  const mark = useCallback((slug: string) => {
    setRead((prev) => {
      if (prev.includes(slug)) return prev;
      const next = [...prev, slug];
      guardarLectura(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setPlan = (next: LearningPlan) => {
    guardarLectura(PLAN_KEY, next);
    setPlanState(next);
  };

  const toggleDifficult = (slug: string) => {
    setDifficult((previous) => {
      const next = previous.includes(slug)
        ? previous.filter((item) => item !== slug)
        : [...previous, slug];
      guardarLectura(DIFFICULT_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { read, difficult, plan, mark, setPlan, toggleDifficult };
}
