import fs from 'fs';
import path from 'path';
import util from 'util';

import { unflatten } from 'flat';
import { IndentationText, Project, QuoteKind, ScriptKind } from 'ts-morph';

import { BaseWriter } from './BaseWriter';
import { ReactWriter } from './ReactWriter';
import { DEFAULT_FN_NAME } from './constants';

export interface Options {
  srcFile: string;
  outDir: string;
  interpolationSuffix?: string;
  interpolationPrefix?: string;
  translationFunctionTypeImport?: string;
  showTranslations?: boolean;
  reactBindings?: boolean;
  functionName?: string;
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

  private readonly sourceFile = util
    .promisify(fs.readFile)(this.options.srcFile, 'utf-8')
    .then((json) => JSON.parse(json) as NestedLocaleValues)
    .then((json) => unflatten(json) as NestedLocaleValues);

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
      resultFile
    }).write();

    if (this.options.reactBindings) {
      await new ReactWriter({
        ...this.options,
        project: this.project,
        sourceFile: this.sourceFile,
        functionName: this.functionName,
        resultFile
      }).write();
    }

    await resultFile.save();
  }
}
