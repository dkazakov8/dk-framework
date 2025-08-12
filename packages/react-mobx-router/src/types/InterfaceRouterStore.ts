import { TypeCurrentRoute } from './TypeCurrentRoute';
import { TypeRoute } from './TypeRoute';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions,@typescript-eslint/naming-convention
export type InterfaceRouterStore<TRoutes extends Record<string, TypeRoute>> = {
  routesHistory: Array<string>;
  currentRoute: TypeCurrentRoute<TRoutes[keyof TRoutes]>;
};
