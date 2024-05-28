import { TypeRoute } from '../types/TypeRoute';

import { constants } from './constants';
import { isDynamic } from './isDynamic';
import { clearDynamic } from './clearDynamic';

export function getDynamicValues<TRouteItem extends TypeRoute>(params: {
  routesObject: TRouteItem;
  pathname: string;
}): Record<keyof TRouteItem['params'], string> {
  const { routesObject, pathname } = params;

  const pathnameArray: Array<string> = pathname.split(constants.pathPartSeparator).filter(Boolean);
  const routePathnameArray: Array<keyof TRouteItem['params']> = routesObject.path
    .split(constants.pathPartSeparator)
    .filter(Boolean) as any;
  const dynamicParams: Record<keyof TRouteItem['params'], string> = {} as any;

  for (let i = 0; i < routePathnameArray.length; i++) {
    const paramName = routePathnameArray[i];

    // @ts-ignore
    if (isDynamic(paramName)) dynamicParams[clearDynamic(paramName)] = pathnameArray[i];
  }

  return dynamicParams;
}
