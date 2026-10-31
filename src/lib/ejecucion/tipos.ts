/**
 * Contrato 4.4 de NOVEDADES_AI.md: lo que un ejecutor recibe y devuelve.
 * Cualquier estado distinto de `ok` es un corte que hay que explicar, nunca algo simulado.
 * `trazaTruncada` es la ampliación acordada en la 0.3: la traza se recorta al tope de pasos
 * y el propio resultado lo señala.
 */

export type LenguajeEjecutable = "javascript" | "python" | "rust";

export type Limites = {
  tiempoMs: number;
  memoriaMB: number;
  salidaKB: number;
  pasosTraza: number;
};

export type RunRequest = {
  lenguaje: LenguajeEjecutable;
  codigo: string;
  entrada?: string; // stdin
  limites: Limites;
  pruebas?: TestSpec[];
  trazar?: boolean;
};

export type TestSpec = {
  id: string;
  nombre: string;
  entrada: unknown;
  esperado: unknown;
  tipo: "salida" | "retorno" | "propiedad";
  visible: boolean; // las no visibles no se muestran antes de entregar
};

export type RunResult = {
  estado: "ok" | "error" | "tiempo" | "memoria" | "salida-excedida" | "no-soportado";
  stdout: string;
  stderr: string;
  codigoSalida?: number;
  duracionMs: number;
  pruebas?: TestResult[];
  traza?: TraceStep[];
  trazaTruncada?: boolean;
  motor: { nombre: string; version: string };
  origen: "ejecucion-real"; // siempre esta cadena: sello de procedencia
};

export type TestResult = {
  id: string;
  pasada: boolean;
  obtenido?: unknown;
  esperado?: unknown;
  error?: string;
};

export type TraceStep = {
  paso: number;
  linea: number;
  evento: "linea" | "llamada" | "retorno" | "excepcion";
  variables: Record<string, string>; // valores ya convertidos a texto y recortados
};
