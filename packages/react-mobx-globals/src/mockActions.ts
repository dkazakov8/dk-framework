import { TypeFnState } from 'dk-mobx-stateful-fn';

import { isModularGroup } from './actions/isModularGroup';
import { TypeGlobalsAny } from './types/TypeGlobalsAny';

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
    if (!Object.hasOwn(actions, groupName)) continue;

    const actionGroup = actions[groupName];

    if (isModularGroup(actionGroup)) return mockActions(actionGroup as any);

    for (const fnName in actionGroup) {
      if (Object.hasOwn(actionGroup, fnName)) actionGroup[fnName] = wrappedAction as any;
    }
  }

  return actions;
}
