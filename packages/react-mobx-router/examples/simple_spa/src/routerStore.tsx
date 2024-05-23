import { InterfaceRouterStore, redirectToGenerator } from 'dk-react-mobx-router';
import { addState } from 'dk-mobx-stateful-fn';
import { makeAutoObservable } from 'mobx';

import { routes } from './routes';

import './style.css';

type TInterfaceRouterStore = InterfaceRouterStore<typeof routes>;

class RouterStore implements TInterfaceRouterStore {
  constructor() {
    makeAutoObservable(this, { redirectTo: false });

    this.redirectTo = addState(this.redirectTo, 'redirectTo');
  }

  routesHistory: TInterfaceRouterStore['routesHistory'] = [];
  currentRoute: TInterfaceRouterStore['currentRoute'] = {} as any;

  redirectTo = redirectToGenerator({
    routes,
    routerStore: this,
    routeError500: routes.error500,
  });
}

export const routerStore = new RouterStore();
