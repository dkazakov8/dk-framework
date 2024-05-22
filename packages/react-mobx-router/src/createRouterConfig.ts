import { ComponentClass } from 'react';

import { addNames } from './utils/addNames';
import { TypeIsEmptyObject } from './types/TypeIsEmptyObject';
import { TypeRouteRaw } from './types/TypeRouteRaw';

type TypeRouteInitialItem<TObj extends TypeRouteRaw> = TypeRouteRaw &
  (TypeIsEmptyObject<TObj['params']> extends false
    ? { validators: Record<keyof TObj['params'], (param: string) => boolean> }
    : {});

type TypeRouteItemFinalGeneric<
  TConfig extends { [Key in keyof TConfig]: TypeRouteInitialItem<TConfig[Key]> },
> = {
  [Key in keyof TConfig]: TConfig[Key] & {
    name: Key;
    store?: any;
    actions?: any;
    pageName?: string;
    component?: ComponentClass;
  };
};

export function createRouterConfig<
  TConfig extends {
    [Key in keyof TConfig]: TypeRouteInitialItem<TConfig[Key]>;
  },
>(config: TConfig): TypeRouteItemFinalGeneric<TConfig> {
  return addNames(config);
}
