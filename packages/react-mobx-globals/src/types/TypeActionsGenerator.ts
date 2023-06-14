import { TypeActionAny } from './TypeActionAny';
import { TypeActionData } from './TypeActionData';
import { TypeSkipFirstArg } from './TypeSkipFirstArg';

export type TypeActionsGenerator<TActions extends Record<string, Record<string, TypeActionAny>>> = {
  [Group in keyof TActions]: {
    [FnName in keyof TActions[Group]]: TypeSkipFirstArg<TActions[Group][FnName]> & TypeActionData;
  };
};
