import { TypeRouteItemFinal } from '../types/TypeRouteItemFinal';

import { findRouteByPathname } from './findRouteByPathname';
import { getDynamicValues } from './getDynamicValues';

export function getInitialRoute<TRoutes extends Record<string, TypeRouteItemFinal>>(params: {
  routes: TRoutes;
  pathname: string;
  fallback: TRoutes[keyof TRoutes];
}) {
  const route =
    findRouteByPathname({ pathname: params.pathname, routes: params.routes }) || params.fallback;

  return { route, params: getDynamicValues({ routesObject: route, pathname: params.pathname }) };
}
