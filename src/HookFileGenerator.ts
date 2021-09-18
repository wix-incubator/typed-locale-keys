import path from 'path';

import {
  Project,
  ScriptKind,
  StructureKind,
  VariableDeclarationKind
} from 'ts-morph';

import type { NestedLocaleValues, Options } from './Generator';

export class HookFileGenerator {
  constructor(
    private readonly options: Options,
    private readonly project: Project,
    private readonly sourceFile: Promise<NestedLocaleValues>
  ) {}

  public async generate(): Promise<void> {
    const hookFile = this.project.createSourceFile(
      path.join(this.options.outDir, 'useLocaleKeys.tsx'),
      '',
      {
        overwrite: true,
        scriptKind: ScriptKind.TSX
      }
    );

    hookFile.addStatements(['/* eslint-disable */']);

    hookFile.addImportDeclarations([
      {
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier: 'react',
        defaultImport: 'React'
      },
      {
        kind: StructureKind.ImportDeclaration,
        namedImports: ['LocaleKeys', 'localeKeys'],
        moduleSpecifier: './localeKeys'
      }
    ]);

    hookFile.addVariableStatements([
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
            initializer: `React.useContext(localeKeysContext)`
          }
        ]
      }
    ]);

    await hookFile.save();
  }
}
