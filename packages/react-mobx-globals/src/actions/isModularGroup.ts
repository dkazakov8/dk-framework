import { TypeGlobalsAny } from '../types/TypeGlobalsAny';

export function isModularGroup(
  group: TypeGlobalsAny['actions'][keyof TypeGlobalsAny['actions']]
): boolean {
  return Object.values(group).some((groupOrFunction) => typeof groupOrFunction !== 'function');
}
