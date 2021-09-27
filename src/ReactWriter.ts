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
import { IMPORTED_TRANSLATION_FN_TYPE_NAME } from './constants';
import { capitalize } from './utils';

export interface Options extends GeneratorOptions {
  project: Project;
  sourceFile: Promise<NestedLocaleValues>;
  resultFile: SourceFile;
  typeName: string;
}

export class ReactWriter {
  private contextName = 'LocaleKeysContext';

  private readonly translateFnProp = 'translateFn';

  private readonly localeKeysProp = 'localeKeys';

  private readonly translationFnTypeName = IMPORTED_TRANSLATION_FN_TYPE_NAME;

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

    const writer = this.options.project.createWriter();

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
            type: `React.FC<{ ${this.translateFnProp}?: ${
              this.options.translationFunctionTypeImport
                ? this.translationFnTypeName
                : `(...args: unknown[]) => string`
            }; ${this.localeKeysProp}?: ${this.options.typeName} }>`,
            initializer: `({ ${this.translateFnProp}, ${
              this.localeKeysProp
            }, children }) => ${writer.inlineBlock(() => {
              writer.writeLine(
                `if (!${this.translateFnProp} && !${this.localeKeysProp}) { throw new Error('Either ${this.translateFnProp} or ${this.localeKeysProp} must be provided') }`
              );
              writer.writeLine(
                `const value = (typeof ${this.translateFnProp} === 'function' ? ${this.options.functionName}(${this.translateFnProp}) : ${this.localeKeysProp}) as ${this.options.typeName}`
              );
              writer.writeLine(
                `return <${this.contextName}.Provider value={value}>{children}</${this.contextName}.Provider>;`
              );
            })}`
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
