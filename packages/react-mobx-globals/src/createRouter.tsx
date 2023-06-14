/* eslint-disable react/no-set-state, @typescript-eslint/naming-convention */

import { observer } from 'mobx-react';
import { createBrowserHistory } from 'history';
import { ReactElement, Component, ComponentClass } from 'react';

import { appendAutorun } from './utils/appendAutorun';
import { TypeActionWrapped } from './types/TypeActionWrapped';
import { TypeRoutesGenerator } from './types/TypeRoutesGenerator';
import { TypeCreateContextParams } from './types/TypeCreateContextParams';

const Dumb = () => null;

type PropsRouter<TRoutes extends TypeRoutesGenerator<any>> = {
  routes: TRoutes;
  history: ReturnType<typeof createBrowserHistory>;
  redirectTo: TypeActionWrapped;
  routerStore: any;
  transformers: TypeCreateContextParams['transformers'];

  wrapperClassName?: string;
  beforeComponentMount?: () => void;
};

export function createRouter<TRoutes extends TypeRoutesGenerator<any>>(): ComponentClass<
  PropsRouter<TRoutes>
> {
  return observer(
    class RouterComponent extends Component<PropsRouter<TRoutes>> {
      state: {
        loadedComponent?: ReactElement;
        loadedComponentName?: keyof TRoutes;
      } = {
        loadedComponent: undefined,
        loadedComponentName: undefined,
      };

      UNSAFE_componentWillMount() {
        const { transformers } = this.props;

        this.redirectOnHistoryPop();
        appendAutorun(this, this.setLoadedComponent, transformers);
      }

      redirectOnHistoryPop = () => {
        const { history, routerStore, redirectTo, transformers } = this.props;

        if (!history) return;

        history.listen((params) => {
          if (params.action !== 'POP') return;

          if (routerStore.previousRoutePathname === params.location.pathname) {
            transformers.batch(() => routerStore.routesHistory.pop());
          }

          void redirectTo({ noHistoryPush: true, pathname: history.location.pathname });
        });
      };

      setLoadedComponent = () => {
        const { loadedComponentName } = this.state;
        const { routerStore, redirectTo } = this.props;

        const currentRouteName = routerStore.currentRoute.name;

        if (redirectTo.state.isExecuting || loadedComponentName === currentRouteName) return;

        if (!loadedComponentName) {
          this.setComponent(currentRouteName);
        } else {
          // trigger componentWillUnmount on previous component to clear executed actions
          this.setState({ loadedComponent: <Dumb /> }, () => this.setComponent(currentRouteName));
        }
      };

      setComponent = (currentRouteName: keyof TRoutes) => {
        const { routes, beforeComponentMount } = this.props;

        beforeComponentMount?.();

        const componentConfig = routes[currentRouteName];
        const props = 'props' in componentConfig ? componentConfig.props : {};
        const RouteComponent = componentConfig.component || componentConfig.loader;

        this.setState({
          loadedComponent: <RouteComponent {...props} />,
          loadedComponentName: currentRouteName,
        });
      };

      render() {
        const { loadedComponent } = this.state;
        const { wrapperClassName } = this.props;

        return <div className={wrapperClassName}>{loadedComponent}</div>;
      }
    }
  );
}
