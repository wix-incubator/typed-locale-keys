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
import { DEFAULT_TYPE_NAME } from './constants';

export interface Options extends GeneratorOptions {
  project: Project;
  sourceFile: Promise<NestedLocaleValues>;
  resultFile: SourceFile;
}

export class ReactWriter {
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

    this.options.resultFile.addVariableStatements([
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: 'localeKeysContext',
            initializer: `React.createContext({} as ${DEFAULT_TYPE_NAME})`
          }
        ]
      },
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: 'LocaleKeysProvider',
            type: 'React.FC<{ tFn(...args: unknown[]): string }>',
            initializer: `({ tFn, children }) => <localeKeysContext.Provider value={${this.options.functionName}(tFn)}>{children}</localeKeysContext.Provider>`
          }
        ]
      },
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: 'useLocaleKeys',
            initializer: `() => React.useContext(localeKeysContext)`
          }
        ]
      }
    ]);
  }
}
