import { lockedSkills, type SkillId } from "./registry.ts";

export type LevelId = "empezando" | "practica" | "profundidad";

export type SkillPick = {
  id: SkillId;
  reason: string;
  locked: boolean;
};

export type SelectInput = {
  kind: "codigo" | "matematicas";
  level: LevelId;
  language: string;
  question: string;
  nestedLoops: boolean;
  recursion: boolean;
};

const ERROR_RE =
  /error|fall[oa]|excepci|bug|undefined|\bnan\b|panic|segfault|\bnull\b|traza|depura|excepci[oó]n|por qu[eé] (no |falla)/i;
const OPT_RE = /lent[oa]|optimiz|memoria|complej|eficient|coste|cuadr[aá]tic|big-?o|\bo\(/i;
const LANG_RE =
  /rust|puntero|ownership|pr[eé]stam|goroutine|concurren|tipado|compar(a|ar)|lenguaje|c\+\+|memoria/i;
const SEC_RE = /seguridad|inyecc|\bxss\b|secreto|contrase|password|token|sanitiz|sql/i;
const ALG_RE = /algoritm|recurs|invariant|b[uú]squed|orden(ar|aci)|complej|coste/i;

const DEEP_LANG = new Set(["rust", "c", "cpp", "go"]);

export function selectSkills(input: SelectInput): SkillPick[] {
  const locked = new Set(lockedSkills(input.kind));
  const picks: SkillPick[] = [];

  const add = (id: SkillId, reason: string) => {
    if (picks.some((pick) => pick.id === id)) return;
    picks.push({ id, reason, locked: locked.has(id) });
  };

  add("pedagogia", "Siempre: ajusta la profundidad y evita explicar de más.");

  if (input.kind === "codigo") {
    add("analisis", "Hay un fragmento que leer. Lo observado no es una ejecución.");
  } else {
    add("matematicas", "El camino parte de una idea matemática.");
    add("algoritmos", "La fórmula tiene que convertirse en pasos.");
  }

  if (input.kind === "codigo" && (input.recursion || ALG_RE.test(input.question))) {
    add(
      "algoritmos",
      input.recursion
        ? "El texto sugiere una función que se llama a sí misma."
        : "La pregunta habla de la idea del algoritmo, no solo de la sintaxis.",
    );
  }

  if (ERROR_RE.test(input.question)) {
    add("depuracion", "La pregunta busca un fallo, no un resumen.");
  }

  if (input.nestedLoops || OPT_RE.test(input.question)) {
    add(
      "optimizacion",
      input.nestedLoops
        ? "Hay un bucle dentro de otro. Conviene decir si eso importa."
        : "La pregunta habla de coste, memoria o de una versión más rápida.",
    );
  }

  if (
    LANG_RE.test(input.question) ||
    (input.level === "profundidad" && DEEP_LANG.has(input.language))
  ) {
    add(
      "lenguajes",
      input.level === "profundidad" && DEEP_LANG.has(input.language)
        ? "A este nivel, el modelo del lenguaje forma parte de la respuesta."
        : "La pregunta compara formas de expresar la misma idea.",
    );
  }

  if (SEC_RE.test(input.question)) {
    add("seguridad", "La pregunta mira datos, secretos o fronteras de confianza.");
  }

  return picks;
}

export function applySkillChoices(picks: SkillPick[], forcedOff: SkillId[], forcedOn: SkillId[]): SkillId[] {
  const off = new Set(forcedOff);
  const ids = new Set<SkillId>();
  for (const pick of picks) {
    if (pick.locked || !off.has(pick.id)) ids.add(pick.id);
  }
  for (const id of forcedOn) ids.add(id);
  for (const id of off) {
    const pick = picks.find((item) => item.id === id);
    if (!pick?.locked) ids.delete(id);
  }
  return [...ids];
}
