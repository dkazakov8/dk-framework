import { expect } from 'chai';
import { action, autorun, makeAutoObservable, observable, runInAction } from 'mobx';
import { createContextProps, TypeRoutesGenerator } from 'dk-react-mobx-globals';
import { findRouteByPathname } from 'dk-react-mobx-globals/src/utils/findRouteByPathname';

import { getActionsLogs } from '../src/getActionsLogs';
import { TypeActionLog } from '../src/TypeActionLog';

const ACTION_TIMEOUT = 10;
const ACTION_MODULAR_TIMEOUT = 5;

function createStore() {
  const routesObject = {
    onboarding: {
      name: 'onboarding',
      path: '/',
      component: () => '123',
      params: {},
    },
    error404: {
      name: 'error404',
      path: '/error404',
      component: () => '123',
      params: {},
    },
    error500: {
      name: 'error500',
      path: '/error500',
      component: () => '123',
      params: {},
    },
  };

  // @ts-ignore
  const routes = routesObject as unknown as TypeRoutesGenerator<typeof routesObject>;

  return createContextProps<any>({
    api: {},
    request: () => Promise.resolve(),
    globalActions: {
      globalGroup: {
        someAction: () => {
          return new Promise<void>((resolve) => {
            setTimeout(() => resolve(undefined), ACTION_TIMEOUT);
          });
        },
      },
      modularGroup: {},
    },
    staticStores: {
      router: class RouterStore {
        constructor() {
          makeAutoObservable(this);
        }

        actionsLogs: Array<Array<TypeActionLog>> = [];

        get actionsLogsClear() {
          return this.actionsLogs.filter((log) => log[0].routeName !== 'server');
        }

        get lastActionsLog() {
          return this.actionsLogsClear[this.actionsLogsClear.length - 1];
        }

        routesHistory: Array<string> = [];
        currentRoute: Omit<(typeof routes)[keyof typeof routes], 'loader' | 'component'> =
          {} as any;

        get previousRoutePathname() {
          return this.routesHistory[this.routesHistory.length - 2];
        }

        get previousRoute() {
          if (!this.previousRoutePathname) return null;

          return findRouteByPathname({ pathname: this.previousRoutePathname, routes });
        }
      },
    },
    apiValidators: {},
    transformers: { action, batch: runInAction, autorun, observable },
  });
}

function extendActionsWithModular(globals: any) {
  Object.entries({
    somePage: {
      someModularAction: () => {
        return new Promise((res) => {
          setTimeout(() => res(undefined), ACTION_MODULAR_TIMEOUT);
        });
      },
    },
  }).forEach(([actionGroupName, actionGroup]) => {
    if (globals.actions.modularGroup[actionGroupName]) return;

    globals.actions.modularGroup[actionGroupName] = {};

    Object.entries(actionGroup!).forEach(([actionName, fn]) => {
      globals.actions.modularGroup[actionGroupName][actionName] = globals.createWrappedAction(
        fn as any
      );
    });
  });

  return globals;
}

describe('getActionsLogs', function test() {
  it('logs correctly', () => {
    const globals = extendActionsWithModular(createStore());
    const routerStore = globals.store.router;
    const actionsLogs = routerStore.actionsLogs;

    const globalAction = globals.actions.globalGroup.someAction;
    const modularAction = globals.actions.modularGroup.somePage.someModularAction;

    getActionsLogs({
      globals,
      isClient: true,
      actionsLogs,
      routerStore,
      transformers: { action, batch: runInAction, autorun, observable },
    });

    expect(actionsLogs).to.deep.eq([]);

    globalAction();

    expect(actionsLogs).to.deep.eq([[{ name: 'someAction', routeName: 'client', type: 'ACTION' }]]);

    return new Promise((resolve) => {
      runInAction(() => {
        globals.store.router.currentRoute = {
          name: 'onboarding',
          path: '/',
          params: {},
        };
      });

      modularAction();

      expect(actionsLogs).to.deep.eq([
        [{ name: 'someAction', routeName: 'client', type: 'ACTION' }],
        [
          { name: 'someAction', routeName: 'client', type: 'ACTION' },
          { name: 'someModularAction', routeName: 'client', type: 'ACTION' },
        ],
      ]);

      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(actionsLogs.length).to.eq(3);

        expect(actionsLogs[0]).to.deep.eq([
          { name: 'someAction', routeName: 'client', type: 'ACTION' },
        ]);

        expect(actionsLogs[1].length).to.eq(2);
        expect(actionsLogs[1][0]).to.deep.eq({
          name: 'someAction',
          routeName: 'client',
          type: 'ACTION',
        });
        expect(actionsLogs[1][1].name).to.eq('someModularAction');
        expect(actionsLogs[1][1].routeName).to.eq('client');
        expect(actionsLogs[1][1].type).to.eq('ACTION');
        expect(Math.ceil(Number(actionsLogs[1][1].executionTime))).to.be.greaterThanOrEqual(
          ACTION_MODULAR_TIMEOUT - 1
        );
        expect(Number(actionsLogs[1][1].executionTime)).to.be.lessThan(ACTION_TIMEOUT);

        resolve(undefined);
      }, ACTION_TIMEOUT);
    });
  });
});
