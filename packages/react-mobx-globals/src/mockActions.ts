import { TypeFnState } from 'dk-mobx-stateful-fn';

import { TypeGlobalsAny } from './types/TypeGlobalsAny';
import { isModularGroup } from './actions/isModularGroup';

function wrappedAction() {
  return Promise.resolve();
}

Object.assign(wrappedAction, {
  state: {
    timeStart: 0,
    isExecuting: false,
    executionTime: 0,
  },
} as TypeFnState);

export function mockActions(actions: TypeGlobalsAny['actions']): TypeGlobalsAny['actions'] {
  for (const groupName in actions) {
    if (!actions.hasOwnProperty(groupName)) continue;

    const actionGroup = actions[groupName];

    if (isModularGroup(actionGroup)) return mockActions(actionGroup as any);

    for (const fnName in actionGroup) {
      if (actionGroup.hasOwnProperty(fnName)) actionGroup[fnName] = wrappedAction as any;
    }
  }

  return actions;
}
