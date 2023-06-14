import { TypeApiItem } from './TypeApiItem';

export type TypeApiResponseGenerator<
  TApi extends TypeApiItem,
  TApiName extends keyof TApi
> = TApi[TApiName]['response'];
