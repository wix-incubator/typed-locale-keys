import fs from 'fs';
import util from 'util';

import { unflatten } from 'flat';
import { IndentationText, Project, QuoteKind } from 'ts-morph';

import { BaseFileGenerator } from './BaseFileGenerator';
import { HookFileGenerator } from './HookFileGenerator';

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
    await Promise.all(
      [
        new BaseFileGenerator(
          this.options,
          this.project,
          this.sourceFile
        ).generate(),
        this.options.reactBindings &&
          new HookFileGenerator(
            this.options,
            this.project,
            this.sourceFile
          ).generate()
      ].filter((v): v is Promise<void> => !!v)
    );
  }
}
