import { cpSync, globSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

for (const src of globSync('src/**/*.template.*')) {
  const dest = join('dist', relative('src', src));
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
}
