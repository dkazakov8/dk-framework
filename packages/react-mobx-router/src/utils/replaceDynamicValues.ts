import { TypeCurrentRoute } from '../types/TypeCurrentRoute';
import { TypeRoute } from '../types/TypeRoute';
import { TypeRouteWithParams } from '../types/TypeRouteWithParams';
import { constants } from './constants';
import { clearDynamic, isDynamic } from './dynamic';

const re = new RegExp(`[^${constants.pathPartSeparator}]+`, 'g');

export function replaceDynamicValues<
  TRouteItem extends TypeRoute | TypeRouteWithParams | TypeCurrentRoute<TypeRoute>,
>({
  route,
  params = {} as any,
}: {
  route: TRouteItem;
  params?: Record<keyof TRouteItem['params'], string>;
}): string {
  return route.path.replace(re, (paramName) => {
    if (!isDynamic(paramName)) return paramName;

    const value = params[clearDynamic(paramName) as keyof TRouteItem['params']];

    if (!value) {
      throw new Error(
        `replaceDynamicValues: no param "${paramName}" passed for route ${route.name}`
      );
    }

    return encodeURIComponent(value);
  });
}
