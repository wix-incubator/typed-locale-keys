import fs from 'fs';
import util from 'util';

import Handlebars from 'handlebars';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

void (async () => {
  const template = Handlebars.compile(
    await readFile('scripts/generate-docs/README.template.md', 'utf8')
  );

  await writeFile(
    'README.md',
    template({
      source: '',
      output: '',
      outputReact: '',
      cliHelp: ''
    })
  );
})();
