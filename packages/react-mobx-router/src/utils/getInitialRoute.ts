import { TypeRoute } from '../types/TypeRoute';
import { TypeRedirectToParams } from '../types/TypeRedirectToParams';

import { findRouteByPathname } from './findRouteByPathname';
import { getDynamicValues } from './getDynamicValues';

export function getInitialRoute<TRoutes extends Record<string, TypeRoute>>(params: {
  routes: TRoutes;
  pathname: string;
  fallback: TRoutes[keyof TRoutes]['name'];
}): TypeRedirectToParams<TRoutes, keyof TRoutes> {
  const route =
    findRouteByPathname({ pathname: params.pathname, routes: params.routes }) ||
    params.routes[params.fallback];

  return {
    route: route.name as keyof TRoutes,
    params: getDynamicValues({ route, pathname: params.pathname }),
  } as any;
}
