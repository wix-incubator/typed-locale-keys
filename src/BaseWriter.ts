import { unflatten } from 'flat';
import {
  FunctionDeclarationStructure,
  Project,
  SourceFile,
  StructureKind,
} from 'ts-morph';

import type {
  Options as GeneratorOptions,
  NestedLocaleValues,
} from './Generator';
import { IMPORTED_TRANSLATION_FN_TYPE_NAME } from './constants';

export interface Options extends GeneratorOptions {
  project: Project;
  sourceFile: Promise<NestedLocaleValues>;
  resultFile: SourceFile;
  typeName: string;
}

export class BaseWriter {
  private readonly translationFnName = 't';

  private readonly translationFnTypeName = IMPORTED_TRANSLATION_FN_TYPE_NAME;

  private readonly keySeparator = '.';

  private readonly innerInterpolationSeparator = ',';

  private readonly rootKey = '$value';

  private get interpolation() {
    return {
      prefix: this.options.interpolationPrefix ?? '{{',
      suffix: this.options.interpolationSuffix ?? '}}',
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
        moduleSpecifier,
      });
    }

    const source = await this.options.sourceFile;

    const objectStr = this.writeObjectAsStr(source);

    this.options.resultFile.addFunction(this.buildLocaleKeysFn(objectStr));

    this.options.resultFile.addTypeAlias({
      kind: StructureKind.TypeAlias,
      name: this.options.typeName,
      type: `ReturnType<typeof ${this.options.functionName}>`,
      isExported: true,
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
                constraint: 'string',
              },
            ],
      parameters: this.options.translationFn
        ? [
            {
              name: this.translationFnName,
              type: this.options.translationFunctionTypeImport
                ? this.translationFnTypeName
                : `(...args: unknown[]) => ${genericName}`,
            },
          ]
        : [],
      statements: `return ${objectStr};`,
    };

    return generalFn;
  }

  private writeObjectAsStr(flatValue: NestedLocaleValues, keyPrefix = '') {
    const writer = this.options.project.createWriter();

    const flatKeys = Object.keys(flatValue);

    let objectToHandle: NestedLocaleValues = Object.fromEntries(
      Object.entries(flatValue).map(([key, value]) => {
        const isParentKey = flatKeys.some(
          (flatKey) => new RegExp(`${key}\..+`).test(flatKey) // eslint-disable-line no-useless-escape
        );

        if (isParentKey) {
          return [[key, this.rootKey].join(this.keySeparator), value];
        }

        return [key, value];
      })
    );

    objectToHandle = this.options.flatten
      ? objectToHandle
      : unflatten(objectToHandle);

    writer.inlineBlock(() => {
      Object.entries(objectToHandle).forEach(([key, value]) => {
        const localeKey =
          key === this.rootKey
            ? keyPrefix
            : [keyPrefix, key].filter(Boolean).join('.');

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

        const keyToSet = /([^A-z0-9_$]|^[0-9])/.test(key) ? `'${key}'` : key;

        writer.writeLine(`${keyToSet}: ${valueToSet},${comment}`);
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

    const extractInterpolationValue = (str: string): string => {
      const [result] = str.split(this.innerInterpolationSeparator);
      return result;
    };

    return tail
      .reduce(
        (result, substr) => {
          if (substr.includes(this.interpolation.suffix)) {
            const [nextKey] = substr.split(this.interpolation.suffix);
            result.push(extractInterpolationValue(nextKey));
          }

          return result;
        },
        firstKey ? [extractInterpolationValue(firstKey)] : []
      )
      .filter(Boolean);
  }
}
