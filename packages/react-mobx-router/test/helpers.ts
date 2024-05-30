/* eslint-disable @typescript-eslint/naming-convention */

import { makeAutoObservable } from 'mobx';
import { addState } from 'dk-mobx-stateful-fn';

import { redirectToGenerator } from '../src/redirectToGenerator';
import { InterfaceRouterStore } from '../src/types/InterfaceRouterStore';

import { routes } from './routes';

// eslint-disable-next-line @typescript-eslint/naming-convention
type TInterfaceRouterStore = InterfaceRouterStore<typeof routes>;

function createSeparateFunction(customRoutes: any = routes, lifecycleParams?: any) {
  class RouterStore implements TInterfaceRouterStore {
    constructor() {
      makeAutoObservable(this);
    }

    routesHistory: TInterfaceRouterStore['routesHistory'] = [];
    currentRoute: TInterfaceRouterStore['currentRoute'] = {} as any;
  }

  const routerStore = new RouterStore();

  const redirectTo = addState(
    redirectToGenerator({
      routes: customRoutes,
      routerStore,
      lifecycleParams,
      routeError500: customRoutes.error500,
    }),
    'redirectTo'
  );

  return { redirectTo, routerStore };
}

function createStoreFunction(customRoutes: any = routes, lifecycleParams?: any) {
  class RouterStore implements TInterfaceRouterStore {
    constructor() {
      makeAutoObservable(this, { redirectTo: false });

      this.redirectTo = addState(this.redirectTo, 'redirectTo');
    }

    routesHistory: TInterfaceRouterStore['routesHistory'] = [];
    currentRoute: TInterfaceRouterStore['currentRoute'] = {} as any;

    redirectTo = redirectToGenerator({
      routes: customRoutes,
      routerStore: this,
      lifecycleParams,
      routeError500: customRoutes.error500,
    });
  }

  const routerStore = new RouterStore();

  return { routerStore };
}

export function getData(mode: 'separate' | 'store', customRoutes: any, lifecycleParams?: any) {
  let redirectTo: ReturnType<typeof redirectToGenerator>;
  let routerStore: TInterfaceRouterStore;

  if (mode === 'store') {
    const output = createStoreFunction(customRoutes, lifecycleParams);

    routerStore = output.routerStore;
    redirectTo = output.routerStore.redirectTo;
  } else {
    const output = createSeparateFunction(customRoutes, lifecycleParams);

    routerStore = output.routerStore;
    redirectTo = output.redirectTo;
  }

  return { redirectTo, routerStore };
}
