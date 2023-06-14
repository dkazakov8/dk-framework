import { constants } from './constants';

export function isDynamic(param: string): boolean {
  // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
  return param[0] === constants.dynamicSeparator;
}
