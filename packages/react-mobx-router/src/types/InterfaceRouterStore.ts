import { TypeRouteItemFinal } from './TypeRouteItemFinal';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions,@typescript-eslint/naming-convention
export type InterfaceRouterStore<TRoutes extends Record<string, TypeRouteItemFinal>> = {
  routesHistory: Array<string>;
  currentRoute: {
    name: TRoutes[keyof TRoutes]['name'];
    path: TRoutes[keyof TRoutes]['path'];
    props: TRoutes[keyof TRoutes]['props'];
    params: TRoutes[keyof TRoutes]['params'];
    pageName: TRoutes[keyof TRoutes]['pageName'];
  };
};
