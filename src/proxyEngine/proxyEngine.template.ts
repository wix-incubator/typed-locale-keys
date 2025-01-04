import { pathgen } from 'object-path-generator';

const __proxyImplName__ = <R extends string>(
  t = (...[k]: unknown[]) => k as R
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
) =>
  pathgen<R>(undefined, (path: string, ...options: any[]) => {
    const finalPath = path.split('.__ownValueAlias__')[0];
    return t(finalPath, ...options);
  }) as unknown;
