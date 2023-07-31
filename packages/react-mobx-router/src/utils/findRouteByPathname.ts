import { TypeRoutesGenerator } from '../types/TypeRoutesGenerator';

import { constants } from './constants';
import { isDynamic } from './isDynamic';
import { clearDynamic } from './clearDynamic';

function completeStaticMatch(pathname: string, path: string) {
  return (
    !path.includes(constants.dynamicSeparator) &&
    (pathname === path || pathname === `${path}${constants.pathPartSeparator}`)
  );
}

export function findRouteByPathname<TRoutes extends TypeRoutesGenerator<any>>({
  pathname,
  routes,
}: {
  pathname: string;
  routes: TRoutes;
}): TRoutes[keyof TRoutes] | undefined {
  /**
   * route /test/edit should take precedence over /test/:edit
   *
   */

  let dynamicRouteMatch: TRoutes[keyof TRoutes] | undefined;

  const pathnameArray = pathname.split(constants.pathPartSeparator).filter(Boolean);

  for (const routeName in routes) {
    if (!routes.hasOwnProperty(routeName)) continue;

    const route = routes[routeName];

    // return static match instantly
    if (completeStaticMatch(pathname, route.path)) return route;

    // if dynamic has been already found, no need to search for another
    if (dynamicRouteMatch) continue;

    const routePathnameArray = (route.path as string)
      .split(constants.pathPartSeparator)
      .filter(Boolean);

    if (routePathnameArray.length !== pathnameArray.length) continue;

    /**
     * Dynamic params must have functional validators
     * and static params should match
     *
     */

    const someParamInvalid = routePathnameArray.some((paramName, i) => {
      const paramFromUrl = pathnameArray[i];

      if (!isDynamic(paramName)) return paramName !== paramFromUrl;

      const validator = route.validators?.[clearDynamic(paramName)];

      if (typeof validator !== 'function') {
        throw new Error(`findRoute: missing validator for param "${paramName}"`);
      }

      return !validator(paramFromUrl);
    });

    // remember matching dynamic route, no return instantly because next routes may have static match
    if (!someParamInvalid) dynamicRouteMatch = route;
  }

  return dynamicRouteMatch;
}
