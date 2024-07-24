import { InterfaceRouterStore, redirectToGenerator } from 'dk-react-mobx-router';
import { addState } from 'dk-mobx-stateful-fn';
import { makeAutoObservable } from 'mobx';

import { routes } from './routes';

type TInterfaceRouterStore = InterfaceRouterStore<typeof routes>;

class RouterStore implements TInterfaceRouterStore {
  constructor() {
    makeAutoObservable(this, { redirectTo: false });
  }

  routesHistory: TInterfaceRouterStore['routesHistory'] = [];
  currentRoute: TInterfaceRouterStore['currentRoute'] = {} as any;

  redirectTo = addState(
    redirectToGenerator({
      routes,
      routerStore: this,
      routeError500: routes.error500,
    }),
    'redirectTo'
  );
}

export const routerStore = new RouterStore();
