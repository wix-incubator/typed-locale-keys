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
}

interface NestedLocaleValues {
  [key: string]: string | NestedLocaleValues;
}

export class Generator {
  private translationFnName = 'tFn';

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

    const objectStr = this.writeObjectAsStr(await this.sourceFile);

    localeKeysFile.addFunction(this.buildLocaleKeysFn(objectStr));

    await localeKeysFile.save();
  }

  private buildLocaleKeysFn(objectStr: string) {
    const genericName = 'R';

    const generalFn: FunctionDeclarationStructure = {
      kind: StructureKind.Function,
      name: 'localeKeys',
      isExported: true,
      typeParameters: [
        {
          name: genericName
        }
      ],
      parameters: [
        {
          name: this.translationFnName,
          type: `(...args: unknown[]) => ${genericName}`
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

        if (typeof value === 'string') {
          valueToSet = this.buildFunction(localeKey, value);
        } else {
          valueToSet = this.writeObjectAsStr(value, localeKey);
        }

        writer.writeLine(`${key}: ${valueToSet},`);
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
