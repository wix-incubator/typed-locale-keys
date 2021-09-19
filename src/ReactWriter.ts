import {
  Project,
  SourceFile,
  StructureKind,
  VariableDeclarationKind
} from 'ts-morph';

import type { NestedLocaleValues, Options } from './Generator';

export class ReactWriter {
  constructor(
    private readonly options: Options,
    private readonly project: Project,
    private readonly sourceFile: Promise<NestedLocaleValues>,
    private readonly resultFile: SourceFile
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  public async write(): Promise<void> {
    this.resultFile.addImportDeclarations([
      {
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier: 'react',
        defaultImport: 'React'
      }
    ]);

    this.resultFile.addVariableStatements([
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: 'localeKeysContext',
            initializer: 'React.createContext({} as LocaleKeys)'
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
            initializer:
              '({ tFn, children }) => <localeKeysContext.Provider value={localeKeys(tFn)}>{children}</localeKeysContext.Provider>'
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
