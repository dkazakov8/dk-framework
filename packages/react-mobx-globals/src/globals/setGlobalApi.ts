import { TypeGlobalsAny } from '../types/TypeGlobalsAny';
import { TypeCreateContextParams } from '../types/TypeCreateContextParams';

export function setGlobalApi(
  globals: TypeGlobalsAny,
  {
    api,
    request,
    apiValidators,
  }: {
    api: TypeCreateContextParams['api'];
    request: TypeCreateContextParams['request'];
    apiValidators: TypeCreateContextParams['apiValidators'];
  }
) {
  // eslint-disable-next-line guard-for-in
  for (const apiName in api) {
    const { url, headers, omitResponseValidation, method, disableCredentials } = api[apiName];

    globals.api[apiName] = globals.createWrappedApi({
      url,
      method,
      apiName,
      request,
      headers,
      validatorRequest: apiValidators[apiName]?.TypeRequest,
      validatorResponse: apiValidators[apiName]?.TypeResponse,
      disableCredentials,
      omitResponseValidation,
    });
  }
}
