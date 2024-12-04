export function proxyImplementationTemplate({
  creatorFnName,
  ownValueAlias,
  useTranslateFn,
}: {
  creatorFnName: string;
  ownValueAlias: string;
  useTranslateFn: boolean;
}) {
  return `const ${creatorFnName} = <R extends string>(t: (...args: unknown[]) => R = (k) => k as R, prevKeys: string = ''): unknown => 
  new Proxy({}, {
    get: (_, key: string) => {
      if (key === '${ownValueAlias}}') {
        return ${creatorFnName}(t, prevKeys)
      }

      if (prevKeys) {
        return ${creatorFnName}(t, [prevKeys, key].join('.'));
      }

      return ${creatorFnName}(t, key);
    },
    apply: (_, __, argArray) => {
      return ${useTranslateFn ? `t(prevKeys, ...argArray)` : 'prevKeys'};
    },
  });`;
}
