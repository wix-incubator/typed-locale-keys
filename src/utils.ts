export const capitalize = (s: string): string =>
  s.replace(/^\S/, (c) => c.toUpperCase());

export const isCapitalized = (s: string): boolean =>
  s.charAt(0) === s.charAt(0).toUpperCase();

export const getInterpolationPrefix = (singleCurlyBraces?: boolean) =>
  singleCurlyBraces ? '{' : '{{';
export const getInterpolationSuffix = (singleCurlyBraces?: boolean) =>
  singleCurlyBraces ? '}' : '}}';

export const isSingleCurlyBraces = (prefix: string) => prefix === '{';

export const getFileExtension = (isReactFile?: boolean): string =>
  isReactFile ? 'tsx' : 'ts';
