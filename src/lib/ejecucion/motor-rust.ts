import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { RunRequest, RunResult } from "./tipos.ts";
import { limitesDefecto } from "./limites.ts";

/**
 * Ejecución local de Rust (0.3.C «Rust solo en desarrollo local», tarea 9).
 *
 * Compila y corre en un proceso hijo dentro de un directorio temporal. El tope de tiempo de
 * 0.3.B cubre la corrida del binario (la compilación tiene su propio tope más generoso: no es
 * trabajo de la persona). Al agotar el tiempo, el proceso se mata y el estado es `tiempo`.
 * Se elimina todo el directorio al terminar, con fallo o sin fallo. La salida de stdout y
 * stderr se recorta al mismo tope de 64 KB que el resto de motores. La memoria del proceso
 * hijo no se mide: `memoriaMBUsada` queda ausente, no se simula.
 *
 * AVISO HONESTO (0.3.C): el aislamiento de un proceso local es débil comparado con
 * WebAssembly. Por eso este modo existe solo en la máquina del desarrollador, se activa con
 * `CIFRA_RUST_LOCAL=1` y jamás se expone en la web publicada. Sin la variable de entorno, el
 * resultado es `no-soportado` — sin fingir nada.
 */

const TOPE_COMPILACION_MS = 300000; // tope propio de la compilación: no corta el trabajo de nadie
const TOPE_SALIDA = 64 * 1024; // 0.3.B: el mismo tope de salida que todos

export function rustLocalActivo(): boolean {
  return process.env.CIFRA_RUST_LOCAL === "1";
}

function hayCargo(): boolean {
  const expuesta = spawnSync("cargo", ["--version"], { encoding: "utf8" });
  return !expuesta.error && expuesta.status === 0;
}

/** Los ficheros mínimos del proyecto temporal que compila el motor. */
export function fuentesProyectoRust(codigo: string): { path: string; contenido: string }[] {
  return [
    {
      path: "Cargo.toml",
      contenido: "[package]\nname = \"cifra-programa\"\nversion = \"0.0.0\"\nedition = \"2021\"\n\n[dependencies]\n\n[[bin]]\nname = \"cifra-programa\"\npath = \"src/main.rs\"\n",
    },
    { path: join("src", "main.rs"), contenido: codigo.endsWith("\n") ? codigo : codigo + "\n" },
  ];
}

export async function ejecutarRustLocal(solicitud: RunRequest): Promise<RunResult> {
  if (!rustLocalActivo()) {
    return noSoportado(
      "La ejecución local de Rust está apagada: solo el desarrollador puede encenderla (CIFRA_RUST_LOCAL=1).",
    );
  }
  if (!hayCargo()) {
    return noSoportado("No hay toolchain de Rust (cargo) instalada en esta máquina.");
  }

  const inicio = performance.now();
  const proyecto = await mkdtemp(join(tmpdir(), "cifra-rust-"));
  try {
    await mkdir(join(proyecto, "src"), { recursive: true });
    for (const fichero of fuentesProyectoRust(solicitud.codigo)) {
      await writeFile(join(proyecto, fichero.path), fichero.contenido, "utf8");
    }

    const limites = solicitud.limites ?? limitesDefecto();
    const compilacion = spawnSync("cargo", ["build", "--quiet"], {
      cwd: proyecto,
      encoding: "utf8",
      timeout: TOPE_COMPILACION_MS,
      maxBuffer: 1024 * 1024,
    });
    if (compilacion.status !== 0) {
      return {
        estado: "error",
        stdout: recortar(compilacion.stdout ?? ""),
        stderr: recortar(compilacion.stderr ?? "la compilación de Rust falló sin mensaje"),
        codigoSalida: 1,
        duracionMs: Math.round(performance.now() - inicio),
        // Traza no hay en Rust (0.3): el compilador ya dice mejor dónde falló.
        traza: undefined,
        memoriaMBUsada: undefined,
        motor: motorRust(),
        origen: "ejecucion-real",
      };
    }

    const binario = join(proyecto, "target", "release", "cifra-programa");
    const corrida = spawnSync(binario, {
      cwd: proyecto,
      encoding: "utf8",
      timeout: limites.tiempoMs,
      input: solicitud.entrada ?? "",
      maxBuffer: 1024 * 1024,
    });

    const cortadoPorTiempo =
      corrida.error !== null && corrida.error !== undefined && "code" in corrida.error
        ? (corrida.error as NodeJS.ErrnoException).code === "ETIMEDOUT"
        : false;
    const stdout = recortar(corrida.stdout ?? "");
    const stderrBruta = corrida.stderr ?? "";
    const usadaEntera = stdout.length >= TOPE_SALIDA || stderrBruta.length >= TOPE_SALIDA;
    const stderr = cortadoPorTiempo
      ? "El programa no terminó en " + limites.tiempoMs + " ms (0.3.B) y la web lo cortó."
      : recortar(stderrBruta);

    const estado: RunResult["estado"] = cortadoPorTiempo
      ? "tiempo"
      : usadaEntera
        ? "salida-excedida"
        : corrida.status === 0
          ? "ok"
          : "error";

    return {
      estado,
      stdout,
      stderr,
      codigoSalida: corrida.status ?? 1,
      duracionMs: Math.round(performance.now() - inicio),
      traza: undefined,
      memoriaMBUsada: undefined,
      motor: motorRust(),
      origen: "ejecucion-real",
    };
  } finally {
    // 0.3.C: se elimina todo al terminar, con fallo o sin fallo.
    await rm(proyecto, { recursive: true, force: true });
  }
}

function recortar(texto: string): string {
  return texto.length > TOPE_SALIDA ? texto.slice(0, TOPE_SALIDA) : texto;
}

function motorRust(): { nombre: string; version: string } {
  return { nombre: "rust", version: "cargo-local" };
}

function noSoportado(aviso: string): RunResult {
  return {
    estado: "no-soportado",
    stdout: "",
    stderr: aviso,
    duracionMs: 0,
    motor: { nombre: "rust", version: "n/d" },
    origen: "ejecucion-real",
  };
}
