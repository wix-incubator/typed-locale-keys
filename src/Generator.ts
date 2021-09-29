import fs from 'fs';
import path from 'path';
import util from 'util';

import { flatten } from 'flat';
import { IndentationText, Project, QuoteKind, ScriptKind } from 'ts-morph';

import { BaseWriter } from './BaseWriter';
import { ReactWriter } from './ReactWriter';
import { DEFAULT_FN_NAME, DEFAULT_TYPE_NAME } from './constants';
import { capitalize, isCapitalized } from './utils';

export interface Options {
  srcFile: string;
  outDir: string;
  functionName: string;
  interpolationSuffix?: string;
  interpolationPrefix?: string;
  translationFunctionTypeImport?: string;
  showTranslations?: boolean;
  reactBindings?: boolean;
  translationFn?: boolean;
  dynamicNaming?: boolean;
  flatten?: boolean;
}

export interface NestedLocaleValues {
  [key: string]: string | NestedLocaleValues;
}

export class Generator {
  private readonly project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single
    }
  });

  private get functionName() {
    return this.options.functionName ?? DEFAULT_FN_NAME;
  }

  private get translateFn() {
    return this.options.translationFn ?? true;
  }

  private get typeName() {
    let name = DEFAULT_TYPE_NAME;

    const isPascalCased = isCapitalized(this.options.functionName);

    if (this.options.dynamicNaming && this.options.functionName) {
      name = isPascalCased
        ? `I${this.options.functionName}`
        : capitalize(this.options.functionName);
    }

    return name;
  }

  private readonly sourceFile = util
    .promisify(fs.readFile)(this.options.srcFile, 'utf-8')
    .then((json) => JSON.parse(json) as NestedLocaleValues)
    .then((json) => flatten(json) as NestedLocaleValues);

  constructor(private options: Options) {}

  public async generate(): Promise<void> {
    const resultFile = this.project.createSourceFile(
      path.join(
        this.options.outDir,
        `${this.functionName}.${this.options.reactBindings ? 'tsx' : 'ts'}`
      ),
      '',
      {
        overwrite: true,
        scriptKind: this.options.reactBindings ? ScriptKind.TSX : ScriptKind.TS
      }
    );

    await new BaseWriter({
      ...this.options,
      project: this.project,
      sourceFile: this.sourceFile,
      functionName: this.functionName,
      translationFn: this.translateFn,
      typeName: this.typeName,
      resultFile
    }).write();

    if (this.options.reactBindings) {
      await new ReactWriter({
        ...this.options,
        project: this.project,
        functionName: this.functionName,
        translationFn: this.translateFn,
        typeName: this.typeName,
        resultFile
      }).write();
    }

    await resultFile.save();
  }
}
