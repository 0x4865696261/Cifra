export type Quad =
  | { kind: "no-cuadratica"; discriminant: number }
  | { kind: "ninguna"; discriminant: number }
  | { kind: "una"; discriminant: number; x: number }
  | { kind: "dos"; discriminant: number; x1: number; x2: number };

export function quadratic(a: number, b: number, c: number): Quad {
  const discriminant = b * b - 4 * a * c;
  if (a === 0) return { kind: "no-cuadratica", discriminant };
  if (discriminant < 0) return { kind: "ninguna", discriminant };
  if (discriminant === 0) {
    return { kind: "una", discriminant, x: -b / (2 * a) };
  }
  const root = Math.sqrt(discriminant);
  return {
    kind: "dos",
    discriminant,
    x1: (-b - root) / (2 * a),
    x2: (-b + root) / (2 * a),
  };
}

export function linePoints(slope: number, intercept: number) {
  const points = [];
  for (let x = -6; x <= 6; x += 1) {
    points.push({ x, y: slope * x + intercept });
  }
  return points;
}

export function parabolaPoints(a: number, b: number, c: number) {
  const points = [];
  for (let i = -20; i <= 20; i += 1) {
    const x = i / 2;
    points.push({ x, y: a * x * x + b * x + c });
  }
  return points;
}

export type SearchStep = {
  low: number;
  high: number;
  mid: number;
  value: number | null;
  decision: "encontrado" | "derecha" | "izquierda" | "vacio";
  why: string;
};

export function traceBinary(nums: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];
  let low = 0;
  let high = nums.length - 1;
  let guard = 0;
  while (low <= high && guard < 32) {
    guard += 1;
    const mid = Math.floor((low + high) / 2);
    const value = nums[mid] ?? null;
    if (value === null) break;
    if (value === target) {
      steps.push({
        low,
        high,
        mid,
        value,
        decision: "encontrado",
        why: `${value} es el objetivo. El índice es ${mid}.`,
      });
      return steps;
    }
    if (value < target) {
      steps.push({
        low,
        high,
        mid,
        value,
        decision: "derecha",
        why: `${value} es menor que ${target}. Si el objetivo está en el arreglo, está a la derecha de ${mid}. low pasa a ${mid + 1}.`,
      });
      low = mid + 1;
    } else {
      steps.push({
        low,
        high,
        mid,
        value,
        decision: "izquierda",
        why: `${value} es mayor que ${target}. Si el objetivo está, está a la izquierda de ${mid}. high pasa a ${mid - 1}.`,
      });
      high = mid - 1;
    }
  }
  steps.push({
    low,
    high,
    mid: -1,
    value: null,
    decision: "vacio",
    why: "low ha pasado a high. El intervalo quedó vacío: el objetivo no está. Eso también es una respuesta.",
  });
  return steps;
}

export function countCalls(n: number): { naive: number; naiveValue: number; memo: number; memoValue: number } {
  const safe = Math.max(0, Math.min(18, Math.floor(n)));
  let naive = 0;
  const naiveFib = (k: number): number => {
    naive += 1;
    if (k <= 1) return k;
    return naiveFib(k - 1) + naiveFib(k - 2);
  };
  const naiveValue = naiveFib(safe);
  let memo = 0;
  const cache = new Map<number, number>();
  const memoFib = (k: number): number => {
    memo += 1;
    const saved = cache.get(k);
    if (saved !== undefined) return saved;
    const value = k <= 1 ? k : memoFib(k - 1) + memoFib(k - 2);
    cache.set(k, value);
    return value;
  };
  const memoValue = memoFib(safe);
  return { naive, naiveValue, memo, memoValue };
}

export function multiply2(a: number[][], b: number[][]): { grid: number[][]; terms: number[][][] } {
  const grid = [
    [0, 0],
    [0, 0],
  ];
  const terms: number[][][] = [
    [[0, 0], [0, 0]],
    [[0, 0], [0, 0]],
  ];
  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      const left = (a[i]?.[0] ?? 0) * (b[0]?.[j] ?? 0);
      const right = (a[i]?.[1] ?? 0) * (b[1]?.[j] ?? 0);
      terms[i][j] = [left, right];
      grid[i][j] = left + right;
    }
  }
  return { grid, terms };
}

export function distanceBetween(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const dx2 = dx * dx;
  const dy2 = dy * dy;
  return { dx, dy, dx2, dy2, sum: dx2 + dy2, distance: Math.hypot(dx, dy) };
}

export function dispersion(values: number[]) {
  const n = values.length;
  if (n === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  const mean = sum / n;
  const deviations = values.map((value) => value - mean);
  const squares = deviations.map((value) => value * value);
  const variance = squares.reduce((total, value) => total + value, 0) / n;
  return { n, sum, mean, deviations, squares, variance };
}

export function applyLogic(op: "y" | "o" | "xor" | "no", a: boolean, b: boolean): boolean {
  if (op === "y") return a && b;
  if (op === "o") return a || b;
  if (op === "xor") return a !== b;
  return !a;
}
