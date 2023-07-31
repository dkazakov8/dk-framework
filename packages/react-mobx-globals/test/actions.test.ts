import { expect } from 'chai';
import { action, autorun, observable, runInAction } from 'mobx';

import { createContextProps } from '../src/createContextProps';

const ACTION_TIMEOUT = 10;
const ACTION_MODULAR_TIMEOUT = 5;

function createStore() {
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
    staticStores: {},
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

describe('createContextProps', function test() {
  it('creates store and extends actions', () => {
    const globals = extendActionsWithModular(createStore());

    expect(globals.store).to.deep.eq({});

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
