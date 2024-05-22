/* eslint-disable no-restricted-syntax */

import { runInAction } from 'mobx';

import { history } from './utils/history';
import { constants } from './utils/constants';
import { getDynamicValues } from './utils/getDynamicValues';
import { replaceDynamicValues } from './utils/replaceDynamicValues';
import { loadComponentToConfig } from './utils/loadComponentToConfig';
import { TypeRoute } from './types/TypeRoute';
import { InterfaceRouterStore } from './types/InterfaceRouterStore';
import { TypeRedirectToParams } from './types/TypeRedirectToParams';

type TypeParamsGenerator<TRoutes extends Record<string, TypeRoute>> = {
  routes: TRoutes;
  routerStore: InterfaceRouterStore<TRoutes>;
  routeError500: TRoutes[keyof TRoutes];
  lifecycleParams?: Array<any>;
};

export function redirectToGenerator<TRoutes extends Record<string, TypeRoute>>({
  routes,
  routerStore,
  routeError500,
  lifecycleParams,
}: TypeParamsGenerator<TRoutes>): (redirectParams: TypeRedirectToParams<TRoutes>) => Promise<void> {
  return async function redirectTo(config): Promise<void> {
    const { route, params = {}, noHistoryPush, asClient } = config;

    const isClient = asClient ? true : constants.isClient;
    const currentRouteConfig = routes[routerStore.currentRoute?.name];
    const prevPathname = currentRouteConfig
      ? replaceDynamicValues({
          routesObject: currentRouteConfig,
          params: routerStore.currentRoute.params,
        })
      : null;
    const nextPathname = replaceDynamicValues({ routesObject: route, params });
    const nextParams = getDynamicValues({ routesObject: route, pathname: nextPathname });

    // Prevent redirect to the same route
    if (prevPathname === nextPathname) {
      return loadComponentToConfig({ componentConfig: routes[routerStore.currentRoute.name] });
    }

    try {
      await currentRouteConfig?.beforeLeave?.(route, ...(lifecycleParams || []));
      const redirectParams: TypeRedirectToParams<TRoutes> = await route.beforeEnter?.(
        ...(lifecycleParams || [])
      );

      if (typeof redirectParams === 'object') {
        throw Object.assign(
          new Error(
            replaceDynamicValues({
              params: redirectParams.params || {},
              routesObject: redirectParams.route!,
            })
          ),
          {
            name: constants.errorRedirect,
            data: isClient ? { ...redirectParams, asClient } : undefined,
          }
        );
      }

      await loadComponentToConfig({ componentConfig: routes[route.name] });
    } catch (error: any) {
      if (error?.name === constants.errorPrevent) return Promise.resolve();

      if (error?.name === constants.errorRedirect) {
        if (error?.data) return redirectTo(error.data);

        throw error;
      }

      console.error(error);

      runInAction(() => {
        routerStore.currentRoute = {
          name: routeError500.name,
          path: routeError500.path,
          props: routes[routeError500.name].props,
          params: routes[routeError500.name].params,
          pageName: routes[routeError500.name].pageName,
        };
      });

      return Promise.resolve();
    }

    runInAction(() => {
      /**
       * Optimistically update currentRoute and synchronize it with browser's URL field
       *
       * except 500 error - it should be drawn without URL change,
       * so user could fix pathname or refresh the page and maybe get successful result
       *
       */

      routerStore.currentRoute = {
        name: route.name,
        path: route.path,
        props: routes[route.name].props,
        params: nextParams,
        pageName: routes[route.name].pageName,
      };

      const lastPathname = routerStore.routesHistory[routerStore.routesHistory.length - 1];

      if (lastPathname !== nextPathname) {
        routerStore.routesHistory.push(nextPathname);
      }

      if (history && !noHistoryPush) {
        history.push({ pathname: nextPathname, hash: history.location.hash });
      }
    });

    return Promise.resolve();
  };
}
