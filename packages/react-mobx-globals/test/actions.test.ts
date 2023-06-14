import { expect } from 'chai';
import { action, autorun, computed, makeObservable, observable, runInAction } from 'mobx';

import { getActionsLogs } from '../src/getActionsLogs';
import { createRouterStore } from '../src/createRouterStore';
import { createContextProps } from '../src/createContextProps';
import { TypeRoutesGenerator } from '../src/types/TypeRoutesGenerator';

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
      router: class RouterStore extends createRouterStore({ routes, isClient: true }) {
        constructor() {
          super();

          makeObservable(this, {
            actionsLogs: observable,
            currentRoute: observable,
            routesHistory: observable,

            previousRoute: computed,
            lastActionsLog: computed,
            previousRoutePathname: computed,
          });
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

describe('createContextProps & createRouterStore', function test() {
  it('creates store and extends actions', () => {
    const globals = extendActionsWithModular(createStore());

    expect(globals.store).to.deep.eq({
      router: {
        actionsLogs: [],
        currentRoute: {},
        routesHistory: [],
      },
    });

    const globalAction = globals.actions.globalGroup.someAction;
    const modularAction = globals.actions.modularGroup.somePage.someModularAction;

    expect(globalAction.state).to.deep.eq({
      timeStart: 0,
      isExecuting: false,
      executionTime: 0,
    });

    expect(modularAction.state).to.deep.eq({
      timeStart: 0,
      isExecuting: false,
      executionTime: 0,
    });
  });

  it('sets actions state', () => {
    const globals = extendActionsWithModular(createStore());

    const globalAction = globals.actions.globalGroup.someAction;
    const modularAction = globals.actions.modularGroup.somePage.someModularAction;

    globalAction();

    expect(globalAction.state.isExecuting).to.eq(true);
    expect(globalAction.state.timeStart).to.be.greaterThan(0);

    modularAction();

    expect(modularAction.state.isExecuting).to.eq(true);
    expect(modularAction.state.timeStart).to.be.greaterThan(0);

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(globalAction.state.isExecuting).to.eq(false);
        expect(Math.ceil(Number(globalAction.state.executionTime))).to.be.greaterThanOrEqual(
          ACTION_TIMEOUT - 1
        );

        expect(modularAction.state.isExecuting).to.eq(false);
        expect(Math.ceil(Number(modularAction.state.executionTime))).to.be.greaterThanOrEqual(
          ACTION_MODULAR_TIMEOUT - 1
        );

        resolve(undefined);
      }, ACTION_TIMEOUT);
    });
  });
});

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

    expect(actionsLogs).to.deep.eq([
      [{ name: 'someAction', routeName: 'INITIAL', type: 'ACTION' }],
    ]);

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
        [{ name: 'someAction', routeName: 'INITIAL', type: 'ACTION' }],
        [{ name: 'someAction', routeName: 'onboarding', type: 'ACTION' }],
        [
          { name: 'someAction', routeName: 'onboarding', type: 'ACTION' },
          { name: 'someModularAction', routeName: 'onboarding', type: 'ACTION' },
        ],
      ]);

      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(actionsLogs.length).to.eq(4);

        expect(actionsLogs[0]).to.deep.eq([
          { name: 'someAction', routeName: 'INITIAL', type: 'ACTION' },
        ]);

        expect(actionsLogs[1]).to.deep.eq([
          { name: 'someAction', routeName: 'onboarding', type: 'ACTION' },
        ]);

        expect(actionsLogs[2].length).to.eq(2);
        expect(actionsLogs[2][0]).to.deep.eq({
          name: 'someAction',
          routeName: 'onboarding',
          type: 'ACTION',
        });
        expect(actionsLogs[2][1].name).to.eq('someModularAction');
        expect(actionsLogs[2][1].routeName).to.eq('onboarding');
        expect(actionsLogs[2][1].type).to.eq('ACTION');
        expect(Math.ceil(Number(actionsLogs[2][1].executionTime))).to.be.greaterThanOrEqual(
          ACTION_MODULAR_TIMEOUT - 1
        );
        expect(Number(actionsLogs[2][1].executionTime)).to.be.lessThan(ACTION_TIMEOUT);

        expect(actionsLogs[3].length).to.eq(1);
        expect(actionsLogs[3][0].name).to.eq('someAction');
        expect(actionsLogs[3][0].routeName).to.eq('onboarding');
        expect(actionsLogs[3][0].type).to.eq('ACTION');
        expect(Math.ceil(Number(actionsLogs[3][0].executionTime))).to.be.greaterThanOrEqual(
          ACTION_TIMEOUT - 1
        );

        resolve(undefined);
      }, ACTION_TIMEOUT);
    });
  });
});
