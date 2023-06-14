import { TypeActionAny } from './TypeActionAny';
import { TypeActionData } from './TypeActionData';
import { TypeSkipFirstArg } from './TypeSkipFirstArg';

export type TypeActionsGeneratorModular<
  TModularActions extends Record<string, Record<string, Record<string, TypeActionAny>>>
> = {
  [ModularGroup in keyof TModularActions]: {
    [Group in keyof TModularActions[ModularGroup]]: {
      [FnName in keyof TModularActions[ModularGroup][Group]]: TypeSkipFirstArg<
        TModularActions[ModularGroup][Group][FnName]
      > &
        TypeActionData;
    };
  };
};
