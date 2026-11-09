import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { languageIds as languageIdsDeStructure } from "../../analyze/structure.ts";
import { languageEssays, wordCountNotes } from "../../content/languages.ts";
import { ejecutarJavaScript } from "../../ejecucion/motor-javascript.ts";
import { ejecutarPython } from "../../ejecucion/motor-python.ts";
import { limitesDefecto } from "../../ejecucion/limites.ts";
import { cargarModulos } from "../registro.ts";
import { contratosDeModulo, type Modulo } from "../tipos.ts";
import {
  agregarLenguajes,
  catalogoLenguajes,
  ejecutarLenguaje,
  ensayosDeLenguajes,
  familiaDe,
  isLanguageId,
  lenguajesConMotor,
  lenguajesRechazados,
  languageIds,
  languageLabels,
  motorDe,
  notasDeLenguajes,
  reglasDeError,
  senalesCodigo,
  senalesMensaje,
} from "./index.ts";
import type { Lenguaje } from "./tipos.ts";

const IDS_ESPERADOS = [
  "python",
  "javascript",
  "typescript",
  "rust",
  "go",
  "c",
  "cpp",
  "java",
  "csharp",
  "ruby",
  "php",
  "sql",
  "html",
  "css",
];

/** El catálogo ya está cargado por el registro; aquí solo se lee con la forma del contrato. */
const modulos: readonly Modulo<Lenguaje>[] = catalogoLenguajes;
const etiquetas: Readonly<Record<string, string>> = languageLabels;

describe("los lenguajes entran como módulos (0.6)", () => {
  it("el catálogo entero pasa el registro, sin rechazados", () => {
    const carga = cargarModulos<Lenguaje>(catalogoLenguajes);
    assert.equal(carga.cargados.length, 14);
    assert.equal(carga.rechazados.length, 0);
    assert.equal(lenguajesRechazados.length, 0);
    assert.deepEqual([...languageIds], IDS_ESPERADOS);
  });

  it("cada módulo aporta en el manifiesto lo que trae en el contenido", () => {
    for (const modulo of modulos) {
      const { aporta, necesita, id } = modulo.manifiesto;
      const { label, familia, senales, reglasError, nota, ensayo, motor } = modulo.contenido;
      assert.equal(id, modulo.contenido.id, `${id}: el id del manifiesto no es el del contenido`);
      assert.ok(label.trim().length > 0, `${id}: sin label`);
      assert.ok(aporta.includes("analizador"), `${id}: no declara el analizador`);
      assert.equal(
        aporta.includes("señales"),
        senales !== undefined,
        `${id}: señales mal declaradas`,
      );
      assert.equal(
        aporta.includes("reglas"),
        reglasError !== undefined,
        `${id}: reglas mal declaradas`,
      );
      assert.equal(aporta.includes("nota"), nota !== undefined, `${id}: nota mal declarada`);
      assert.equal(aporta.includes("ensayo"), ensayo !== undefined, `${id}: ensayo mal declarado`);
      assert.equal(aporta.includes("motor"), motor !== undefined, `${id}: motor mal declarado`);
      if (motor) {
        assert.ok(motor.notas.trim().length > 0, `${id}: motor sin notas`);
        assert.equal(typeof motor.ejecutar, "function", `${id}: motor sin ejecutar`);
      }
      const contratoDeReglas = reglasError ? ["contrato:4.2"] : [];
      assert.deepEqual(
        [...necesita],
        contratoDeReglas,
        `${id}: necesita no coincide con sus reglas`,
      );
      assert.ok(familia.length > 0, `${id}: sin familia`);
    }
  });

  it("structure.ts y content/languages.ts reexportan el registro, sin copias sueltas", () => {
    assert.equal(languageIdsDeStructure, languageIds);
    assert.equal(wordCountNotes, notasDeLenguajes);
    assert.equal(languageEssays, ensayosDeLenguajes);
    assert.equal(familiaDe("python"), "python");
    assert.equal(familiaDe("c"), "brace");
    assert.ok(isLanguageId("python"));
    assert.ok(!isLanguageId("elixir"));
    assert.equal(etiquetas["elixir"], undefined);
  });

  it("las notas salen del módulo que las trae, en orden de catálogo", () => {
    assert.deepEqual(
      notasDeLenguajes.map((nota) => nota.id),
      [
        "python",
        "javascript",
        "typescript",
        "rust",
        "go",
        "c",
        "cpp",
        "java",
        "csharp",
        "ruby",
        "php",
        "sql",
      ],
    );
    for (const nota of notasDeLenguajes) {
      assert.equal(nota.label, etiquetas[nota.id]);
      assert.ok(nota.code.trim().length > 0, `${nota.id}: nota sin código`);
      assert.ok(nota.changed.length > 0, `${nota.id}: nota sin comentarios`);
    }
  });

  it("los ensayos salen del módulo del lenguaje del que hablan", () => {
    const porTitulo = new Map(
      modulos
        .filter((modulo) => modulo.contenido.ensayo)
        .map((modulo) => [modulo.contenido.ensayo!.title, modulo.manifiesto.id]),
    );
    assert.deepEqual(
      ensayosDeLenguajes.map((ensayo) => [ensayo.title, porTitulo.get(ensayo.title)]),
      [
        ["De JavaScript a TypeScript", "typescript"],
        ["De Python a Rust", "rust"],
        ["De JavaScript a Go", "go"],
        ["C, C++ y cuánto vive un objeto", "c"],
      ],
    );
    assert.ok(ensayosDeLenguajes.every((ensayo) => ensayo.body.length > 0));
  });

  it("las reglas y las señales de detección salen de su módulo", () => {
    assert.equal(reglasDeError("javascript").length, 4);
    assert.equal(reglasDeError("python").length, 7);
    assert.equal(reglasDeError("rust").length, 6);
    assert.equal(reglasDeError("java").length, 0);
    assert.equal(reglasDeError("nadie").length, 0);

    const cuenta = (senales: readonly { lenguaje: string }[]) => {
      const totales = new Map<string, number>();
      for (const senal of senales)
        totales.set(senal.lenguaje, (totales.get(senal.lenguaje) ?? 0) + 1);
      return Object.fromEntries(totales);
    };
    assert.deepEqual(cuenta(senalesCodigo), { python: 5, javascript: 5, typescript: 2, rust: 5 });
    assert.deepEqual(cuenta(senalesMensaje), { python: 3, javascript: 4, rust: 2 });
    assert.ok([...senalesCodigo, ...senalesMensaje].every((senal) => isLanguageId(senal.lenguaje)));
    assert.ok(senalesCodigo.some((senal) => senal.re.test("def frecuencias():")));
    assert.ok(senalesMensaje.some((senal) => senal.re.test("Traceback (most recent call last)")));
  });

  it("prueba de fuego: un lenguaje falso registrado aparece en todas las agregaciones", () => {
    const elixir = {
      manifiesto: {
        id: "elixir",
        tipo: "lenguaje",
        aporta: ["analizador", "señales", "reglas", "nota", "ensayo"],
        versionContrato: contratosDeModulo.lenguaje.version,
        necesita: ["contrato:4.2"],
      },
      contenido: {
        id: "elixir",
        label: "Elixir",
        familia: "brace",
        senales: { codigo: [/(^|\n)\s*defmodule\s+\w+/], mensaje: [/\bCompileError\b/] },
        reglasError: [{ tipo: "sintaxis", encaja: /\bCompileError\b/ }],
        nota: { code: "defmodule Frecuencias do\nend\n", changed: ["El módulo nace cerrado."] },
        ensayo: { id: "proceso", title: "De Elixir a nadie", see: "proceso", body: ["Un texto."] },
      },
    } as const satisfies Modulo<Lenguaje>;

    const carga = cargarModulos<Lenguaje>([...catalogoLenguajes, elixir]);
    assert.equal(carga.rechazados.length, 0, "el módulo falso no cumple el manifiesto");

    const agregado = agregarLenguajes(carga.cargados);
    assert.ok(agregado.ids.includes("elixir"));
    assert.equal(agregado.etiquetas["elixir"], "Elixir");
    assert.equal(agregado.familias["elixir"], "brace");
    assert.ok(agregado.senalesCodigo.some((senal) => senal.lenguaje === "elixir"));
    assert.ok(agregado.senalesMensaje.some((senal) => senal.lenguaje === "elixir"));
    assert.equal(agregado.reglas["elixir"].length, 1);
    assert.ok(agregado.notas.some((nota) => nota.id === "elixir"));
    assert.ok(agregado.ensayos.some((ensayo) => ensayo.id === "proceso"));
    assert.equal(agregado.notas.find((nota) => nota.id === "elixir")!.label, "Elixir");
    assert.equal(agregado.motores["elixir"], undefined, "el módulo falso no trae motor");
  });
});

describe("el motor de cada lenguaje vive en su módulo (0.6)", () => {
  it("el registro dice qué lenguajes se ejecutan y con qué notas", () => {
    assert.deepEqual([...lenguajesConMotor()], ["python", "javascript"]);
    assert.equal(motorDe("javascript"), catalogoLenguajes[1].contenido.motor);
    assert.equal(motorDe("python"), catalogoLenguajes[0].contenido.motor);
    assert.equal(motorDe("javascript")?.notas, "corre en un Worker de tu navegador");
    assert.equal(
      motorDe("python")?.notas,
      "Pyodide se baja del CDN la primera vez; tarda al cargar",
    );
    // Rust y los demás están en el registro, pero sin motor: no entran en el selector.
    assert.equal(motorDe("rust"), undefined);
    assert.equal(motorDe("go"), undefined);
    assert.equal(motorDe("elixir"), undefined);
  });

  it("el disparo pasa por el motor del módulo, sin lista de la interfaz", async () => {
    const pedido = { codigo: "console.log(1)", limites: limitesDefecto(), trazar: false };
    const directo = await ejecutarJavaScript({ ...pedido, lenguaje: "javascript" });
    const despachado = await ejecutarLenguaje({ ...pedido, lenguaje: "javascript" });
    assert.deepEqual(despachado, directo);
    assert.equal(motorDe("javascript")?.ejecutar, ejecutarJavaScript);
    assert.equal(motorDe("python")?.ejecutar, ejecutarPython);
  });

  it("un id sin motor no se ejecuta: vuelve no-soportado con el motivo", async () => {
    for (const id of ["rust", "go", "elixir", ""]) {
      const resultado = await ejecutarLenguaje({
        lenguaje: id,
        codigo: "x",
        limites: limitesDefecto(),
      });
      assert.equal(resultado.estado, "no-soportado", `${id}: debería no soportarse`);
      assert.equal(resultado.origen, "ejecucion-real");
      assert.ok(resultado.stderr.includes(id), `${id}: el motivo no nombra al lenguaje`);
      assert.equal(resultado.stdout, "");
      assert.equal(resultado.traza, undefined);
    }
  });
});
