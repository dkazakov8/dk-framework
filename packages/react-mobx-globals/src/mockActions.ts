import { TypeGlobalsAny } from './types/TypeGlobalsAny';
import { isModularGroup } from './actions/isModularGroup';
import { defaultActionData } from './actions/defaultActionData';

function wrappedAction() {
  return Promise.resolve();
}

Object.assign(wrappedAction, defaultActionData);

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
