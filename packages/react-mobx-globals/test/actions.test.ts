import { expect } from 'chai';
import { action, autorun, makeAutoObservable, observable, runInAction } from 'mobx';

import { createContextProps } from '../src/createContextProps';
import { TypeRoutesGenerator } from '../src/types/TypeRoutesGenerator';
import { findRouteByPathname } from '../src/utils/findRouteByPathname';

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

describe('createContextProps & createRouterStore', function test() {
  it('creates store and extends actions', () => {
    const globals = extendActionsWithModular(createStore());

    expect(globals.store).to.deep.eq({
      router: {
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
