import { TypeRoute } from '../types/TypeRoute';
import { TypeRouteWithParams } from '../types/TypeRouteWithParams';

import { constants } from './constants';
import { isDynamic } from './isDynamic';
import { clearDynamic } from './clearDynamic';

const re = new RegExp(`[^${constants.pathPartSeparator}]+`, 'g');

export function replaceDynamicValues<TRouteItem extends TypeRoute | TypeRouteWithParams>({
  routesObject,
  params = {} as any,
}: {
  routesObject: TRouteItem;
  params?: Record<keyof TRouteItem['params'], string>;
}): string {
  return routesObject.path.replace(re, (paramName) => {
    if (!isDynamic(paramName)) return paramName;

    const value = params[clearDynamic(paramName) as keyof TRouteItem['params']];

    if (!value) {
      throw new Error(
        `replaceDynamicValues: no param "${paramName}" passed for route ${routesObject.name}`
      );
    }

    return value;
  });
}
