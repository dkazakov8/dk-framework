import { TypeActionLog } from './types/TypeActionLog';
import { findRouteByPathname } from './utils/findRouteByPathname';
import { TypeRoutesGenerator } from './types/TypeRoutesGenerator';

export function createRouterStore<TRoutes extends TypeRoutesGenerator<any>>({
  routes,
  isClient,
}: {
  routes: TRoutes;
  isClient: boolean;
}) {
  return class StoreRouter {
    actionsLogs: Array<Array<TypeActionLog>> = [];

    routesHistory: Array<string> = [];
    // @ts-ignore
    currentRoute: Omit<TRoutes[keyof TRoutes], 'loader' | 'component'> = {};

    get actionsLogsClear() {
      if (isClient) return this.actionsLogs.filter((log) => log[0].routeName !== 'server');

      return this.actionsLogs;
    }

    get lastActionsLog() {
      return this.actionsLogsClear[this.actionsLogsClear.length - 1];
    }

    get previousRoutePathname() {
      return this.routesHistory[this.routesHistory.length - 2];
    }

    get previousRoute() {
      if (!this.previousRoutePathname) return null;

      return findRouteByPathname({ pathname: this.previousRoutePathname, routes });
    }
  };
}
