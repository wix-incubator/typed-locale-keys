import {
  Project,
  SourceFile,
  StructureKind,
  VariableDeclarationKind
} from 'ts-morph';

import type {
  Options as GeneratorOptions,
  NestedLocaleValues
} from './Generator';
import { capitalize } from './utils';

export interface Options extends GeneratorOptions {
  project: Project;
  sourceFile: Promise<NestedLocaleValues>;
  resultFile: SourceFile;
  typeName: string;
}

export class ReactWriter {
  private contextName = 'LocaleKeysContext';

  constructor(private readonly options: Options) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  public async write(): Promise<void> {
    this.options.resultFile.addImportDeclarations([
      {
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier: 'react',
        defaultImport: 'React'
      }
    ]);

    const capitalFnName = capitalize(this.options.functionName);

    this.options.resultFile.addVariableStatements([
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: this.contextName,
            initializer: `React.createContext({} as ${this.options.typeName})`
          }
        ]
      },
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: this.options.dynamicNaming
              ? `${capitalFnName}Provider`
              : 'LocaleKeysProvider',
            type: 'React.FC<{ tFn(...args: unknown[]): string }>',
            initializer: `({ tFn, children }) => <${this.contextName}.Provider value={${this.options.functionName}(tFn)}>{children}</${this.contextName}.Provider>`
          }
        ]
      },
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: this.options.dynamicNaming
              ? `use${capitalFnName}`
              : 'useLocaleKeys',
            initializer: `() => React.useContext(${this.contextName})`
          }
        ]
      }
    ]);
  }
}
