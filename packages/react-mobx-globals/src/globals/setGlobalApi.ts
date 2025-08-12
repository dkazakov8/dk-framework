import { TypeCreateContextParams } from '../types/TypeCreateContextParams';
import { TypeGlobalsAny } from '../types/TypeGlobalsAny';

export function setGlobalApi(
  globals: TypeGlobalsAny,
  {
    api,
    apiValidators,
  }: {
    api: TypeCreateContextParams['api'];
    apiValidators: TypeCreateContextParams['apiValidators'];
  }
) {
  // biome-ignore lint/suspicious/useGuardForIn: false
  for (const apiName in api) {
    const { url, headers, omitResponseValidation, method, disableCredentials } = api[apiName];

    globals.api[apiName] = globals.createWrappedApi({
      url,
      method,
      apiName,
      headers,
      validatorRequest: apiValidators[apiName]?.TypeRequest,
      validatorResponse: apiValidators[apiName]?.TypeResponse,
      disableCredentials,
      omitResponseValidation,
    });
  }
}
