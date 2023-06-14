import { TypeApiItem } from './TypeApiItem';

export type TypeApiErrorGenerator<
  TApi extends TypeApiItem,
  TApiName extends keyof TApi
> = TApi[TApiName]['error'] & Error;
