import { addState } from 'dk-mobx-stateful-fn';
import { TypeRequestParams } from 'dk-request';

import { setGlobalActions } from './globals/setGlobalActions';
import { setGlobalApi } from './globals/setGlobalApi';
import { setGlobalStores } from './globals/setGlobalStores';
import { TypeActionGenerator } from './types/TypeActionGenerator';
import { TypeCreateContextParams } from './types/TypeCreateContextParams';
import { TypeGlobalsAny } from './types/TypeGlobalsAny';

export function createContextProps<TGlobals extends TypeGlobalsAny>({
  req,
  res,
  api,
  request,
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
    createWrappedApi: ({ ...configParams }: Omit<TypeRequestParams, 'requestParams'>) => {
      const action: any = addState(
        (requestParams: TypeRequestParams['requestParams'] = {}) =>
          request({ ...configParams, mock: action.state.mock, requestParams }, globals),
        configParams.apiName
      );

      return action;
    },
    createWrappedAction: (fn: TypeActionGenerator<TGlobals, any>) => {
      return addState((fn as any).bind(null, globals), fn.name);
    },
  } as any;

  setGlobalStores(globals, staticStores);
  setGlobalActions(globals, globalActions);
  setGlobalApi(globals, { api, apiValidators });

  return globals;
}
