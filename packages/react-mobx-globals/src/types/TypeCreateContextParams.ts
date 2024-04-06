import { Request, Response } from 'express';
import { request } from 'dk-request';
import { ICheckerSuite } from 'ts-interface-checker';

import { TypeActionAny } from './TypeActionAny';

type TypeAddParameters<
  TFunction extends (...args: any) => any,
  TParameters extends [...args: any]
> = (...args: [...Parameters<TFunction>, ...TParameters]) => ReturnType<TFunction>;

export type TypeCreateContextParams = {
  req?: Request;
  res?: Response;
  api: any;
  request: TypeAddParameters<typeof request, [globals?: any]>;
  staticStores: Record<string, new () => any>;
  globalActions: Record<string, Record<string, TypeActionAny>>;
  apiValidators: Record<string, ICheckerSuite>;
};
