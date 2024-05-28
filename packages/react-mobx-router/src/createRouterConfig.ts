import { ComponentClass } from 'react';

import { addNames } from './utils/addNames';
import { TypeRouteRaw } from './types/TypeRouteRaw';

type TypeRouteItemFinalGeneric<TConfig extends { [Key in keyof TConfig]: TypeRouteRaw }> = {
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
    [Key in keyof TConfig]: TypeRouteRaw;
  },
>(config: TConfig): TypeRouteItemFinalGeneric<TConfig> {
  return addNames(config);
}
