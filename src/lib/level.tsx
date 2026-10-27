import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LevelId } from "@/lib/skills/select";

const KEY = "cifra.nivel";

const LevelContext = createContext<{
  level: LevelId;
  setLevel: (level: LevelId) => void;
} | null>(null);

export function LevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<LevelId>("practica");

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored === "empezando" || stored === "practica" || stored === "profundidad") {
      setLevelState(stored);
    }
  }, []);

  const setLevel = (next: LevelId) => {
    setLevelState(next);
    localStorage.setItem(KEY, next);
  };

  return <LevelContext.Provider value={{ level, setLevel }}>{children}</LevelContext.Provider>;
}

export function useLevel() {
  const value = useContext(LevelContext);
  if (!value) throw new Error("El nivel solo existe dentro de la aplicación.");
  return value;
}

export const levelOptions: { id: LevelId; label: string; hint: string }[] = [
  {
    id: "empezando",
    label: "Base",
    hint: "Ideas con palabras llanas. El argot, solo si hace falta, y con su significado.",
  },
  {
    id: "practica",
    label: "Práctica",
    hint: "Se dan por sabidos variables, funciones y bucles. El foco es la idea y lo que no es obvio.",
  },
  {
    id: "profundidad",
    label: "Fondo",
    hint: "Cabe hablar de coste, memoria y del modelo del lenguaje, sin repasar lo elemental.",
  },
];
