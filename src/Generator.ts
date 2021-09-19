import fs from 'fs';
import path from 'path';
import util from 'util';

import { unflatten } from 'flat';
import { IndentationText, Project, QuoteKind, ScriptKind } from 'ts-morph';

import { BaseWriter } from './BaseWriter';
import { ReactWriter } from './ReactWriter';

export interface Options {
  srcFile: string;
  outDir: string;
  interpolationSuffix?: string;
  interpolationPrefix?: string;
  translationFunctionTypeImport?: string;
  showTranslations?: boolean;
  reactBindings?: boolean;
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

  private readonly sourceFile = util
    .promisify(fs.readFile)(this.options.srcFile, 'utf-8')
    .then((json) => JSON.parse(json) as NestedLocaleValues)
    .then((json) => unflatten(json) as NestedLocaleValues);

  constructor(private options: Options) {}

  public async generate(): Promise<void> {
    const resultFile = this.project.createSourceFile(
      path.join(
        this.options.outDir,
        `localeKeys.${this.options.reactBindings ? 'tsx' : 'ts'}`
      ),
      '',
      {
        overwrite: true,
        scriptKind: this.options.reactBindings ? ScriptKind.TSX : ScriptKind.TS
      }
    );

    await new BaseWriter(
      this.options,
      this.project,
      this.sourceFile,
      resultFile
    ).write();

    if (this.options.reactBindings) {
      await new ReactWriter(
        this.options,
        this.project,
        this.sourceFile,
        resultFile
      ).write();
    }

    await resultFile.save();
  }
}
