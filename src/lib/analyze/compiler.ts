import ts from "typescript";

export const MAXIMO_CODIGO_CIFRA = 12_000;

export type DiagnosticoCifra = {
  regla: string;
  mensaje: string;
  linea: number;
  columna: number;
  concepto: "funcion" | "arreglo" | "condicion" | "compilador";
};

const K = ts.SyntaxKind;
const permitidos = new Set<ts.SyntaxKind>([
  K.SourceFile,
  K.EndOfFileToken,
  K.Identifier,
  K.NumericLiteral,
  K.StringLiteral,
  K.TrueKeyword,
  K.FalseKeyword,
  K.NullKeyword,
  K.NumberKeyword,
  K.StringKeyword,
  K.BooleanKeyword,
  K.VoidKeyword,
  K.LiteralType,
  K.ArrayType,
  K.UnionType,
  K.ParenthesizedType,
  K.FunctionDeclaration,
  K.Parameter,
  K.Block,
  K.ReturnStatement,
  K.IfStatement,
  K.VariableStatement,
  K.VariableDeclarationList,
  K.VariableDeclaration,
  K.ParenthesizedExpression,
  K.ArrayLiteralExpression,
  K.ElementAccessExpression,
  K.PropertyAccessExpression,
  K.CallExpression,
  K.BinaryExpression,
  K.PrefixUnaryExpression,
  K.PlusToken,
  K.MinusToken,
  K.AsteriskToken,
  K.SlashToken,
  K.PercentToken,
  K.EqualsEqualsEqualsToken,
  K.ExclamationEqualsEqualsToken,
  K.LessThanToken,
  K.GreaterThanToken,
  K.LessThanEqualsToken,
  K.GreaterThanEqualsToken,
  K.AmpersandAmpersandToken,
  K.BarBarToken,
]);

const nombre = "/programa.cifra.ts";
const biblioteca = "/colecciones.d.ts";
const colecciones = "interface Array<T> { readonly length: number; readonly [indice: number]: T; }";

export function comprobarCifra(codigo: string): DiagnosticoCifra[] {
  if (codigo.length > MAXIMO_CODIGO_CIFRA) {
    return [
      {
        regla: "Límite",
        mensaje: "Reduce el programa a 12 000 caracteres.",
        linea: 1,
        columna: 1,
        concepto: "compilador",
      },
    ];
  }
  const fuente = ts.createSourceFile(nombre, codigo, ts.ScriptTarget.ES2022, true);
  const diagnosticos: DiagnosticoCifra[] = [];
  const informar = (
    posicion: number,
    regla: string,
    mensaje: string,
    concepto: DiagnosticoCifra["concepto"],
  ) => {
    const { line, character } = fuente.getLineAndCharacterOfPosition(posicion);
    diagnosticos.push({ regla, mensaje, linea: line + 1, columna: character + 1, concepto });
  };

  const scanner = ts.createScanner(
    ts.ScriptTarget.ES2022,
    false,
    ts.LanguageVariant.Standard,
    codigo,
  );
  for (let token = scanner.scan(); token !== K.EndOfFileToken; token = scanner.scan()) {
    if (
      (token === K.SingleLineCommentTrivia || token === K.MultiLineCommentTrivia) &&
      /@(?:ts-|jsx|module|import|typedef)|^\s*\/\/\//i.test(scanner.getTokenText())
    ) {
      informar(
        scanner.getTokenPos(),
        "Directivas",
        "Usa comentarios descriptivos. Las directivas del compilador quedan fuera del lenguaje Cifra.",
        "compilador",
      );
    }
  }
  if (diagnosticos.length) return diagnosticos;

  const archivos = new Map([
    [nombre, fuente],
    [biblioteca, ts.createSourceFile(biblioteca, colecciones, ts.ScriptTarget.ES2022)],
  ]);
  const programa = ts.createProgram(
    [nombre, biblioteca],
    {
      noLib: true,
      noResolve: true,
      types: [],
      noEmit: true,
      strict: true,
      noImplicitReturns: true,
      noUncheckedIndexedAccess: true,
      target: ts.ScriptTarget.ES2022,
    },
    {
      getSourceFile: (ruta) => archivos.get(ruta),
      getDefaultLibFileName: () => biblioteca,
      writeFile: () => {},
      getCurrentDirectory: () => "/",
      getCanonicalFileName: (ruta) => ruta,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => "\n",
      fileExists: (ruta) => archivos.has(ruta),
      readFile: (ruta) => archivos.get(ruta)?.text,
    },
  );

  const informarCompilador = (diagnostico: ts.Diagnostic) => {
    const mensaje = ts.flattenDiagnosticMessageText(diagnostico.messageText, "\n");
    const posicion = diagnostico.start ?? 0;
    switch (diagnostico.code) {
      case 2304:
      case 2552:
        informar(
          posicion,
          "Nombre desconocido",
          "Declara el nombre antes de usarlo o revisa cómo lo escribiste. " + mensaje,
          "compilador",
        );
        break;
      case 2322:
      case 2345:
      case 2365:
        informar(
          posicion,
          "Tipos compatibles",
          "El valor debe respetar el tipo que pide esta operación. " + mensaje,
          mensaje.includes("undefined") ? "arreglo" : "compilador",
        );
        break;
      case 2366:
      case 7030:
      case 2355:
        informar(
          posicion,
          "Retorno completo",
          "Revisa que cada camino de la función devuelva el tipo prometido.",
          "funcion",
        );
        break;
      case 2531:
      case 2532:
      case 18047:
      case 18048:
      case 18049:
        informar(
          posicion,
          "Valor presente",
          "Comprueba que el valor existe antes de usarlo. " + mensaje,
          "condicion",
        );
        break;
      default:
        informar(
          posicion,
          diagnostico.code < 2000 ? "Sintaxis" : "Comprobación estática",
          mensaje,
          "compilador",
        );
    }
  };

  programa.getSyntacticDiagnostics(fuente).forEach(informarCompilador);
  if (diagnosticos.length) return diagnosticos;

  const visitar = (nodo: ts.Node) => {
    if (!permitidos.has(nodo.kind)) {
      informar(
        nodo.getStart(fuente),
        "Construcción no admitida",
        "Usa tipos básicos, listas, variables, funciones y condiciones del lenguaje Cifra.",
        "compilador",
      );
      return;
    }
    if (ts.isFunctionDeclaration(nodo) && (!nodo.name || !nodo.body || !nodo.type)) {
      informar(
        nodo.getStart(fuente),
        "Firma de función",
        "Escribe el nombre, el tipo de retorno y el cuerpo de la función.",
        "funcion",
      );
    }
    if (ts.isParameter(nodo) && !nodo.type) {
      informar(
        nodo.getStart(fuente),
        "Tipo del parámetro",
        "Indica el tipo de este parámetro en la firma.",
        "funcion",
      );
    }
    ts.forEachChild(nodo, visitar);
  };
  visitar(fuente);
  if (!fuente.statements.length) {
    informar(0, "Programa vacío", "Escribe al menos una declaración para comprobar.", "compilador");
  }
  if (diagnosticos.length) return diagnosticos;

  programa.getSemanticDiagnostics(fuente).forEach(informarCompilador);
  return diagnosticos;
}
