import { TypeRoute } from '../types/TypeRoute';

import { constants } from './constants';
import { isDynamic, clearDynamic } from './dynamic';

export function getDynamicValues<TRoute extends TypeRoute>(params: {
  route: TRoute;
  pathname: string;
}): Record<keyof TRoute['params'], string> {
  const { route, pathname } = params;

  const pathnameArray: Array<string> = pathname
    .replace(/\?.+$/, '')
    .split(constants.pathPartSeparator)
    .filter(Boolean);
  const routePathnameArray: Array<keyof TRoute['params']> = route.path
    .split(constants.pathPartSeparator)
    .filter(Boolean) as any;
  const dynamicParams: Record<keyof TRoute['params'], string> = {} as any;

  for (let i = 0; i < routePathnameArray.length; i++) {
    const paramName = routePathnameArray[i];

    // @ts-ignore
    if (isDynamic(paramName)) dynamicParams[clearDynamic(paramName)] = pathnameArray[i];
  }

  return dynamicParams;
}
