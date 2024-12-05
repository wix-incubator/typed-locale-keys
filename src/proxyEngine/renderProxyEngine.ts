import { readFileSync } from 'fs';
import { join } from 'path';

export function renderProxyEngine({
  creatorFnName,
  ownValueAlias,
}: {
  creatorFnName: string;
  ownValueAlias: string;
}) {
  return readFileSync(join(__dirname, 'proxyEngine.template.ts'), 'utf-8')
    .replace(/__proxyImplName__/g, creatorFnName)
    .replace(/__ownValueAlias__/g, ownValueAlias);
}
