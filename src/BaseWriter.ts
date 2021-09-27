import {
  FunctionDeclarationStructure,
  Project,
  SourceFile,
  StructureKind
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

export class BaseWriter {
  private readonly translationFnName = 't';

  private readonly translationFnTypeName = 'T';

  private get interpolation() {
    return {
      prefix: this.options.interpolationPrefix ?? '{{',
      suffix: this.options.interpolationSuffix ?? '}}'
    };
  }

  constructor(private readonly options: Options) {}

  public async write(): Promise<void> {
    this.options.resultFile.addStatements(['/* eslint-disable */']);

    if (this.options.translationFunctionTypeImport) {
      const [moduleSpecifier, namedImport] =
        this.options.translationFunctionTypeImport.split('#');

      this.options.resultFile.addImportDeclaration({
        kind: StructureKind.ImportDeclaration,
        isTypeOnly: true,
        namedImports: namedImport
          ? [`${namedImport} as ${this.translationFnTypeName}`]
          : [],
        namespaceImport: !namedImport ? this.translationFnTypeName : undefined,
        moduleSpecifier
      });
    }

    const objectStr = this.writeObjectAsStr(await this.options.sourceFile);

    this.options.resultFile.addFunction(this.buildLocaleKeysFn(objectStr));

    this.options.resultFile.addTypeAlias({
      kind: StructureKind.TypeAlias,
      name: DEFAULT_TYPE_NAME,
      type: `ReturnType<typeof ${this.options.functionName}>`,
      isExported: true
    });
  }

  private buildLocaleKeysFn(objectStr: string) {
    const genericName = 'R';

    const generalFn: FunctionDeclarationStructure = {
      kind: StructureKind.Function,
      name: this.options.functionName,
      isExported: true,
      typeParameters:
        this.options.translationFunctionTypeImport ||
        !this.options.translationFn
          ? []
          : [
              {
                name: genericName,
                constraint: `string`
              }
            ],
      parameters: this.options.translationFn
        ? [
            {
              name: this.translationFnName,
              type: this.options.translationFunctionTypeImport
                ? this.translationFnTypeName
                : `(...args: unknown[]) => ${genericName}`
            }
          ]
        : [],
      statements: `return ${objectStr};`
    };

    return generalFn;
  }

  private writeObjectAsStr(nestedValue: NestedLocaleValues, keyPrefix = '') {
    const writer = this.options.project.createWriter();

    writer.inlineBlock(() => {
      Object.entries(nestedValue).forEach(([key, value]) => {
        const localeKey = [keyPrefix, key].filter(Boolean).join('.');

        let valueToSet: string;
        let comment = '';

        if (typeof value === 'string') {
          valueToSet = this.options.translationFn
            ? this.buildFunction(localeKey, value)
            : `'${localeKey}'`;

          if (this.options.showTranslations) {
            comment = ` /* ${value} */`;
          }
        } else {
          valueToSet = this.writeObjectAsStr(value, localeKey);
        }

        writer.writeLine(`${key}: ${valueToSet},${comment}`);
      });
    });

    return writer.toString();
  }

  private buildFunction(key: string, value: string): string {
    const interpolationKeys = this.getInterpolationKeys(value);

    let param = '';
    let secondCallParam = '';

    if (interpolationKeys.length) {
      param = `data: Record<${interpolationKeys
        .map((k) => `'${k}'`)
        .join(' | ')}, unknown>`;
      secondCallParam = ', data';
    }

    return `(${param}) => ${this.translationFnName}('${key}'${secondCallParam})`;
  }

  private getInterpolationKeys(value: string): string[] {
    const [, first, ...tail] = value.split(this.interpolation.prefix);

    const [firstKey] = first?.split(this.interpolation.suffix) ?? [];

    return tail
      .reduce(
        (result, substr) => {
          if (substr.includes(this.interpolation.suffix)) {
            const [nextKey] = substr.split(this.interpolation.suffix);

            result.push(nextKey);
          }

          return result;
        },
        [firstKey]
      )
      .filter(Boolean);
  }
}
