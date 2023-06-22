import { TypeRequestParams } from 'dk-request';
import { addState } from 'dk-mobx-stateful-fn';

import { TypeCreateContextParams } from '../types/TypeCreateContextParams';
import { TypeGlobalsAny } from '../types/TypeGlobalsAny';

export function getCreateWrappedApi(
  globals: TypeGlobalsAny,
  transformers: TypeCreateContextParams['transformers'],
  {
    request,
    ...configParams
  }: Omit<TypeRequestParams, 'requestParams'> & Pick<TypeCreateContextParams, 'request'>
) {
  const action: any = addState({
    fn: (requestParams: TypeRequestParams['requestParams'] = {}) =>
      request({ ...configParams, mock: action.state.mock, requestParams }, globals),
    name: configParams.apiName,
    transformers,
  });

  return action;
}
