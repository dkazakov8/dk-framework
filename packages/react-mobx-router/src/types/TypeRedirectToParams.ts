import { TypeRoute } from './TypeRoute';
import { TypeValidator } from './TypeValidator';

export type TypeRedirectToParams<TRoute extends TypeRoute> =
  TRoute['params'] extends Record<string, TypeValidator>
    ? {
        route: TRoute;
        params: Record<keyof TRoute['params'], string>;
        asClient?: boolean;
        noHistoryPush?: boolean;
      }
    : {
        route: TRoute;
        asClient?: boolean;
        noHistoryPush?: boolean;
      };
