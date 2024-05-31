/* eslint-disable react/no-set-state, @typescript-eslint/naming-convention */

import React, { ContextType, createContext, ReactElement } from 'react';
import { autorun, IReactionDisposer, makeAutoObservable, runInAction } from 'mobx';
import { createUseStore, ViewModelConstructor } from 'dk-mobx-use-store';
import { observer } from 'mobx-react-lite';

import { history } from './utils/history';
import { TypeRoute } from './types/TypeRoute';
import { getInitialRoute } from './utils/getInitialRoute';
import { InterfaceRouterStore } from './types/InterfaceRouterStore';
import { redirectToGenerator } from './redirectToGenerator';

const StoreContext = createContext(undefined);

type ViewModel = ViewModelConstructor<ContextType<typeof StoreContext>>;

const useStore = createUseStore(StoreContext);

type TypeProps<TRoutes extends Record<string, TypeRoute>> = {
  // eslint-disable-next-line react/no-unused-prop-types
  routes: TRoutes;
  // eslint-disable-next-line react/no-unused-prop-types
  redirectTo: ReturnType<typeof redirectToGenerator<TRoutes>>;
  // eslint-disable-next-line react/no-unused-prop-types
  routerStore: InterfaceRouterStore<TRoutes>;
  // eslint-disable-next-line react/no-unused-prop-types
  beforeMount?: () => void;
  // eslint-disable-next-line react/no-unused-prop-types
  beforeSetPageComponent?: (componentConfig: TRoutes[keyof TRoutes]) => void;
  // eslint-disable-next-line react/no-unused-prop-types
  beforeUpdatePageComponent?: () => void;
};

class VM<TRoutes extends Record<string, TypeRoute>> implements ViewModel {
  constructor(
    public context: undefined,
    public props: TypeProps<TRoutes>
  ) {
    makeAutoObservable(
      this,
      { loadedComponent: false, setLoadedComponent: false },
      { autoBind: true }
    );
  }
  autorunDisposers: Array<IReactionDisposer> = [];
  loadedComponentName?: keyof TRoutes = undefined;
  loadedComponentPage?: string = undefined;
  loadedComponent?: ReactElement;

  beforeMount() {
    this.props.beforeMount?.();

    this.redirectOnHistoryPop();

    this.setLoadedComponent();

    this.autorunDisposers.push(autorun(this.setLoadedComponent));
  }

  redirectOnHistoryPop() {
    if (!history) return;

    history.listen((params) => {
      if (params.action !== 'POP') return;

      const previousRoutePathname =
        this.props.routerStore.routesHistory[this.props.routerStore.routesHistory.length - 2];

      if (previousRoutePathname === params.location.pathname) {
        runInAction(() => this.props.routerStore.routesHistory.pop());
      }

      void this.props.redirectTo({
        noHistoryPush: true,
        ...getInitialRoute({
          routes: this.props.routes,
          pathname: history.location.pathname,
          fallback: 'error404',
        }),
      });
    });
  }

  setLoadedComponent = () => {
    const { loadedComponentName, loadedComponentPage } = this;
    const { currentRoute } = this.props.routerStore;

    const currentRouteName = currentRoute.name;
    const currentRoutePage = currentRoute.pageName;

    if (
      (this.props.redirectTo as any).state.isExecuting ||
      loadedComponentName === currentRouteName ||
      loadedComponentPage === currentRoutePage
    ) {
      return;
    }

    runInAction(() => {
      if (!loadedComponentName) {
        this.setComponent(currentRouteName);
      } else {
        this.props.beforeUpdatePageComponent?.();

        this.setComponent(currentRouteName);
      }
    });
  };

  setComponent(currentRouteName: keyof TRoutes) {
    const componentConfig = this.props.routes[currentRouteName];
    const props = 'props' in componentConfig ? componentConfig.props : {};
    const RouteComponent: any = componentConfig.component;

    this.props.beforeSetPageComponent?.(componentConfig);

    this.loadedComponentName = currentRouteName;
    this.loadedComponentPage = componentConfig.pageName;
    this.loadedComponent = <RouteComponent {...props} />;
  }
}

export const Router = observer(
  <TRoutes extends Record<string, TypeRoute>>(props: TypeProps<TRoutes>) => {
    const { vm } = useStore(VM<TRoutes>, props, {
      routes: false,
      redirectTo: false,
      routerStore: false,
      beforeMount: false,
      beforeSetPageComponent: false,
      beforeUpdatePageComponent: false,
    });

    return vm.loadedComponentName ? vm.loadedComponent || null : null;
  }
);
