import parse, { AST, Element } from 'format-message-parse';

interface Param {
  name: string;
  type: string;
}

const formatToType = (
  format?: Element,
  children?: Record<string, any> | string
): string => {
  if (format === 'plural' || format === 'selectordinal') {
    return 'number';
  } else if (format === 'date' || format === 'time') {
    return 'Date';
  } else if (format === 'select') {
    return Object.keys(children!)
      .map((c) => `'${c}'`)
      .join(' | ');
  }
  return 'string';
};

const getParamsFromPatternAst = (ast: AST): Param[] => {
  if (!ast || !ast.slice) return [];
  let stack = ast.slice();
  const params: Param[] = [];
  const used = new Set();
  while (stack.length) {
    const element = stack.pop();
    if (typeof element === 'string') continue;
    if (element!.length === 1 && element![0] === '#') continue;

    const [name, format] = element!;
    const children = (element![3] || element![2]) as unknown as {};
    const type = formatToType(format, children);

    if (!used.has(name)) {
      params.push({ name, type });
      used.add(name);
    }

    if (typeof children === 'object') {
      // eslint-disable-next-line prefer-spread
      stack = stack.concat.apply(stack, Object.values(children));
    }
  }
  return params.reverse();
};

export const getTypedParams = (text: string): Param[] => {
  try {
    return getParamsFromPatternAst(parse(text));
  } catch (e) {
    return [];
  }
};
