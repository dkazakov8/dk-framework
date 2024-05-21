import { constants } from './constants';

export function clearDynamic(param: string): string {
  return param.replace(new RegExp(`^${constants.dynamicSeparator}`), '');
}
