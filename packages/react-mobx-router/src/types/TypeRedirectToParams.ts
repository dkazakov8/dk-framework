import { TypeRoute } from './TypeRoute';

export type TypeRedirectToParams<TRoutes extends Record<string, TypeRoute>> = {
  route: TRoutes[keyof TRoutes];
  params?: TRoutes[keyof TRoutes]['params'];
  asClient?: boolean;
  noHistoryPush?: boolean;
};
