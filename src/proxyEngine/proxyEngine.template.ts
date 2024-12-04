const __proxyImplName__ = <R extends string>(
  t = (...[k]: unknown[]) => k as R,
  prevKeys = ''
): unknown =>
  new Proxy((...args: unknown[]) => t(prevKeys, ...args), {
    get: (_, key: string): unknown => {
      let nextKey = prevKeys;

      if (key !== '__ownValueAlias__') {
        nextKey = prevKeys ? [prevKeys, key].join('.') : key;
      }

      return __proxyImplName__(t, nextKey);
    },
  });
