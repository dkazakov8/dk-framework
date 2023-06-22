import { TypeRequestParams } from 'dk-request';
import { addState } from 'dk-mobx-stateful-fn';

import { TypeGlobalsAny } from './types/TypeGlobalsAny';
import { TypeCreateContextParams } from './types/TypeCreateContextParams';
import { setGlobalApi } from './globals/setGlobalApi';
import { setGlobalStores } from './globals/setGlobalStores';
import { setGlobalActions } from './globals/setGlobalActions';
import { TypeActionAny } from './types/TypeActionAny';

export function createContextProps<TGlobals extends TypeGlobalsAny>({
  req,
  res,
  api,
  request,
  transformers,
  staticStores,
  globalActions,
  apiValidators,
}: TypeCreateContextParams): TGlobals {
  const globals: TGlobals = {
    req,
    res,
    api: {},
    getLn: () => false,
    store: {},
    actions: {},
    createWrappedApi: () => false,
    createWrappedAction: () => false,
  } as any;

  globals.createWrappedApi = ({ ...configParams }: Omit<TypeRequestParams, 'requestParams'>) => {
    const action: any = addState({
      fn: (requestParams: TypeRequestParams['requestParams'] = {}) =>
        request({ ...configParams, mock: action.state.mock, requestParams }, globals),
      name: configParams.apiName,
      transformers,
    });

    return action;
  };
  globals.createWrappedAction = (fn: TypeActionAny) => {
    return addState({
      fn: fn.bind(null, globals),
      name: fn.name,
      transformers,
    });
  };

  setGlobalStores(globals, staticStores);
  setGlobalActions(globals, globalActions);
  setGlobalApi(globals, { api, apiValidators });

  return globals;
}
