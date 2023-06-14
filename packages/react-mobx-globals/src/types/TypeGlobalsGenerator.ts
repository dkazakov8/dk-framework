import { getLn } from 'dk-localize';
import { Request, Response } from 'express';

import { TypeApiItem } from './TypeApiItem';
import { TypeActionAny } from './TypeActionAny';
import { TypeStoreItem } from './TypeStoreItem';
import { TypeApiGenerator } from './TypeApiGenerator';
import { TypeSkipFirstArg } from './TypeSkipFirstArg';
import { TypeActionWrapped } from './TypeActionWrapped';
import { TypeStoreGenerator } from './TypeStoreGenerator';
import { TypeActionsGenerator } from './TypeActionsGenerator';
import { TypeActionsGeneratorModular } from './TypeActionsGeneratorModular';

export type TypeGlobalsGenerator<
  TApi extends TypeApiItem,
  TStaticStores extends TypeStoreItem,
  TModularStores extends Record<string, TypeStoreItem>,
  TActions extends Record<string, Record<string, TypeActionAny>>,
  TModularActions extends Record<string, Record<string, Record<string, TypeActionAny>>>,
  TGetLn extends typeof getLn
> = {
  req?: Request;
  res?: Response;
  api: TypeApiGenerator<TApi>;
  getLn: TypeSkipFirstArg<TGetLn>;
  store: TypeStoreGenerator<TStaticStores, TModularStores>;
  actions: TypeActionsGenerator<TActions> & TypeActionsGeneratorModular<TModularActions>;
  createWrappedApi: (fn: any) => TypeActionWrapped;
  createWrappedAction: (fn: TypeActionAny) => TypeActionWrapped;
};
