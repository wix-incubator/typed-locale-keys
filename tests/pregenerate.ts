import { generateFiles } from './generateFiles';

void (async () => {
  await generateFiles({ all: true, isSnapshot: false });
})();
