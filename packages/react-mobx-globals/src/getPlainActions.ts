import { TypeGlobalsAny } from './types/TypeGlobalsAny';
import { TypeActionWrapped } from './types/TypeActionWrapped';
import { isModularGroup } from './actions/isModularGroup';

export function getPlainActions(actions: TypeGlobalsAny['actions']): Array<TypeActionWrapped> {
  return Object.values(actions)
    .map((actionGroup) =>
      isModularGroup(actionGroup) ? getPlainActions(actionGroup as any) : Object.values(actionGroup)
    )
    .flat(Infinity) as any;
}
