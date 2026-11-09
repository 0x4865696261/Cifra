import { arnesAlgoritmo } from "../retos/adaptadores-juez.ts";
import type { Firma } from "../retos/firmas.ts";
import type { LenguajeJuez } from "./catalogo.ts";
import type { CasoJuez } from "../retos/casos-juez.server.ts";

export type PlanProceso = {
  archivos: Record<string, string>;
  compilar?: string[];
  ejecutar: string[];
  casos: { args: string[]; entrada: string }[];
};

const csharpProyecto = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <NuGetAudit>false</NuGetAudit>
  </PropertyGroup>
</Project>`;
const sinFeeds = "<configuration><packageSources><clear /></packageSources></configuration>";

const programas = {
  javascript: { archivo: "main.js", ejecutar: ["node", "main.js"] },
  typescript: {
    archivo: "main.ts",
    ejecutar: ["node", "main.js"],
    compilar: [
      "node",
      "/opt/cifra/node_modules/typescript/bin/tsc",
      "--pretty",
      "false",
      "--skipLibCheck",
      "--target",
      "ES2022",
      "--module",
      "commonjs",
      "--typeRoots",
      "/opt/cifra/node_modules/@types",
      "main.ts",
    ],
  },
  python: { archivo: "main.py", ejecutar: ["python3", "-I", "main.py"] },
  ruby: { archivo: "main.rb", ejecutar: ["ruby", "main.rb"] },
  php: { archivo: "main.php", ejecutar: ["php", "-n", "main.php"] },
  rust: {
    archivo: "main.rs",
    compilar: ["rustc", "--edition=2021", "main.rs", "-o", "main"],
    ejecutar: ["./main"],
  },
  go: {
    archivo: "main.go",
    compilar: ["go", "build", "-o", "main", "main.go"],
    ejecutar: ["./main"],
  },
  c: {
    archivo: "main.c",
    compilar: ["gcc", "-std=c17", "main.c", "-lm", "-o", "main"],
    ejecutar: ["./main"],
  },
  cpp: {
    archivo: "main.cpp",
    compilar: ["g++", "-std=c++20", "main.cpp", "-o", "main"],
    ejecutar: ["./main"],
  },
  java: {
    archivo: "Main.java",
    compilar: ["javac", "-encoding", "UTF-8", "Main.java"],
    ejecutar: ["java", "-Xmx256m", "-cp", ".", "Main"],
  },
  csharp: {
    archivo: "Main.cs",
    compilar: ["dotnet", "build", "--nologo", "--disable-build-servers", "-o", "out"],
    ejecutar: ["dotnet", "out/Cifra.dll"],
  },
  sql: { archivo: "main.sql", ejecutar: ["python3", "-I", "/opt/cifra/sql.py"] },
  web: { archivo: "index.html", ejecutar: ["node", "/opt/cifra/web.cjs"] },
} satisfies Record<LenguajeJuez, { archivo: string; ejecutar: string[]; compilar?: string[] }>;

export function planProceso({
  lenguaje,
  codigo,
  css,
  entrada,
  firma,
  casos,
  nivel,
}: {
  lenguaje: LenguajeJuez;
  codigo: string;
  css?: string;
  entrada?: string;
  firma?: Firma;
  casos?: CasoJuez[];
  nivel?: boolean;
}): PlanProceso {
  const programa = programas[lenguaje];
  const archivos: Record<string, string> = { [programa.archivo]: codigo };
  const compilar = "compilar" in programa ? [...programa.compilar] : undefined;
  let ejecutar = [...programa.ejecutar];
  if (lenguaje === "csharp") {
    archivos["Cifra.csproj"] = csharpProyecto;
    archivos["NuGet.Config"] = sinFeeds;
  }
  if (lenguaje === "web") archivos["styles.css"] = css ?? "";
  if (firma && lenguaje !== "sql" && lenguaje !== "web") {
    const arnes = arnesAlgoritmo(lenguaje, firma);
    if (lenguaje === "go") {
      archivos["juez.go"] = arnes;
      compilar?.push("juez.go");
    } else {
      archivos[programa.archivo] += `\n\n${arnes}\n`;
    }
  }
  if (nivel) {
    archivos["juez.cjs"] = `const fs = require("node:fs");
const codigo = fs.readFileSync("main.js", "utf8");
const retorno = process.argv[2] === "retorno";
const aTexto = (valor) => valor !== null && typeof valor === "object"
  ? JSON.stringify(valor)
  : String(valor);
console.log = (...valores) => {
  if (!retorno) process.stdout.write(valores.map(aTexto).join(" ") + "\\n");
};
const valor = eval(codigo);
if (retorno) process.stdout.write(aTexto(valor));`;
    ejecutar = ["node", "juez.cjs"];
  }
  return {
    archivos,
    compilar,
    ejecutar,
    casos: casos?.map(({ args }) => ({ args, entrada: "" })) ?? [
      { args: lenguaje === "sql" ? [JSON.stringify(librosEjemplo)] : [], entrada: entrada ?? "" },
    ],
  };
}

export const librosEjemplo = [
  ["Luz", 120],
  ["Arena", 95],
  ["Mar", 180],
] as const;
