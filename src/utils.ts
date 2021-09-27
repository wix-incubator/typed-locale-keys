export const capitalize = (s: string): string =>
  s.replace(/^\S/, (c) => c.toUpperCase());

export const isCapitalized = (s: string): boolean =>
  s.charAt(0) === s.charAt(0).toUpperCase();
