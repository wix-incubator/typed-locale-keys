import { exec } from 'node:child_process';
import fs from 'fs';
import util from 'util';
import Handlebars from 'handlebars';

import { Generator } from '../src/Generator';
import { DEFAULT_FN_NAME } from '../src/constants';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const execAsync = util.promisify(exec);

void (async () => {
  const template = Handlebars.compile(
    await readFile('scripts/README.template.md', 'utf8'),
    {
      noEscape: true,
    }
  );

  const srcFile = 'tests/sources/default.json';

  const [source, output, outputReact, cliHelp] = await Promise.all([
    readFile(srcFile, 'utf8'),
    new Generator({
      srcFile,
      outDir: '',
      functionName: DEFAULT_FN_NAME,
    }).generateAsText(),
    new Generator({
      srcFile,
      outDir: '',
      functionName: DEFAULT_FN_NAME,
      reactBindings: true,
    }).generateAsText(),
    execAsync('ts-node src/bin.ts codegen --help').then(({ stdout }) =>
      stdout.replace(/[^\n]+/, '$ tlk codegen --help\n')
    ),
  ]);

  await writeFile(
    'README.md',
    template({
      source,
      output,
      outputReact,
      cliHelp,
    })
  );
})();
