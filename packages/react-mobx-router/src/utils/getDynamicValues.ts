import { TypeRouteItem } from '../types/TypeRouteItem';

import { constants } from './constants';
import { isDynamic } from './isDynamic';
import { clearDynamic } from './clearDynamic';

export function getDynamicValues<TRouteItem extends TypeRouteItem>(params: {
  routesObject: TRouteItem;
  pathname: string;
}): TRouteItem['params'] {
  const { routesObject, pathname } = params;

  const pathnameArray: Array<string> = pathname.split(constants.pathPartSeparator).filter(Boolean);
  const routePathnameArray: Array<keyof TRouteItem['params']> = routesObject.path
    .split(constants.pathPartSeparator)
    .filter(Boolean);
  const dynamicParams: TRouteItem['params'] = {};

  for (let i = 0; i < routePathnameArray.length; i++) {
    const paramName = routePathnameArray[i];

    // @ts-ignore
    if (isDynamic(paramName)) dynamicParams[clearDynamic(paramName)] = pathnameArray[i];
  }

  return dynamicParams;
}
