import { TypeApiItem } from './TypeApiItem';
import { TypeActionData } from './TypeActionData';

export type TypeApiGenerator<TApi extends TypeApiItem> = {
  [TApiName in keyof TApi]: TypeActionData &
    ((requestParams: TApi[TApiName]['request']) => Promise<TApi[TApiName]['response']>);
};
