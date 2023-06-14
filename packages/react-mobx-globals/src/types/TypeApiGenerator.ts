import { TypeApiItem } from './TypeApiItem';
import { TypeActionData } from './TypeActionData';
import { TypeApiRequestGenerator } from './TypeApiRequestGenerator';
import { TypeApiResponseGenerator } from './TypeApiResponseGenerator';

export type TypeApiGenerator<TApi extends TypeApiItem> = {
  [TApiName in keyof TApi]: TypeActionData &
    ((
      requestParams: TypeApiRequestGenerator<TApi, TApiName>
    ) => Promise<TypeApiResponseGenerator<TApi, TApiName>>);
};
