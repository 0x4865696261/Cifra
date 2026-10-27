import { i as __toESM } from "../_runtime.mjs";
import { n as getConcept } from "./concepts-cn_FJEPI.mjs";
import { S as require_jsx_runtime, X as require_react, Y as notFound, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as mathTopics, t as getMathTopic } from "./math-CnHQOZYR.mjs";
import { a as useLevel, i as levelOptions, n as Route, o as cn } from "./router-1de0mx_v.mjs";
import { t as CodeBlock } from "./code-block-CBoRvi11.mjs";
import { a as skills } from "./registry-BSIUxcFc.mjs";
import { a as selectSkills, i as askCifra, n as ExplanationView, o as useServerFn, r as applySkillChoices, t as Button } from "./select-Duh75O_q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/matematicas._slug-iU7-UASN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function quadratic(a, b, c) {
	const discriminant = b * b - 4 * a * c;
	if (a === 0) return {
		kind: "no-cuadratica",
		discriminant
	};
	if (discriminant < 0) return {
		kind: "ninguna",
		discriminant
	};
	if (discriminant === 0) return {
		kind: "una",
		discriminant,
		x: -b / (2 * a)
	};
	const root = Math.sqrt(discriminant);
	return {
		kind: "dos",
		discriminant,
		x1: (-b - root) / (2 * a),
		x2: (-b + root) / (2 * a)
	};
}
function linePoints(slope, intercept) {
	const points = [];
	for (let x = -6; x <= 6; x += 1) points.push({
		x,
		y: slope * x + intercept
	});
	return points;
}
function parabolaPoints(a, b, c) {
	const points = [];
	for (let i = -20; i <= 20; i += 1) {
		const x = i / 2;
		points.push({
			x,
			y: a * x * x + b * x + c
		});
	}
	return points;
}
function traceBinary(nums, target) {
	const steps = [];
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
				why: `${value} es el objetivo. El índice es ${mid}.`
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
				why: `${value} es menor que ${target}. Si el objetivo está en el arreglo, está a la derecha de ${mid}. low pasa a ${mid + 1}.`
			});
			low = mid + 1;
		} else {
			steps.push({
				low,
				high,
				mid,
				value,
				decision: "izquierda",
				why: `${value} es mayor que ${target}. Si el objetivo está, está a la izquierda de ${mid}. high pasa a ${mid - 1}.`
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
		why: "low ha pasado a high. El intervalo quedó vacío: el objetivo no está. Eso también es una respuesta."
	});
	return steps;
}
function countCalls(n) {
	const safe = Math.max(0, Math.min(18, Math.floor(n)));
	let naive = 0;
	const naiveFib = (k) => {
		naive += 1;
		if (k <= 1) return k;
		return naiveFib(k - 1) + naiveFib(k - 2);
	};
	const naiveValue = naiveFib(safe);
	let memo = 0;
	const cache = /* @__PURE__ */ new Map();
	const memoFib = (k) => {
		memo += 1;
		const saved = cache.get(k);
		if (saved !== void 0) return saved;
		const value = k <= 1 ? k : memoFib(k - 1) + memoFib(k - 2);
		cache.set(k, value);
		return value;
	};
	const memoValue = memoFib(safe);
	return {
		naive,
		naiveValue,
		memo,
		memoValue
	};
}
function multiply2(a, b) {
	const grid = [[0, 0], [0, 0]];
	const terms = [[[0, 0], [0, 0]], [[0, 0], [0, 0]]];
	for (let i = 0; i < 2; i += 1) for (let j = 0; j < 2; j += 1) {
		const left = (a[i]?.[0] ?? 0) * (b[0]?.[j] ?? 0);
		const right = (a[i]?.[1] ?? 0) * (b[1]?.[j] ?? 0);
		terms[i][j] = [left, right];
		grid[i][j] = left + right;
	}
	return {
		grid,
		terms
	};
}
function distanceBetween(ax, ay, bx, by) {
	const dx = bx - ax;
	const dy = by - ay;
	const dx2 = dx * dx;
	const dy2 = dy * dy;
	return {
		dx,
		dy,
		dx2,
		dy2,
		sum: dx2 + dy2,
		distance: Math.hypot(dx, dy)
	};
}
function dispersion(values) {
	const n = values.length;
	if (n === 0) return null;
	const sum = values.reduce((total, value) => total + value, 0);
	const mean = sum / n;
	const deviations = values.map((value) => value - mean);
	const squares = deviations.map((value) => value * value);
	return {
		n,
		sum,
		mean,
		deviations,
		squares,
		variance: squares.reduce((total, value) => total + value, 0) / n
	};
}
function applyLogic(op, a, b) {
	if (op === "y") return a && b;
	if (op === "o") return a || b;
	if (op === "xor") return a !== b;
	return !a;
}
function Experiment({ slug }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-10 border-t border-line pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl",
				children: "Probar los valores"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-pretty text-muted",
				children: "Esto sí se calcula. El código es de Cifra y se queda en el navegador. No es una ejecución del fragmento que pegues en el estudio."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [
					slug === "lineal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinearLab, {}),
					slug === "cuadratica" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuadraticLab, {}),
					slug === "binaria" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BinaryLab, {}),
					slug === "fibonacci" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FibonacciLab, {}),
					slug === "matrices" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatrixLab, {}),
					slug === "distancia" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistanceLab, {}),
					slug === "dispersion" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DispersionLab, {}),
					slug === "logica" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogicLab, {})
				]
			})
		]
	});
}
function LinearLab() {
	const [slope, setSlope] = (0, import_react.useState)(2);
	const [intercept, setIntercept] = (0, import_react.useState)(1);
	const data = linePoints(slope, intercept);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
				label: "pendiente m",
				value: slope,
				onChange: setSlope
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
				label: "origen b",
				value: intercept,
				onChange: setIntercept
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 font-mono text-sm tabular-nums",
			children: [
				"y = ",
				fmt(slope),
				"x + ",
				fmt(intercept)
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trend, { data }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-pretty text-muted",
			children: [
				"Del 0 al 1, y cambia exactamente ",
				fmt(slope),
				". Esa es la pendiente, no una aproximación de la gráfica."
			]
		})
	] });
}
function QuadraticLab() {
	const [a, setA] = (0, import_react.useState)(1);
	const [b, setB] = (0, import_react.useState)(-3);
	const [c, setC] = (0, import_react.useState)(2);
	const result = quadratic(a, b, c);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
					label: "a",
					value: a,
					onChange: setA
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
					label: "b",
					value: b,
					onChange: setB
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
					label: "c",
					value: c,
					onChange: setC
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-pretty",
			children: [
				"Discriminante ",
				fmt(result.discriminant),
				".",
				" ",
				result.kind === "no-cuadratica" && "a es 0: esto ya no es una parábola, y la fórmula dividiría por cero.",
				result.kind === "ninguna" && "Negativo: no hay raíz real. La parábola no cruza el eje.",
				result.kind === "una" && `Una raíz: x = ${fmt(result.x)}. La parábola toca el eje y no lo cruza.`,
				result.kind === "dos" && `Dos raíces: x = ${fmt(result.x1)} y x = ${fmt(result.x2)}.`
			]
		}),
		a !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trend, { data: parabolaPoints(a, b, c) })
	] });
}
function BinaryLab() {
	const [raw, setRaw] = (0, import_react.useState)("1, 4, 9, 12, 18, 21, 30");
	const [target, setTarget] = (0, import_react.useState)(18);
	const [step, setStep] = (0, import_react.useState)(0);
	const nums = (0, import_react.useMemo)(() => raw.split(/[\s,;]+/).map((piece) => Number(piece)).filter((value) => Number.isFinite(value)), [raw]);
	const sorted = nums.every((value, index) => index === 0 || nums[index - 1] <= value);
	const steps = (0, import_react.useMemo)(() => sorted && nums.length > 0 ? traceBinary(nums, target) : [], [
		nums,
		sorted,
		target
	]);
	const current = steps[Math.min(step, Math.max(steps.length - 1, 0))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex flex-col gap-2 font-mono text-sm",
			children: ["Arreglo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: raw,
				onChange: (event) => {
					setRaw(event.target.value);
					setStep(0);
				},
				className: "min-h-11 border border-line bg-paper px-3 font-mono text-ink"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 max-w-xs",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
				label: "objetivo",
				value: target,
				onChange: (value) => {
					setTarget(value);
					setStep(0);
				}
			})
		}),
		!sorted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-pretty",
			children: "No está ordenado. La búsqueda binaria no promete nada aquí: podría descartar el propio objetivo. No la ejecuto sobre estos números."
		}),
		sorted && nums.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4",
			children: "No hay números que mirar."
		}),
		sorted && current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-4 flex flex-wrap gap-2",
				children: nums.map((value, index) => {
					const inside = current.mid >= 0 && index >= current.low && index <= current.high;
					const mid = index === current.mid;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: mid ? "flex min-h-11 min-w-11 items-center justify-center bg-copper px-2 font-mono text-sm text-paper tabular-nums" : inside ? "flex min-h-11 min-w-11 items-center justify-center bg-line px-2 font-mono text-sm text-ink tabular-nums" : "flex min-h-11 min-w-11 items-center justify-center px-2 font-mono text-sm text-muted tabular-nums",
						children: value
					}, `${value}-${index}`);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-pretty",
				children: current.why
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-sm text-muted",
				children: [
					"Paso ",
					Math.min(step, steps.length - 1) + 1,
					" de ",
					steps.length,
					". low ",
					current.low,
					", high ",
					current.high,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "tap min-h-11 border border-line px-4 font-mono text-sm",
					onClick: () => setStep((value) => Math.max(0, value - 1)),
					children: "Anterior"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "tap min-h-11 bg-ink px-4 font-mono text-sm text-paper",
					onClick: () => setStep((value) => Math.min(steps.length - 1, value + 1)),
					children: "Siguiente"
				})]
			})
		] })
	] });
}
function FibonacciLab() {
	const [n, setN] = (0, import_react.useState)(8);
	const calls = countCalls(n);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
			label: "n, de 0 a 18",
			value: n,
			min: 0,
			max: 18,
			onChange: setN
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-pretty",
			children: [
				"F(",
				Math.max(0, Math.min(18, Math.floor(n))),
				") = ",
				calls.naiveValue,
				". La versión que copia la fórmula hace",
				" ",
				calls.naive,
				" llamadas. Guardando cada resultado, ",
				calls.memo,
				". El valor es el mismo."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-pretty text-muted",
			children: "El tope está en 18 para que la versión simple no se coma la página. Ese tope ya es parte de la lección: la definición no cambia, el coste sí."
		})
	] });
}
function MatrixLab() {
	const [a, setA] = (0, import_react.useState)([[1, 2], [0, 1]]);
	const [b, setB] = (0, import_react.useState)([[3, 1], [2, 4]]);
	const [cell, setCell] = (0, import_react.useState)([0, 0]);
	const product = multiply2(a, b);
	const [i, j] = cell;
	const terms = product.terms[i]?.[j] ?? [0, 0];
	const setCellValue = (which, row, col, value) => {
		(which === "a" ? setA : setB)((prev) => prev.map((line, r) => line.map((item, c) => r === row && c === col ? value : item)));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatrixGrid, {
				label: "A",
				grid: a,
				onChange: (row, col, value) => setCellValue("a", row, col, value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatrixGrid, {
				label: "B",
				grid: b,
				onChange: (row, col, value) => setCellValue("b", row, col, value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm",
				children: "C, celda a celda"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid w-fit grid-cols-2 gap-2",
				children: product.grid.map((row, rowIndex) => row.map((value, colIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": rowIndex === i && colIndex === j,
					onClick: () => setCell([rowIndex, colIndex]),
					className: rowIndex === i && colIndex === j ? "tap min-h-11 min-w-16 bg-copper font-mono text-sm text-paper tabular-nums" : "tap min-h-11 min-w-16 border border-line font-mono text-sm tabular-nums",
					children: fmt(value)
				}, `${rowIndex}-${colIndex}`)))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-pretty",
				children: [
					"c",
					i + 1,
					j + 1,
					" = ",
					fmt(a[i]?.[0] ?? 0),
					" × ",
					fmt(b[0]?.[j] ?? 0),
					" + ",
					fmt(a[i]?.[1] ?? 0),
					" × ",
					fmt(b[1]?.[j] ?? 0),
					" =",
					" ",
					fmt(terms[0] ?? 0),
					" + ",
					fmt(terms[1] ?? 0),
					" = ",
					fmt(product.grid[i]?.[j] ?? 0),
					"."
				]
			})
		]
	});
}
function MatrixGrid({ label, grid, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
		className: "font-mono text-sm",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 grid grid-cols-2 gap-2",
		children: grid.map((row, rowIndex) => row.map((value, colIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "number",
			"aria-label": `${label} fila ${rowIndex + 1} columna ${colIndex + 1}`,
			value,
			onChange: (event) => onChange(rowIndex, colIndex, Number(event.target.value)),
			className: "min-h-11 w-24 border border-line bg-paper px-3 font-mono tabular-nums text-ink"
		}, `${label}-${rowIndex}-${colIndex}`)))
	})] });
}
function DistanceLab() {
	const [ax, setAx] = (0, import_react.useState)(0);
	const [ay, setAy] = (0, import_react.useState)(0);
	const [bx, setBx] = (0, import_react.useState)(3);
	const [by, setBy] = (0, import_react.useState)(4);
	const result = distanceBetween(ax, ay, bx, by);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
				label: "x1",
				value: ax,
				onChange: setAx
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
				label: "y1",
				value: ay,
				onChange: setAy
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
				label: "x2",
				value: bx,
				onChange: setBx
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
				label: "y2",
				value: by,
				onChange: setBy
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-4 font-mono text-sm tabular-nums text-pretty",
		children: [
			"dx = ",
			fmt(result.dx),
			", dy = ",
			fmt(result.dy),
			", dx² = ",
			fmt(result.dx2),
			", dy² = ",
			fmt(result.dy2),
			", suma =",
			" ",
			fmt(result.sum),
			", distancia = ",
			fmt(result.distance)
		]
	})] });
}
function DispersionLab() {
	const [raw, setRaw] = (0, import_react.useState)("2, 4, 4, 4, 5, 5, 7, 9");
	const result = dispersion(raw.split(/[\s,;]+/).map((piece) => Number(piece)).filter((value) => Number.isFinite(value)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex flex-col gap-2 font-mono text-sm",
			children: ["Datos", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: raw,
				onChange: (event) => setRaw(event.target.value),
				className: "min-h-11 border border-line bg-paper px-3 font-mono text-ink"
			})]
		}),
		!result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4",
			children: "Sin datos no hay media. Dividir la suma entre cero no la crea."
		}),
		result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "tabular-nums",
					children: [
						"n = ",
						result.n,
						", suma = ",
						fmt(result.sum),
						", media = ",
						fmt(result.mean)
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-pretty",
					children: [
						"Desviaciones: ",
						result.deviations.map((value) => fmt(value)).join(", "),
						". Cuadrados:",
						" ",
						result.squares.map((value) => fmt(value)).join(", "),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "tabular-nums",
					children: [
						"Varianza poblacional (entre n, no entre n−1) = ",
						fmt(result.variance),
						"."
					]
				})
			]
		})
	] });
}
function LogicLab() {
	const [op, setOp] = (0, import_react.useState)("y");
	const [a, setA] = (0, import_react.useState)(true);
	const [b, setB] = (0, import_react.useState)(false);
	const value = applyLogic(op, a, b);
	const rows = [
		[false, false],
		[false, true],
		[true, false],
		[true, true]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: [
				["y", "y"],
				["o", "o"],
				["xor", "o exclusiva"],
				["no", "no"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-pressed": op === id,
				onClick: () => setOp(id),
				className: op === id ? "tap min-h-11 bg-ink px-4 font-mono text-sm text-paper" : "tap min-h-11 border border-line px-4 font-mono text-sm",
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				label: "a",
				value: a,
				onChange: setA
			}), op !== "no" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				label: "b",
				value: b,
				onChange: setB
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 font-mono text-sm",
			children: [
				"Resultado: ",
				value ? "verdadero" : "falso",
				". En código,",
				" ",
				op === "y" ? "a && b" : op === "o" ? "a || b" : op === "xor" ? "a !== b" : "!a",
				"."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "mt-4 w-full max-w-sm text-left font-mono text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-line text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 font-medium",
						children: "a"
					}),
					op !== "no" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 font-medium",
						children: "b"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2 font-medium",
						children: "sale"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (op === "no" ? rows.filter((row) => row[1] === false) : rows).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-line",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2",
						children: row[0] ? "V" : "F"
					}),
					op !== "no" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2",
						children: row[1] ? "V" : "F"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2",
						children: applyLogic(op, row[0], row[1]) ? "V" : "F"
					})
				]
			}, row.join())) })]
		})
	] });
}
function Toggle({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": value,
		onClick: () => onChange(!value),
		className: "tap min-h-11 border border-line px-4 font-mono text-sm",
		children: [
			label,
			": ",
			value ? "verdadero" : "falso"
		]
	});
}
function NumberField({ label, value, onChange, min, max }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-w-0 flex-col gap-1 font-mono text-sm",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "number",
			value: Number.isFinite(value) ? value : 0,
			min,
			max,
			onChange: (event) => {
				const next = Number(event.target.value);
				if (Number.isFinite(next)) onChange(next);
			},
			className: "min-h-11 w-full border border-line bg-paper px-3 tabular-nums text-ink"
		})]
	});
}
function Trend({ data }) {
	const [lib, setLib] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		import("../_libs/recharts+[...].mjs").then((n) => n.t).then((mod) => {
			if (live) setLib(mod);
		});
		return () => {
			live = false;
		};
	}, []);
	if (!lib) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 font-mono text-sm text-muted",
		children: "Preparando la gráfica."
	});
	const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } = lib;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 h-64 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
				data,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "x",
						stroke: "var(--color-muted)",
						tick: {
							fill: "var(--color-muted)",
							fontSize: 12
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						width: 44,
						stroke: "var(--color-muted)",
						tick: {
							fill: "var(--color-muted)",
							fontSize: 12
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => {
						if (!active || !payload?.length) return null;
						const y = payload[0]?.value;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-line bg-paper px-3 py-2 font-mono text-sm text-ink",
							children: [
								"x ",
								label,
								" · y ",
								typeof y === "number" ? fmt(y) : "—"
							]
						});
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "y",
						stroke: "var(--color-copper)",
						strokeWidth: 2,
						dot: false,
						isAnimationActive: false
					})
				]
			})
		})
	});
}
function fmt(value) {
	if (!Number.isFinite(value)) return "indefinido";
	const rounded = Math.round(value * 1e3) / 1e3;
	return String(rounded);
}
function MathPage() {
	const { slug } = Route.useParams();
	const topic = getMathTopic(slug);
	if (!topic) throw notFound();
	const [tab, setTab] = (0, import_react.useState)("python");
	const { level, setLevel } = useLevel();
	const explain = useServerFn(askCifra);
	const [question, setQuestion] = (0, import_react.useState)("");
	const [forcedOn, setForcedOn] = (0, import_react.useState)([]);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const picks = selectSkills({
		kind: "matematicas",
		level,
		language: tab,
		question,
		nestedLoops: false,
		recursion: slug === "fibonacci"
	});
	const active = applySkillChoices(picks, [], forcedOn);
	const index = mathTopics.findIndex((item) => item.slug === slug);
	const previous = mathTopics[index - 1];
	const next = mathTopics[index + 1];
	const submit = async () => {
		setPending(true);
		setResult(null);
		try {
			const response = await explain({ data: {
				kind: "matematicas",
				level,
				language: tab,
				question,
				facts: [],
				skills: active,
				topic: slug
			} });
			setResult(response);
		} catch (error) {
			setResult({
				ok: false,
				error: error instanceof Error ? error.message : "No se ha podido pedir la explicación."
			});
		} finally {
			setPending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		id: "contenido",
		className: "mx-auto max-w-3xl px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-sm text-copper",
				children: topic.kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: topic.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-mono text-lg",
				children: topic.formula
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-lg text-pretty",
				children: topic.promise
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl",
					children: "Qué dice"
				}), topic.meaning.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-pretty",
					children: paragraph
				}, paragraph))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl",
					children: "Cómo se razona"
				}), topic.reasoning.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-pretty",
					children: paragraph
				}, paragraph))]
			}),
			topic.whyNotOnlySimple && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl",
					children: "Por qué no siempre basta lo simple"
				}), topic.whyNotOnlySimple.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-pretty",
					children: paragraph
				}, paragraph))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-2xl",
					children: "Pseudocódigo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-3 overflow-x-auto border border-line p-4 font-mono text-sm leading-relaxed whitespace-pre",
					children: topic.pseudocode
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "En código"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": tab === "python",
							onClick: () => setTab("python"),
							className: cn("tap min-h-11 px-4 font-mono text-sm", tab === "python" ? "bg-ink text-paper" : "border border-line"),
							children: "Python"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": tab === "javascript",
							onClick: () => setTab("javascript"),
							className: cn("tap min-h-11 px-4 font-mono text-sm", tab === "javascript" ? "bg-ink text-paper" : "border border-line"),
							children: "JavaScript"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
							source: tab === "python" ? topic.python : topic.javascript,
							label: tab === "python" ? "Python" : "JavaScript"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Experiment, { slug }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 border-t border-line pt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Pedirlo a tu nivel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-pretty text-muted",
						children: "El texto de arriba no cambia. Esto añade una explicación del modelo, con las skills de matemáticas y de algoritmos. No sustituye al cálculo."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-3 border border-line",
						children: levelOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": level === option.id,
							onClick: () => setLevel(option.id),
							className: cn("tap min-h-11 font-mono text-sm", level === option.id ? "bg-ink text-paper" : "text-muted"),
							children: option.label
						}, option.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-pretty text-muted",
						children: levelOptions.find((option) => option.id === level)?.hint
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-wrap gap-2",
						children: active.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border border-line px-3 py-2 font-mono text-sm",
							children: skills[id].name
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							"lenguajes",
							"optimizacion",
							"depuracion"
						].filter((id) => !active.includes(id)).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							tone: "ghost",
							onClick: () => setForcedOn((prev) => [.../* @__PURE__ */ new Set([...prev, id])]),
							children: ["Añadir ", skills[id].name]
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-4 flex flex-col gap-2 font-mono text-sm",
						children: ["Una pregunta, si la tienes", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: question,
							onChange: (event) => setQuestion(event.target.value),
							rows: 3,
							maxLength: 600,
							className: "w-full border border-line bg-paper p-3 font-serif text-base"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						tone: "primary",
						className: "mt-4",
						disabled: pending,
						onClick: () => void submit(),
						children: pending ? "Preparando la explicación…" : "Explicar a mi nivel"
					}),
					result && !result.ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 border-l border-copper pl-4 text-pretty",
						children: result.error
					}),
					result?.ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExplanationView, {
						explanation: result.explanation,
						cached: result.cached,
						onAsk: (next) => {
							setQuestion(next);
							setResult(null);
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Sigue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col",
						children: topic.see.map((slugSee) => {
							const concept = getConcept(slugSee);
							if (!concept) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "border-t border-line",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/biblioteca/$slug",
									params: { slug: slugSee },
									className: "flex min-h-11 items-center font-serif text-xl",
									children: concept.title
								})
							}, slugSee);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-2 font-mono text-sm sm:flex-row sm:justify-between",
						children: [previous ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/matematicas/$slug",
							params: { slug: previous.slug },
							className: "inline-flex min-h-11 items-center",
							children: previous.title
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), next ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/matematicas/$slug",
							params: { slug: next.slug },
							className: "inline-flex min-h-11 items-center",
							children: next.title
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/matematicas",
							className: "inline-flex min-h-11 items-center",
							children: "Índice"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { MathPage as component };
