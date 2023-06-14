import { TypeApiItem } from './TypeApiItem';

export type TypeApiRequestGenerator<
  TApi extends TypeApiItem,
  TApiName extends keyof TApi
> = TApi[TApiName]['request'];
