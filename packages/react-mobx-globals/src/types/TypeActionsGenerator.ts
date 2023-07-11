import { TypeFnState } from 'dk-mobx-stateful-fn';

import { TypeActionAny } from './TypeActionAny';
import { TypeSkipFirstArg } from './TypeSkipFirstArg';

export type TypeActionsGenerator<TActions extends Record<string, Record<string, TypeActionAny>>> = {
  [Group in keyof TActions]: {
    [FnName in keyof TActions[Group]]: TypeSkipFirstArg<TActions[Group][FnName]> & TypeFnState;
  };
};
