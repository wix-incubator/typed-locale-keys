import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateFiles } from './generateFiles';

const cliDefinition = yargs(hideBin(process.argv)).command(
  'generate [fileName]',
  'Generates snapshots for tests',
  (y) =>
    y
      .positional('fileName', {
        type: 'string',
        describe: 'Locale JSON file name',
      })
      .option('all', {
        type: 'boolean',
        alias: 'a',
        describe: 'Generate all files in source',
      })
);

void (async () => {
  const {
    argv: { fileName, all },
  } = cliDefinition;
  await generateFiles({ all, fileName, isSnapshot: true });
})();
