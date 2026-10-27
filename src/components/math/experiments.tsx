import { useEffect, useMemo, useState } from "react";
import {
  applyLogic,
  countCalls,
  dispersion,
  distanceBetween,
  linePoints,
  multiply2,
  parabolaPoints,
  quadratic,
  traceBinary,
} from "@/lib/content/math-run";

export function Experiment({ slug }: { slug: string }) {
  return (
    <section className="mt-10 border-t border-line pt-6">
      <h2 className="font-serif text-2xl">Probar los valores</h2>
      <p className="mt-2 text-pretty text-muted">
        Esto sí se calcula. El código es de Cifra y se queda en el navegador. No es una ejecución del fragmento que pegues en el estudio.
      </p>
      <div className="mt-5">
        {slug === "lineal" && <LinearLab />}
        {slug === "cuadratica" && <QuadraticLab />}
        {slug === "binaria" && <BinaryLab />}
        {slug === "fibonacci" && <FibonacciLab />}
        {slug === "matrices" && <MatrixLab />}
        {slug === "distancia" && <DistanceLab />}
        {slug === "dispersion" && <DispersionLab />}
        {slug === "logica" && <LogicLab />}
      </div>
    </section>
  );
}

function LinearLab() {
  const [slope, setSlope] = useState(2);
  const [intercept, setIntercept] = useState(1);
  const data = linePoints(slope, intercept);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="pendiente m" value={slope} onChange={setSlope} />
        <NumberField label="origen b" value={intercept} onChange={setIntercept} />
      </div>
      <p className="mt-4 font-mono text-sm tabular-nums">
        y = {fmt(slope)}x + {fmt(intercept)}
      </p>
      <Trend data={data} />
      <p className="mt-2 text-pretty text-muted">
        Del 0 al 1, y cambia exactamente {fmt(slope)}. Esa es la pendiente, no una aproximación de la gráfica.
      </p>
    </div>
  );
}

function QuadraticLab() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-3);
  const [c, setC] = useState(2);
  const result = quadratic(a, b, c);
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <NumberField label="a" value={a} onChange={setA} />
        <NumberField label="b" value={b} onChange={setB} />
        <NumberField label="c" value={c} onChange={setC} />
      </div>
      <p className="mt-4 text-pretty">
        Discriminante {fmt(result.discriminant)}.{" "}
        {result.kind === "no-cuadratica" && "a es 0: esto ya no es una parábola, y la fórmula dividiría por cero."}
        {result.kind === "ninguna" && "Negativo: no hay raíz real. La parábola no cruza el eje."}
        {result.kind === "una" && `Una raíz: x = ${fmt(result.x)}. La parábola toca el eje y no lo cruza.`}
        {result.kind === "dos" && `Dos raíces: x = ${fmt(result.x1)} y x = ${fmt(result.x2)}.`}
      </p>
      {a !== 0 && <Trend data={parabolaPoints(a, b, c)} />}
    </div>
  );
}

function BinaryLab() {
  const [raw, setRaw] = useState("1, 4, 9, 12, 18, 21, 30");
  const [target, setTarget] = useState(18);
  const [step, setStep] = useState(0);
  const nums = useMemo(
    () =>
      raw
        .split(/[\s,;]+/)
        .map((piece) => Number(piece))
        .filter((value) => Number.isFinite(value)),
    [raw],
  );
  const sorted = nums.every((value, index) => index === 0 || nums[index - 1] <= value);
  const steps = useMemo(() => (sorted && nums.length > 0 ? traceBinary(nums, target) : []), [nums, sorted, target]);
  const current = steps[Math.min(step, Math.max(steps.length - 1, 0))];

  return (
    <div>
      <label className="flex flex-col gap-2 font-mono text-sm">
        Arreglo
        <input
          value={raw}
          onChange={(event) => {
            setRaw(event.target.value);
            setStep(0);
          }}
          className="min-h-11 border border-line bg-paper px-3 font-mono text-ink"
        />
      </label>
      <div className="mt-3 max-w-xs">
        <NumberField
          label="objetivo"
          value={target}
          onChange={(value) => {
            setTarget(value);
            setStep(0);
          }}
        />
      </div>
      {!sorted && (
        <p className="mt-4 text-pretty">
          No está ordenado. La búsqueda binaria no promete nada aquí: podría descartar el propio objetivo. No la ejecuto
          sobre estos números.
        </p>
      )}
      {sorted && nums.length === 0 && <p className="mt-4">No hay números que mirar.</p>}
      {sorted && current && (
        <>
          <ol className="mt-4 flex flex-wrap gap-2">
            {nums.map((value, index) => {
              const inside = current.mid >= 0 && index >= current.low && index <= current.high;
              const mid = index === current.mid;
              return (
                <li
                  key={`${value}-${index}`}
                  className={
                    mid
                      ? "flex min-h-11 min-w-11 items-center justify-center bg-copper px-2 font-mono text-sm text-paper tabular-nums"
                      : inside
                        ? "flex min-h-11 min-w-11 items-center justify-center bg-line px-2 font-mono text-sm text-ink tabular-nums"
                        : "flex min-h-11 min-w-11 items-center justify-center px-2 font-mono text-sm text-muted tabular-nums"
                  }
                >
                  {value}
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-pretty">{current.why}</p>
          <p className="mt-2 font-mono text-sm text-muted">
            Paso {Math.min(step, steps.length - 1) + 1} de {steps.length}. low {current.low}, high {current.high}.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="tap min-h-11 border border-line px-4 font-mono text-sm"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
            >
              Anterior
            </button>
            <button
              type="button"
              className="tap min-h-11 bg-ink px-4 font-mono text-sm text-paper"
              onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FibonacciLab() {
  const [n, setN] = useState(8);
  const calls = countCalls(n);
  return (
    <div>
      <NumberField label="n, de 0 a 18" value={n} min={0} max={18} onChange={setN} />
      <p className="mt-4 text-pretty">
        F({Math.max(0, Math.min(18, Math.floor(n)))}) = {calls.naiveValue}. La versión que copia la fórmula hace{" "}
        {calls.naive} llamadas. Guardando cada resultado, {calls.memo}. El valor es el mismo.
      </p>
      <p className="mt-2 text-pretty text-muted">
        El tope está en 18 para que la versión simple no se coma la página. Ese tope ya es parte de la lección: la
        definición no cambia, el coste sí.
      </p>
    </div>
  );
}

function MatrixLab() {
  const [a, setA] = useState([
    [1, 2],
    [0, 1],
  ]);
  const [b, setB] = useState([
    [3, 1],
    [2, 4],
  ]);
  const [cell, setCell] = useState<[number, number]>([0, 0]);
  const product = multiply2(a, b);
  const [i, j] = cell;
  const terms = product.terms[i]?.[j] ?? [0, 0];

  const setCellValue = (which: "a" | "b", row: number, col: number, value: number) => {
    const update = which === "a" ? setA : setB;
    update((prev) => prev.map((line, r) => line.map((item, c) => (r === row && c === col ? value : item))));
  };

  return (
    <div className="flex flex-col gap-4">
      <MatrixGrid label="A" grid={a} onChange={(row, col, value) => setCellValue("a", row, col, value)} />
      <MatrixGrid label="B" grid={b} onChange={(row, col, value) => setCellValue("b", row, col, value)} />
      <div>
        <p className="font-mono text-sm">C, celda a celda</p>
        <div className="mt-2 grid w-fit grid-cols-2 gap-2">
          {product.grid.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                aria-pressed={rowIndex === i && colIndex === j}
                onClick={() => setCell([rowIndex, colIndex])}
                className={
                  rowIndex === i && colIndex === j
                    ? "tap min-h-11 min-w-16 bg-copper font-mono text-sm text-paper tabular-nums"
                    : "tap min-h-11 min-w-16 border border-line font-mono text-sm tabular-nums"
                }
              >
                {fmt(value)}
              </button>
            )),
          )}
        </div>
      </div>
      <p className="text-pretty">
        c{i + 1}
        {j + 1} = {fmt(a[i]?.[0] ?? 0)} × {fmt(b[0]?.[j] ?? 0)} + {fmt(a[i]?.[1] ?? 0)} × {fmt(b[1]?.[j] ?? 0)} ={" "}
        {fmt(terms[0] ?? 0)} + {fmt(terms[1] ?? 0)} = {fmt(product.grid[i]?.[j] ?? 0)}.
      </p>
    </div>
  );
}

function MatrixGrid({
  label,
  grid,
  onChange,
}: {
  label: string;
  grid: number[][];
  onChange: (row: number, col: number, value: number) => void;
}) {
  return (
    <fieldset>
      <legend className="font-mono text-sm">{label}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <input
              key={`${label}-${rowIndex}-${colIndex}`}
              type="number"
              aria-label={`${label} fila ${rowIndex + 1} columna ${colIndex + 1}`}
              value={value}
              onChange={(event) => onChange(rowIndex, colIndex, Number(event.target.value))}
              className="min-h-11 w-24 border border-line bg-paper px-3 font-mono tabular-nums text-ink"
            />
          )),
        )}
      </div>
    </fieldset>
  );
}

function DistanceLab() {
  const [ax, setAx] = useState(0);
  const [ay, setAy] = useState(0);
  const [bx, setBx] = useState(3);
  const [by, setBy] = useState(4);
  const result = distanceBetween(ax, ay, bx, by);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NumberField label="x1" value={ax} onChange={setAx} />
        <NumberField label="y1" value={ay} onChange={setAy} />
        <NumberField label="x2" value={bx} onChange={setBx} />
        <NumberField label="y2" value={by} onChange={setBy} />
      </div>
      <p className="mt-4 font-mono text-sm tabular-nums text-pretty">
        dx = {fmt(result.dx)}, dy = {fmt(result.dy)}, dx² = {fmt(result.dx2)}, dy² = {fmt(result.dy2)}, suma ={" "}
        {fmt(result.sum)}, distancia = {fmt(result.distance)}
      </p>
    </div>
  );
}

function DispersionLab() {
  const [raw, setRaw] = useState("2, 4, 4, 4, 5, 5, 7, 9");
  const values = raw
    .split(/[\s,;]+/)
    .map((piece) => Number(piece))
    .filter((value) => Number.isFinite(value));
  const result = dispersion(values);
  return (
    <div>
      <label className="flex flex-col gap-2 font-mono text-sm">
        Datos
        <input
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          className="min-h-11 border border-line bg-paper px-3 font-mono text-ink"
        />
      </label>
      {!result && <p className="mt-4">Sin datos no hay media. Dividir la suma entre cero no la crea.</p>}
      {result && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="tabular-nums">
            n = {result.n}, suma = {fmt(result.sum)}, media = {fmt(result.mean)}
          </p>
          <p className="text-pretty">
            Desviaciones: {result.deviations.map((value) => fmt(value)).join(", ")}. Cuadrados:{" "}
            {result.squares.map((value) => fmt(value)).join(", ")}.
          </p>
          <p className="tabular-nums">Varianza poblacional (entre n, no entre n−1) = {fmt(result.variance)}.</p>
        </div>
      )}
    </div>
  );
}

function LogicLab() {
  const [op, setOp] = useState<"y" | "o" | "xor" | "no">("y");
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const value = applyLogic(op, a, b);
  const rows: [boolean, boolean][] = [
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ];
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["y", "y"],
            ["o", "o"],
            ["xor", "o exclusiva"],
            ["no", "no"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={op === id}
            onClick={() => setOp(id)}
            className={
              op === id
                ? "tap min-h-11 bg-ink px-4 font-mono text-sm text-paper"
                : "tap min-h-11 border border-line px-4 font-mono text-sm"
            }
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Toggle label="a" value={a} onChange={setA} />
        {op !== "no" && <Toggle label="b" value={b} onChange={setB} />}
      </div>
      <p className="mt-4 font-mono text-sm">
        Resultado: {value ? "verdadero" : "falso"}. En código,{" "}
        {op === "y" ? "a && b" : op === "o" ? "a || b" : op === "xor" ? "a !== b" : "!a"}.
      </p>
      <table className="mt-4 w-full max-w-sm text-left font-mono text-sm">
        <thead>
          <tr className="border-b border-line text-muted">
            <th className="py-2 font-medium">a</th>
            {op !== "no" && <th className="py-2 font-medium">b</th>}
            <th className="py-2 font-medium">sale</th>
          </tr>
        </thead>
        <tbody>
          {(op === "no" ? rows.filter((row) => row[1] === false) : rows).map((row) => (
            <tr key={row.join()} className="border-b border-line">
              <td className="py-2">{row[0] ? "V" : "F"}</td>
              {op !== "no" && <td className="py-2">{row[1] ? "V" : "F"}</td>}
              <td className="py-2">{applyLogic(op, row[0], row[1]) ? "V" : "F"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={value}
      onClick={() => onChange(!value)}
      className="tap min-h-11 border border-line px-4 font-mono text-sm"
    >
      {label}: {value ? "verdadero" : "falso"}
    </button>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 font-mono text-sm">
      {label}
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className="min-h-11 w-full border border-line bg-paper px-3 tabular-nums text-ink"
      />
    </label>
  );
}

function Trend({ data }: { data: { x: number; y: number }[] }) {
  const [lib, setLib] = useState<typeof import("recharts") | null>(null);
  useEffect(() => {
    let live = true;
    void import("recharts").then((mod) => {
      if (live) setLib(mod);
    });
    return () => {
      live = false;
    };
  }, []);
  if (!lib) return <p className="mt-4 font-mono text-sm text-muted">Preparando la gráfica.</p>;
  const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } = lib;
  return (
    <div className="mt-4 h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="x" stroke="var(--color-muted)" tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
          <YAxis width={44} stroke="var(--color-muted)" tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const y = payload[0]?.value;
              return (
                <div className="border border-line bg-paper px-3 py-2 font-mono text-sm text-ink">
                  x {label} · y {typeof y === "number" ? fmt(y) : "—"}
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="y"
            stroke="var(--color-copper)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function fmt(value: number): string {
  if (!Number.isFinite(value)) return "indefinido";
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded);
}
