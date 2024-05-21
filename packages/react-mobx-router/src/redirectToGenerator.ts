import { runInAction } from 'mobx';

import { TypeRedirectToParams } from './types/TypeRedirectToParams';
import { history } from './utils/history';
import { constants } from './utils/constants';
import { getDynamicValues } from './utils/getDynamicValues';
import { replaceDynamicValues } from './utils/replaceDynamicValues';
import { loadComponentToConfig } from './utils/loadComponentToConfig';
import { TypeRouteItemFinal } from './types/TypeRouteItemFinal';
import { InterfaceRouterStore } from './types/InterfaceRouterStore';

type TypeParamsGenerator<TRoutes extends Record<string, TypeRouteItemFinal>> = {
  routes: TRoutes;
  routerStore: InterfaceRouterStore<TRoutes>;
  routeError500: TRoutes[keyof TRoutes];
  lifecycleParams?: Array<any>;
};

export function redirectToGenerator<TRoutes extends Record<string, TypeRouteItemFinal>>({
  routes,
  routerStore,
  routeError500,
  lifecycleParams,
}: TypeParamsGenerator<TRoutes>): (redirectParams: TypeRedirectToParams<TRoutes>) => Promise<void> {
  const isClient = constants.isClient;

  return function redirectInner({ route, params = {}, noHistoryPush }): Promise<void> {
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

    return Promise.resolve()
      .then(() => currentRouteConfig?.beforeLeave?.(route, ...(lifecycleParams || [])))
      .then(() => route.beforeEnter?.(...(lifecycleParams || [])))
      .then((redirectParams?: TypeRedirectToParams<TRoutes>) => {
        if (typeof redirectParams === 'object') {
          const err = new Error(
            replaceDynamicValues({
              params: redirectParams.params || {},
              routesObject: redirectParams.route!,
            })
          );

          err.name = constants.errorRedirect;

          // @ts-ignore
          if (isClient) err.data = redirectParams;

          return Promise.reject(err);
        }

        return Promise.resolve();
      })
      .then(() => loadComponentToConfig({ componentConfig: routes[route.name] }))
      .then(() => {
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

          if (lastPathname !== nextPathname) routerStore.routesHistory.push(nextPathname);

          if (history && !noHistoryPush) {
            history.push({ pathname: nextPathname, hash: history.location.hash });
          }
        });
      })
      .catch((error) => {
        // For preventing redirects in beforeLeave
        if (error?.name === 'SILENT') return Promise.resolve();

        if (isClient && error.data) {
          return redirectInner(error.data);
        }

        /**
         * Log error happened in beforeEnter | beforeLeave and draw error500 page
         * without changing URL
         *
         */

        if (error.name === constants.errorRedirect) throw error;

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
      });
  };
}
