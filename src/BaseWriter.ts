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
import { getTypedParams } from './icuParams';
import { isSingleCurlyBraces } from './utils';

export interface Options extends GeneratorOptions {
  project: Project;
  sourceFile: Promise<Record<string, string>>;
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
    this.options.resultFile.addStatements([
      '/* eslint-disable */',
      '/* tslint:disable */',
    ]);

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
          (flatKey) => key !== flatKey && flatKey.startsWith(`${key}.`)
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
          if (this.options.translationFn) {
            valueToSet = this.buildFunction(localeKey, value);
          } else {
            valueToSet = `'${localeKey}'`;
          }

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
    const params = this.buildFunctionParam(value);
    return `(${params}) => ${this.translationFnName}('${key}'${
      params ? ', data' : ''
    })`;
  }

  private buildFunctionParam(value: string) {
    let param = '';
    const icuCompatible = isSingleCurlyBraces(this.interpolation.prefix);
    const interpolationKeys = icuCompatible
      ? getTypedParams(value).map((p) => p.name)
      : this.getInterpolationKeys(value);

    if (interpolationKeys.length) {
      param = `data: Record<${interpolationKeys
        .map((k) => `'${k}'`)
        .join(' | ')}, unknown>`;
    }

    return param;
  }

  private getInterpolationKeys(value: string): string[] {
    const values = [];
    let nextValue = '';
    let isInterpolationInProgress = false;
    let innerBracesOpen = 0;
    const prefixLength = this.interpolation.prefix.length;

    for (let i = 0; i < value.length; i++) {
      const char = value.slice(i, i + prefixLength);
      const skipPrefixSuffix = () => (i += prefixLength - 1);
      if (!isInterpolationInProgress && char === this.interpolation.prefix) {
        isInterpolationInProgress = true;
        skipPrefixSuffix();
        continue;
      }

      if (isInterpolationInProgress) {
        if (char === this.interpolation.prefix) {
          innerBracesOpen++;
          skipPrefixSuffix();
        } else if (char === this.interpolation.suffix) {
          if (innerBracesOpen > 0) {
            innerBracesOpen--;
            skipPrefixSuffix();
          } else {
            values.push(nextValue.split(this.innerInterpolationSeparator)[0]);
            isInterpolationInProgress = false;
            nextValue = '';
            innerBracesOpen = 0;
            continue;
          }
        }

        nextValue += char[0];
      }
    }
    return values;
  }
}
