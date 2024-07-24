import { InterfaceRouterStore } from 'dk-react-mobx-router';
import { makeAutoObservable } from 'mobx';

import { routes } from '../routes';

type TInterfaceRouterStore = InterfaceRouterStore<typeof routes>;

export class RouterStore implements TInterfaceRouterStore {
  constructor() {
    makeAutoObservable(this);
  }

  routesHistory: TInterfaceRouterStore['routesHistory'] = [];
  currentRoute: TInterfaceRouterStore['currentRoute'] = {} as any;
}
