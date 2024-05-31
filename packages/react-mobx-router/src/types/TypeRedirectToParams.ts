import { TypeRoute } from './TypeRoute';
import { TypeValidator } from './TypeValidator';

export type TypeRedirectToParams<
  TRoutes extends Record<string, TypeRoute>,
  TRouteName extends keyof TRoutes,
> =
  TRoutes[TRouteName]['params'] extends Record<string, TypeValidator>
    ? {
        route: TRouteName;
        params: Record<keyof TRoutes[TRouteName]['params'], string>;
        asClient?: boolean;
        noHistoryPush?: boolean;
      }
    : {
        route: TRouteName;
        asClient?: boolean;
        noHistoryPush?: boolean;
      };
