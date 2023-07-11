import { TypeFnState } from 'dk-mobx-stateful-fn';

import { TypeApiItem } from './TypeApiItem';

export type TypeApiGenerator<TApi extends TypeApiItem> = {
  [TApiName in keyof TApi]: TypeFnState &
    ((requestParams: TApi[TApiName]['request']) => Promise<TApi[TApiName]['response']>);
};
