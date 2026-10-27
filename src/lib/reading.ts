import { useEffect, useState } from "react";

const KEY = "cifra.leidos";

export function useReading() {
  const [read, setRead] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        setRead(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      setRead([]);
    }
  }, []);

  const mark = (slug: string) => {
    setRead((prev) => {
      if (prev.includes(slug)) return prev;
      const next = [...prev, slug];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  return { read, mark };
}
