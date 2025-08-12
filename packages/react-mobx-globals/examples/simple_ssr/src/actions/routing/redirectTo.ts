import { redirectToGenerator, TypeRedirectToParams } from 'dk-react-mobx-router';

import { TypeGlobals } from '../../models/TypeGlobals';
import { routes } from '../../routes';

export const redirectTo = <TRouteName extends keyof typeof routes>(
  globals: TypeGlobals,
  params: TypeRedirectToParams<typeof routes, TRouteName>
) => {
  return redirectToGenerator({
    routes,
    routerStore: globals.store.router,
    routeError500: routes.error500,
    lifecycleParams: [globals],
  })(params);
};
