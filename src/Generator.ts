import fs from 'fs';
import path from 'path';
import util from 'util';

import { unflatten } from 'flat';
import {
  FunctionDeclarationStructure,
  IndentationText,
  Project,
  QuoteKind,
  StructureKind
} from 'ts-morph';

export interface Options {
  srcFile: string;
  outDir: string;
  interpolationSuffix?: string;
  interpolationPrefix?: string;
  translationFunctionTypeImport?: string;
}

interface NestedLocaleValues {
  [key: string]: string | NestedLocaleValues;
}

export class Generator {
  private readonly translationFnName = 'tFn';

  private readonly translationFnTypeName = 'TFn';

  private readonly factoryName = 'localeKeys';

  private readonly resultTypeName = 'LocaleKeys';

  private readonly project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single
    }
  });

  private readonly sourceFile = util
    .promisify(fs.readFile)(this.options.srcFile, 'utf-8')
    .then((json) => JSON.parse(json) as NestedLocaleValues)
    .then((json) => unflatten(json) as NestedLocaleValues);

  constructor(private options: Options) {}

  private get interpolation() {
    return {
      prefix: this.options.interpolationPrefix ?? '{{',
      suffix: this.options.interpolationSuffix ?? '}}'
    };
  }

  public async generate(): Promise<void> {
    const localeKeysFile = this.project.createSourceFile(
      path.join(this.options.outDir, 'localeKeys.ts'),
      '',
      {
        overwrite: true
      }
    );

    localeKeysFile.addStatements(['/* eslint-disable */']);

    if (this.options.translationFunctionTypeImport) {
      const [moduleSpecifier, namedImport] =
        this.options.translationFunctionTypeImport.split('#');

      localeKeysFile.addImportDeclaration({
        kind: StructureKind.ImportDeclaration,
        isTypeOnly: true,
        namedImports: namedImport
          ? [`${namedImport} as ${this.translationFnTypeName}`]
          : [],
        namespaceImport: !namedImport ? this.translationFnTypeName : undefined,
        moduleSpecifier
      });
    }

    const objectStr = this.writeObjectAsStr(await this.sourceFile);

    localeKeysFile.addFunction(this.buildLocaleKeysFn(objectStr));

    localeKeysFile.addTypeAlias({
      kind: StructureKind.TypeAlias,
      name: this.resultTypeName,
      type: `ReturnType<typeof ${this.factoryName}>`,
      isExported: true
    });

    await localeKeysFile.save();
  }

  private buildLocaleKeysFn(objectStr: string) {
    const genericName = 'R';

    const generalFn: FunctionDeclarationStructure = {
      kind: StructureKind.Function,
      name: this.factoryName,
      isExported: true,
      typeParameters: this.options.translationFunctionTypeImport
        ? []
        : [
            {
              name: genericName,
              constraint: `string`
            }
          ],
      parameters: [
        {
          name: this.translationFnName,
          type: this.options.translationFunctionTypeImport
            ? this.translationFnTypeName
            : `(...args: unknown[]) => ${genericName}`
        }
      ],
      statements: `return ${objectStr};`
    };

    return generalFn;
  }

  private writeObjectAsStr(nestedValue: NestedLocaleValues, keyPrefix = '') {
    const writer = this.project.createWriter();

    writer.inlineBlock(() => {
      Object.entries(nestedValue).forEach(([key, value]) => {
        const localeKey = [keyPrefix, key].filter(Boolean).join('.');

        let valueToSet: string;
        let comment = '';

        if (typeof value === 'string') {
          valueToSet = this.buildFunction(localeKey, value);
          comment = ` /* ${value} */`;
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
