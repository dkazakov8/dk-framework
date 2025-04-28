import * as ts from 'typescript';

const ignoreNode = '';

export type TypeCompilerOptions = {
  format?: 'ts';
  ignoreGenerics?: boolean;
  ignoreIndexSignature?: boolean;
  inlineImports?: boolean;
};

const checkerImport = `import * as t from "ts-interface-checker";`;

type TypeKindMapper = {
  [ts.SyntaxKind.Identifier]: ts.Identifier;
  [ts.SyntaxKind.Parameter]: ts.ParameterDeclaration;
  [ts.SyntaxKind.PropertySignature]: ts.PropertySignature;
  [ts.SyntaxKind.MethodSignature]: ts.MethodSignature;
  [ts.SyntaxKind.TypeReference]: ts.TypeReferenceNode;
  [ts.SyntaxKind.FunctionType]: ts.FunctionTypeNode;
  [ts.SyntaxKind.TypeLiteral]: ts.TypeLiteralNode;
  [ts.SyntaxKind.ArrayType]: ts.ArrayTypeNode;
  [ts.SyntaxKind.TupleType]: ts.TupleTypeNode;
  [ts.SyntaxKind.RestType]: ts.RestTypeNode;
  [ts.SyntaxKind.UnionType]: ts.UnionTypeNode;
  [ts.SyntaxKind.IntersectionType]: ts.IntersectionTypeNode;
  [ts.SyntaxKind.LiteralType]: ts.LiteralTypeNode;
  [ts.SyntaxKind.OptionalType]: ts.OptionalTypeNode;
  [ts.SyntaxKind.EnumDeclaration]: ts.EnumDeclaration;
  [ts.SyntaxKind.InterfaceDeclaration]: ts.InterfaceDeclaration;
  [ts.SyntaxKind.TypeAliasDeclaration]: ts.TypeAliasDeclaration;
  [ts.SyntaxKind.ExpressionWithTypeArguments]: ts.ExpressionWithTypeArguments;
  [ts.SyntaxKind.ParenthesizedType]: ts.ParenthesizedTypeNode;
  [ts.SyntaxKind.ExportDeclaration]: ts.ImportDeclaration;
  [ts.SyntaxKind.ImportDeclaration]: ts.ImportDeclaration;
  [ts.SyntaxKind.SourceFile]: ts.SourceFile;
  [ts.SyntaxKind.IndexSignature]: ts.IndexSignatureDeclaration;
  [ts.SyntaxKind.AnyKeyword]: ts.Node;
  [ts.SyntaxKind.NumberKeyword]: ts.Node;
  [ts.SyntaxKind.ObjectKeyword]: ts.Node;
  [ts.SyntaxKind.BooleanKeyword]: ts.Node;
  [ts.SyntaxKind.StringKeyword]: ts.Node;
  [ts.SyntaxKind.SymbolKeyword]: ts.Node;
  [ts.SyntaxKind.ThisKeyword]: ts.Node;
  [ts.SyntaxKind.VoidKeyword]: ts.Node;
  [ts.SyntaxKind.UndefinedKeyword]: ts.Node;
  [ts.SyntaxKind.UnknownKeyword]: ts.Node;
  [ts.SyntaxKind.NullKeyword]: ts.Node;
  [ts.SyntaxKind.NeverKeyword]: ts.Node;
};

const kindMapper: Record<keyof TypeKindMapper, string> = {
  [ts.SyntaxKind.Identifier]: 'Identifier',
  [ts.SyntaxKind.Parameter]: 'Parameter',
  [ts.SyntaxKind.PropertySignature]: 'PropertySignature',
  [ts.SyntaxKind.MethodSignature]: 'MethodSignature',
  [ts.SyntaxKind.TypeReference]: 'TypeReference',
  [ts.SyntaxKind.FunctionType]: 'FunctionType',
  [ts.SyntaxKind.TypeLiteral]: 'TypeLiteral',
  [ts.SyntaxKind.ArrayType]: 'ArrayType',
  [ts.SyntaxKind.TupleType]: 'TupleType',
  [ts.SyntaxKind.RestType]: 'RestType',
  [ts.SyntaxKind.UnionType]: 'UnionType',
  [ts.SyntaxKind.IntersectionType]: 'IntersectionType',
  [ts.SyntaxKind.LiteralType]: 'LiteralType',
  [ts.SyntaxKind.OptionalType]: 'OptionalType',
  [ts.SyntaxKind.EnumDeclaration]: 'EnumDeclaration',
  [ts.SyntaxKind.InterfaceDeclaration]: 'InterfaceDeclaration',
  [ts.SyntaxKind.TypeAliasDeclaration]: 'TypeAliasDeclaration',
  [ts.SyntaxKind.ExpressionWithTypeArguments]: 'ExpressionWithTypeArguments',
  [ts.SyntaxKind.ParenthesizedType]: 'ParenthesizedType',
  [ts.SyntaxKind.ExportDeclaration]: 'ExportDeclaration',
  [ts.SyntaxKind.ImportDeclaration]: 'ImportDeclaration',
  [ts.SyntaxKind.SourceFile]: 'SourceFile',
  [ts.SyntaxKind.IndexSignature]: 'IndexSignature',
  [ts.SyntaxKind.AnyKeyword]: 'AnyKeyword',
  [ts.SyntaxKind.NumberKeyword]: 'NumberKeyword',
  [ts.SyntaxKind.ObjectKeyword]: 'ObjectKeyword',
  [ts.SyntaxKind.BooleanKeyword]: 'BooleanKeyword',
  [ts.SyntaxKind.StringKeyword]: 'StringKeyword',
  [ts.SyntaxKind.SymbolKeyword]: 'SymbolKeyword',
  [ts.SyntaxKind.ThisKeyword]: 'ThisKeyword',
  [ts.SyntaxKind.VoidKeyword]: 'VoidKeyword',
  [ts.SyntaxKind.UndefinedKeyword]: 'UndefinedKeyword',
  [ts.SyntaxKind.UnknownKeyword]: 'UnknownKeyword',
  [ts.SyntaxKind.NullKeyword]: 'NullKeyword',
  [ts.SyntaxKind.NeverKeyword]: 'NeverKeyword',
};

const loggedKinds: Array<keyof TypeKindMapper> = [];

export class Compiler {
  /**
   * This method is modified from original https://github.com/gristlabs/ts-interface-builder
   * We need to pass Array filePaths and a cached program,
   * it improves generation performance by hundreds of times.
   *
   * Also it's useful to get not only content, but filePath in result of compilation
   *
   */

  public static compile(filePaths: Array<string>, compilerOptions?: ts.CompilerOptions) {
    const op = Object.assign({}, compilerOptions, {
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    });

    const createProgramOptions = ts.parseJsonConfigFileContent
      ? ts.parseJsonConfigFileContent(op, ts.sys, './')
      : op;

    // @ts-ignore
    const program = ts.createProgram({ rootNames: filePaths, options: createProgramOptions });
    const checker = program.getTypeChecker();

    const options: TypeCompilerOptions = {
      format: 'ts',
      ignoreGenerics: false,
      ignoreIndexSignature: false,
      inlineImports: false,
    };

    const result = filePaths.map((filePath) => {
      const topNode = program.getSourceFile(filePath);

      if (!topNode) {
        throw new Error(`Can't process ${filePath}: ${collectDiagnostics(program)}`);
      }

      const importedFiles: Array<{ filePath: string; content: string }> = [];

      const content = new Compiler(checker, options, topNode, importedFiles).compileNode(topNode);

      return { filePath, content, importedFiles };
    });

    return { result, program };
  }

  private exportedNames: Array<string> = [];

  // eslint-disable-next-line max-params,no-useless-constructor
  constructor(
    private checker: ts.TypeChecker,
    private options: TypeCompilerOptions,
    private topNode: ts.SourceFile,
    private importedFiles: Array<{ filePath: string; content: string }>
  ) {}

  private getName(id: ts.Node): string {
    const symbol = this.checker.getSymbolAtLocation(id);
    return symbol ? symbol.getName() : 'unknown';
  }

  private indent(content: string): string {
    return content.replace(/\n/g, '\n  ');
  }

  // @ts-ignore
  transformers: { [Key in ts.SyntaxKind]?: (node: TypeKindMapper[Key]) => string } = {
    [ts.SyntaxKind.Identifier]: (node) => `"${node.getText()}"`,
    [ts.SyntaxKind.Parameter]: (node) => {
      const name = this.getName(node.name);
      const isOpt = node.questionToken ? ', true' : '';

      return `t.param("${name}", ${this.compileOptType(node.type)}${isOpt})`;
    },
    [ts.SyntaxKind.PropertySignature]: (node) => {
      const name = this.getName(node.name);
      const prop = this.compileOptType(node.type);
      const value = node.questionToken ? `t.opt(${prop})` : prop;
      return `"${name}": ${value}`;
    },
    [ts.SyntaxKind.MethodSignature]: (node) => {
      const name = this.getName(node.name);
      const params = node.parameters.map(this.compileNode, this);
      const items = [this.compileOptType(node.type)].concat(params);
      return `"${name}": t.func(${items.join(', ')})`;
    },
    [ts.SyntaxKind.TypeReference]: (node) => {
      if (!node.typeArguments) {
        if (node.typeName.kind === ts.SyntaxKind.QualifiedName) {
          const typeNode = this.checker.getTypeFromTypeNode(node);
          // eslint-disable-next-line no-bitwise
          if (typeNode.flags & ts.TypeFlags.EnumLiteral) {
            return `t.enumlit("${node.typeName.left.getText()}", "${node.typeName.right.getText()}")`;
          }
        }
        return `"${node.typeName.getText()}"`;
      } else if (node.typeName.getText() === 'Promise') {
        // Unwrap Promises.
        return this.compileNode(node.typeArguments[0]);
      } else if (node.typeName.getText() === 'Array') {
        return `t.array(${this.compileNode(node.typeArguments[0])})`;
      } else if (this.options.ignoreGenerics) {
        return '"any"';
      }
      throw new Error(`Generics are not yet supported by ts-interface-builder: ${node.getText()}`);
    },
    [ts.SyntaxKind.FunctionType]: (node) => {
      const params = node.parameters.map(this.compileNode, this);
      const items = [this.compileOptType(node.type)].concat(params);
      return `t.func(${items.join(', ')})`;
    },
    [ts.SyntaxKind.TypeLiteral]: (node) => {
      const members = node.members
        .map((n) => this.compileNode(n))
        .filter((n) => n !== ignoreNode)
        .map((n) => `  ${this.indent(n)},\n`);
      return `t.iface([], {\n${members.join('')}})`;
    },
    [ts.SyntaxKind.ArrayType]: (node) => `t.array(${this.compileNode(node.elementType)})`,
    [ts.SyntaxKind.TupleType]: (node) => {
      // @ts-ignore
      const members = (node.elementTypes || node.elements).map(this.compileNode, this);
      return `t.tuple(${members.join(', ')})`;
    },
    [ts.SyntaxKind.RestType]: (node) => {
      if (node.parent.kind !== ts.SyntaxKind.TupleType) {
        throw new Error('Rest type currently only supported in tuples');
      }
      return `t.rest(${this.compileNode(node.type)})`;
    },
    [ts.SyntaxKind.UnionType]: (node) => {
      const members = node.types.map(this.compileNode, this);
      return `t.union(${members.join(', ')})`;
    },
    [ts.SyntaxKind.IntersectionType]: (node) => {
      const members = node.types.map(this.compileNode, this);
      return `t.intersection(${members.join(', ')})`;
    },
    [ts.SyntaxKind.LiteralType]: (node) => `t.lit(${node.getText()})`,
    [ts.SyntaxKind.OptionalType]: (node) => `t.opt(${this.compileNode(node.type)})`,
    [ts.SyntaxKind.EnumDeclaration]: (node) => {
      const name = this.getName(node.name);
      const members: Array<string> = node.members.map(
        (m) =>
          `  "${this.getName(m.name)}": ${getTextOfConstantValue(
            this.checker.getConstantValue(m)
          )},\n`
      );
      this.exportedNames.push(name);
      return this._formatExport(name, `t.enumtype({\n${members.join('')}})`);
    },
    [ts.SyntaxKind.InterfaceDeclaration]: (node) => {
      const name = this.getName(node.name);
      const members = node.members
        .map((n) => this.compileNode(n))
        .filter((n) => n !== ignoreNode)
        .map((n) => `  ${this.indent(n)},\n`);
      const extend: Array<string> = [];
      if (node.heritageClauses) {
        for (const h of node.heritageClauses) {
          extend.push(...h.types.map(this.compileNode, this));
        }
      }
      this.exportedNames.push(name);
      return this._formatExport(name, `t.iface([${extend.join(', ')}], {\n${members.join('')}})`);
    },
    [ts.SyntaxKind.TypeAliasDeclaration]: (node) => {
      const name = this.getName(node.name);
      this.exportedNames.push(name);
      const compiled = this.compileNode(node.type);
      // Turn string literals into explicit `name` nodes, as expected by ITypeSuite.
      const fullType = compiled.startsWith('"') ? `t.name(${compiled})` : compiled;
      return this._formatExport(name, fullType);
    },
    [ts.SyntaxKind.ExpressionWithTypeArguments]: (node) => this.compileNode(node.expression),
    [ts.SyntaxKind.ParenthesizedType]: (node) => this.compileNode(node.type),
    [ts.SyntaxKind.ExportDeclaration]: (node) => {
      const importedSym = this.checker.getSymbolAtLocation(node.moduleSpecifier);
      if (importedSym && importedSym.declarations) {
        importedSym.declarations.forEach((declaration) => {
          const content = this.compileNode(declaration);

          if (content) {
            this.importedFiles.push({
              filePath: declaration.getSourceFile().fileName,
              content: `${checkerImport}\n\n${content}`,
            });
          }
        });

        return node.moduleSpecifier.parent.getText();
      }

      return '';
    },
    [ts.SyntaxKind.ImportDeclaration]: (node) => {
      const importedSym = this.checker.getSymbolAtLocation(node.moduleSpecifier);
      const importText = node.moduleSpecifier.parent.getText();

      if (importedSym?.declarations) {
        importedSym.declarations.forEach((declaration) => {
          const filePath = declaration.getSourceFile().fileName;

          if (this.importedFiles.some((imp) => imp.filePath === filePath)) return;

          const content = this.compileNode(declaration);

          if (content) {
            this.importedFiles.push({
              filePath: declaration.getSourceFile().fileName,
              content: `${checkerImport}\n\n${content}`,
            });
          }
        });

        return importText.replace(/import \{[^}]+\}/, 'export *');
      }

      // if (this.options.inlineImports) {
      //   const importedSym = this.checker.getSymbolAtLocation(node.moduleSpecifier);
      //   if (importedSym && importedSym.declarations) {
      //     // this._compileSourceFile will get called on every imported file when traversing imports.
      //     // it's important to check that _compileSourceFile is being run against the topNode
      //     // before adding the file wrapper for this reason.
      //     return importedSym.declarations
      //       .map((declaration) => this.compileNode(declaration))
      //       .join('');
      //   }
      // }

      return '';
    },
    [ts.SyntaxKind.SourceFile]: (node) => {
      let compiled = this._compileSourceFileStatements(node);

      // for imported source files, skip the wrapper
      if (node !== this.topNode) return compiled;

      const exportedNames = this.exportedNames.filter((name) =>
        ['TypeRequest', 'TypeResponse'].includes(name)
      );

      let counter = -1;
      compiled = compiled.replace(/export \*/g, () => {
        // eslint-disable-next-line no-plusplus
        exportedNames.push(`...AllImports${++counter}`);

        return `import * as AllImports${counter}`;
      });

      return `${checkerImport}
// tslint:disable:object-literal-key-quotes
${compiled}

const exportedTypeSuite: t.ITypeSuite = {
${exportedNames.map((n) => `  ${n},\n`).join('')}};
export default exportedTypeSuite;\n`;
    },
    [ts.SyntaxKind.IndexSignature]: (node) => {
      // This option is supported for backward compatibility.
      if (this.options.ignoreIndexSignature) {
        return ignoreNode;
      }

      if (!node.type) {
        throw new Error(`Node ${ts.SyntaxKind[node.kind]} must have a type`);
      }
      const type = this.compileNode(node.type);
      return `[t.indexKey]: ${type}`;
    },
    [ts.SyntaxKind.AnyKeyword]: () => '"any"',
    [ts.SyntaxKind.NumberKeyword]: () => '"number"',
    [ts.SyntaxKind.ObjectKeyword]: () => '"object"',
    [ts.SyntaxKind.BooleanKeyword]: () => '"boolean"',
    [ts.SyntaxKind.StringKeyword]: () => '"string"',
    [ts.SyntaxKind.SymbolKeyword]: () => '"symbol"',
    [ts.SyntaxKind.ThisKeyword]: () => '"this"',
    [ts.SyntaxKind.VoidKeyword]: () => '"void"',
    [ts.SyntaxKind.UndefinedKeyword]: () => '"undefined"',
    [ts.SyntaxKind.UnknownKeyword]: () => '"unknown"',
    [ts.SyntaxKind.NullKeyword]: () => '"null"',
    [ts.SyntaxKind.NeverKeyword]: () => '"never"',
  };

  private compileNode(node: ts.Node): string {
    const transformer = this.transformers[node.kind];

    if (transformer) {
      const result = transformer(node as any);

      if (loggedKinds.includes(node.kind as keyof TypeKindMapper)) {
        // eslint-disable-next-line no-console
        console.log(
          `\n*** ${kindMapper[node.kind as keyof TypeKindMapper] || node.kind}\n`,
          result
        );
      }

      return result;
    }

    // Skip top-level statements that we haven't handled.
    if (ts.isSourceFile(node.parent!)) {
      return '';
    }
    throw new Error(
      `Node ${ts.SyntaxKind[node.kind]} not supported by ts-interface-builder: ${node.getText()}`
    );
  }
  private compileOptType(typeNode: ts.Node | undefined): string {
    return typeNode ? this.compileNode(typeNode) : '"any"';
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _compileSourceFileStatements(node: ts.SourceFile): string {
    return node.statements
      .map((n) => this.compileNode(n))
      .filter((s) => s)
      .join('\n\n');
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _formatExport(name: string, expression: string): string {
    return `export const ${name} = ${expression};`;
  }
}

function getTextOfConstantValue(value: string | number | undefined): string {
  // Typescript has methods to escape values, but doesn't seem to expose them at all. Here I am
  // casting `ts` to access this private member rather than implementing my own.
  return value === undefined ? 'undefined' : (ts as any).getTextOfConstantValue(value);
}

function collectDiagnostics(program: ts.Program) {
  const diagnostics = ts.getPreEmitDiagnostics(program);
  return ts.formatDiagnostics(diagnostics, {
    getCurrentDirectory() {
      return process.cwd();
    },
    getCanonicalFileName(fileName: string) {
      return fileName;
    },
    getNewLine() {
      return '\n';
    },
  });
}
