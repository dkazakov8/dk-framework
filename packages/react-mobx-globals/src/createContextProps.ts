import { TypeGlobalsAny } from './types/TypeGlobalsAny';
import { getCreateWrappedAction } from './actions/getCreateWrappedAction';
import { TypeCreateContextParams } from './types/TypeCreateContextParams';
import { setGlobalApi } from './globals/setGlobalApi';
import { setGlobalStores } from './globals/setGlobalStores';
import { setGlobalActions } from './globals/setGlobalActions';
import { getCreateWrappedApi } from './actions/getCreateWrappedApi';

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

  globals.createWrappedApi = getCreateWrappedApi.bind(null, globals, transformers);
  globals.createWrappedAction = getCreateWrappedAction.bind(null, globals, transformers);

  setGlobalStores(globals, staticStores);
  setGlobalActions(globals, globalActions);
  setGlobalApi(globals, { api, request, apiValidators });

  return globals;
}
