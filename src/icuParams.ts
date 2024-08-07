import parse, { AST, Element, SubMessages } from 'format-message-parse';

interface Param {
  name: string;
}

type Format =
  | 'plural'
  | 'selectordinal'
  | 'date'
  | 'time'
  | 'select'
  | 'number';

const isPlural = (format: Format): boolean => {
  return format === 'plural' || format === 'selectordinal';
};

const isSelect = (format: Format): boolean => {
  return format === 'select';
};

const hasHashtagOnly = (element: Element | undefined): boolean => {
  return element!.length === 1 && element![0] === '#';
};

const isStringOnly = (element: Format | undefined): boolean => {
  return typeof element === 'string';
};

const isValidSubMessages = (subMessages: {} | undefined): boolean => {
  return typeof subMessages === 'object';
};

const getSubMessages = (
  element: Element | undefined,
  format: Format
): SubMessages | undefined => {
  if (element) {
    let subMessages: SubMessages | undefined;
    if (isPlural(format)) {
      subMessages = element[3] as SubMessages;
    } else if (isSelect(format)) {
      subMessages = element[2] as SubMessages;
    }
    if (isValidSubMessages(subMessages)) {
      return subMessages as SubMessages;
    }
  }
  return undefined;
};

const stackWithSubMessages = (
  stack: Element[],
  subMessages: SubMessages
): Element[] => {
  // eslint-disable-next-line prefer-spread
  return stack.concat.apply(stack, Object.values(subMessages));
};

const getParamsFromPatternAst = (parsedArray: AST): Param[] => {
  if (!parsedArray || !parsedArray.slice) return [];
  let stack = parsedArray.slice();
  const params: Param[] = [];
  const used = new Set();
  while (stack.length) {
    const element = stack.pop();
    if (isStringOnly(element as Format)) continue;
    if (hasHashtagOnly(element)) continue;

    const [name, format] = element!;

    if (!used.has(name)) {
      params.push({ name: name as string });
      used.add(name);
    }

    const subMessages = getSubMessages(element, format as Format);
    if (subMessages) {
      stack = stackWithSubMessages(stack, subMessages);
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
