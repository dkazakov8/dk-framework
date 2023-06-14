import { TypeRouteItem } from '../types/TypeRouteItem';

import { constants } from './constants';
import { isDynamic } from './isDynamic';
import { clearDynamic } from './clearDynamic';

const re = new RegExp(`[^${constants.pathPartSeparator}]+`, 'g');

export function replaceDynamicValues<TRouteItem extends TypeRouteItem>({
  routesObject,
  params,
}: {
  routesObject: TRouteItem;
  params: TRouteItem['params'];
}): string {
  return routesObject.path.replace(re, (paramName) => {
    if (!isDynamic(paramName)) return paramName;

    const value = params[clearDynamic(paramName)];

    if (!value) {
      throw new Error(
        `replaceDynamicValues: no param "${paramName}" passed for route ${routesObject.name}`
      );
    }

    return value;
  });
}
