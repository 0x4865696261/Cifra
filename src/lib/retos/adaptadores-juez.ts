import type { LenguajeAlgoritmo } from "../ejecucion/catalogo.ts";
import type { Dato, Firma, TipoDato } from "./firmas.ts";

export const SEPARADOR_LISTA = "\x1f";

export function argumento(valor: Dato): string {
  return Array.isArray(valor) ? valor.join(SEPARADOR_LISTA) : String(valor);
}

type Conversores = Record<TipoDato, (arg: string) => string>;

const conversores: Record<LenguajeAlgoritmo, Conversores> = {
  javascript: js(),
  typescript: js(),
  python: {
    entero: (a) => `int(${a})`,
    texto: (a) => a,
    booleano: (a) => `${a} == "true"`,
    enteros: (a) => `[int(x) for x in ${a}.split(chr(31))] if ${a} else []`,
    textos: (a) => `${a}.split(chr(31)) if ${a} else []`,
  },
  ruby: {
    entero: (a) => `Integer(${a})`,
    texto: (a) => a,
    booleano: (a) => `${a} == "true"`,
    enteros: (a) => `${a}.split(31.chr).map(&:to_i)`,
    textos: (a) => `${a}.split(31.chr)`,
  },
  php: {
    entero: (a) => `(int)${a}`,
    texto: (a) => a,
    booleano: (a) => `${a} === "true"`,
    enteros: (a) => `array_map("intval", cifraLista(${a}))`,
    textos: (a) => `cifraLista(${a})`,
  },
  rust: {
    entero: (a) => `${a}.parse::<i32>().unwrap()`,
    texto: (a) => `${a}.clone()`,
    booleano: (a) => `${a} == "true"`,
    enteros: (a) =>
      `${a}.split('\\x1f').filter(|s| !s.is_empty()).map(|s| s.parse::<i32>().unwrap()).collect()`,
    textos: (a) => `${a}.split('\\x1f').filter(|s| !s.is_empty()).map(str::to_owned).collect()`,
  },
  go: {
    entero: (a) => `cifraInt(${a})`,
    texto: (a) => a,
    booleano: (a) => `${a} == "true"`,
    enteros: (a) => `cifraInts(${a})`,
    textos: (a) => `cifraLista(${a})`,
  },
  c: {
    entero: (a) => `atoi(${a})`,
    texto: (a) => a,
    booleano: (a) => `strcmp(${a}, "true") == 0`,
    enteros: (a) => `cifraEnteros(${a})`,
    textos: (a) => `cifraTextos(${a})`,
  },
  cpp: {
    entero: (a) => `std::stoi(${a})`,
    texto: (a) => a,
    booleano: (a) => `std::string(${a}) == "true"`,
    enteros: (a) => `cifraEnteros(${a})`,
    textos: (a) => `cifraTextos(${a})`,
  },
  java: {
    entero: (a) => `Integer.parseInt(${a})`,
    texto: (a) => a,
    booleano: (a) => `Boolean.parseBoolean(${a})`,
    enteros: (a) =>
      `java.util.Arrays.stream(cifraLista(${a})).mapToInt(Integer::parseInt).toArray()`,
    textos: (a) => `cifraLista(${a})`,
  },
  csharp: {
    entero: (a) => `int.Parse(${a})`,
    texto: (a) => a,
    booleano: (a) => `bool.Parse(${a})`,
    enteros: (a) => `System.Array.ConvertAll(CifraLista(${a}), int.Parse)`,
    textos: (a) => `CifraLista(${a})`,
  },
};

function js(): Conversores {
  return {
    entero: (a) => `Number(${a})`,
    texto: (a) => a,
    booleano: (a) => `${a} === "true"`,
    enteros: (a) => `(${a} ? ${a}.split("\\x1f").map(Number) : [])`,
    textos: (a) => `(${a} ? ${a}.split("\\x1f") : [])`,
  };
}

const indiceArgv: Record<LenguajeAlgoritmo, [string, number]> = {
  javascript: ["process.argv", 2],
  typescript: ["process.argv", 2],
  python: ["sys.argv", 1],
  ruby: ["ARGV", 0],
  php: ["$argv", 1],
  rust: ["cifraArgs", 1],
  go: ["os.Args", 1],
  c: ["argv", 1],
  cpp: ["argv", 1],
  java: ["args", 0],
  csharp: ["args", 0],
};

export function arnesAlgoritmo(lenguaje: LenguajeAlgoritmo, firma: Firma): string {
  const [argv, base] = indiceArgv[lenguaje];
  const args = firma.parametros.map(([, tipo], index) =>
    conversores[lenguaje][tipo](`${argv}[${base + index}]`),
  );
  const llamada = `${firma.nombre}(${args.join(", ")})`;
  const lista = firma.devuelve === "textos";
  const booleano = firma.devuelve === "booleano";
  switch (lenguaje) {
    case "javascript":
    case "typescript":
      return `const cifraResultado = ${llamada};
console.log(${lista ? 'cifraResultado.join("\\x1f")' : "String(cifraResultado)"});`;
    case "python":
      return `import sys
cifraResultado = ${llamada}
print(${lista ? "chr(31).join(cifraResultado)" : booleano ? "str(cifraResultado).lower()" : "cifraResultado"})`;
    case "ruby":
      return `cifraResultado = ${llamada}
puts ${lista ? "cifraResultado.join(31.chr)" : "cifraResultado"}`;
    case "php":
      return `function cifraLista(string $s): array { return $s === "" ? [] : explode(chr(31), $s); }
$cifraResultado = ${llamada};
echo ${lista ? "implode(chr(31), $cifraResultado)" : booleano ? '($cifraResultado ? "true" : "false")' : "$cifraResultado"}, PHP_EOL;`;
    case "rust":
      return `fn main() {
    let cifraArgs: Vec<String> = std::env::args().collect();
    let cifraResultado = ${llamada};
    println!("{}", ${lista ? 'cifraResultado.join("\\x1f")' : "cifraResultado"});
}`;
    case "go":
      return `package main
import ("fmt"; "os"; "strconv"; "strings")
func cifraInt(s string) int { n, err := strconv.Atoi(s); if err != nil { panic(err) }; return n }
func cifraLista(s string) []string { if s == "" { return []string{} }; return strings.Split(s, "\\x1f") }
func cifraInts(s string) []int {
    valores := []int{}
    for _, parte := range cifraLista(s) { valores = append(valores, cifraInt(parte)) }
    return valores
}
func main() {
    resultado := ${llamada}
    fmt.Println(${lista ? 'strings.Join(resultado, "\\x1f")' : "resultado"})
}`;
    case "c":
      return `#include <stdio.h>
static CifraTextos cifraTextos(char *s) {
    CifraTextos valores = {calloc(strlen(s) + 1, sizeof(char *)), 0};
    for (char *token = strtok(s, "\\x1f"); token; token = strtok(NULL, "\\x1f"))
        valores.datos[valores.longitud++] = token;
    return valores;
}
static CifraEnteros cifraEnteros(char *s) {
    CifraTextos textos = cifraTextos(s);
    CifraEnteros valores = {calloc(textos.longitud + 1, sizeof(int)), textos.longitud};
    for (size_t i = 0; i < valores.longitud; ++i) valores.datos[i] = atoi(textos.datos[i]);
    free(textos.datos);
    return valores;
}
int main(int argc, char **argv) {
    ${
      lista
        ? `CifraTextos resultado = ${llamada};
    for (size_t i = 0; i < resultado.longitud; ++i) {
        if (i) putchar(31);
        fputs(resultado.datos[i], stdout);
    }
    putchar('\\n');`
        : booleano
          ? `puts(${llamada} ? "true" : "false");`
          : `printf("${firma.devuelve === "texto" ? "%s" : "%d"}\\n", ${llamada});`
    }
    return 0;
}`;
    case "cpp":
      return `#include <iostream>
#include <sstream>
static std::vector<std::string> cifraTextos(const std::string &s) {
    std::istringstream entrada(s);
    std::vector<std::string> valores;
    for (std::string token; std::getline(entrada, token, char(31));) valores.push_back(token);
    return valores;
}
static std::vector<int> cifraEnteros(const std::string &s) {
    std::vector<int> valores;
    for (const auto &token : cifraTextos(s)) valores.push_back(std::stoi(token));
    return valores;
}
int main(int argc, char **argv) {
    ${
      lista
        ? `auto resultado = ${llamada};
    for (size_t i = 0; i < resultado.size(); ++i) {
        if (i) std::cout << char(31);
        std::cout << resultado[i];
    }
    std::cout << '\\n';`
        : `std::cout << std::boolalpha << ${llamada} << '\\n';`
    }
}`;
    case "java":
      return `public class Main {
    private static String[] cifraLista(String s) {
        return s.isEmpty() ? new String[0] : s.split(String.valueOf((char) 31), -1);
    }
    public static void main(String[] args) {
        var resultado = Solution.${llamada};
        System.out.println(${lista ? "String.join(String.valueOf((char) 31), resultado)" : "resultado"});
    }
}`;
    case "csharp":
      return `static class Program {
    static string[] CifraLista(string s) => s.Length == 0 ? new string[0] : s.Split((char)31);
    static void Main(string[] args) {
        var resultado = Solution.${llamada};
        System.Console.WriteLine(${lista ? "string.Join((char)31, resultado)" : booleano ? 'resultado ? "true" : "false"' : "resultado"});
    }
}`;
  }
}
