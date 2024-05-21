import { TypeRouteItemFinal } from './TypeRouteItemFinal';

export type TypeRedirectToParams<TRoutes extends Record<string, TypeRouteItemFinal>> = {
  route: TRoutes[keyof TRoutes];
  params?: TRoutes[keyof TRoutes]['params'];
  asClient?: boolean;
  noHistoryPush?: boolean;
};
