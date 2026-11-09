export const lenguajesJuez = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "c",
  "cpp",
  "java",
  "csharp",
  "ruby",
  "php",
  "sql",
  "web",
] as const;

export type LenguajeJuez = (typeof lenguajesJuez)[number];
export type LenguajeAlgoritmo = Exclude<LenguajeJuez, "sql" | "web">;

export const etiquetasJuez: Record<LenguajeJuez, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  rust: "Rust",
  go: "Go",
  c: "C",
  cpp: "C++",
  java: "Java",
  csharp: "C#",
  ruby: "Ruby",
  php: "PHP",
  sql: "SQL",
  web: "HTML / CSS",
};

export const lenguajesAlgoritmo = lenguajesJuez.filter(
  (lenguaje): lenguaje is LenguajeAlgoritmo => lenguaje !== "sql" && lenguaje !== "web",
);

export function esLenguajeJuez(value: unknown): value is LenguajeJuez {
  return lenguajesJuez.some((lenguaje) => lenguaje === value);
}
