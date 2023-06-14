import { sendRequest } from './sendRequest';
import { validateRequest } from './validateRequest';
import { validateResponse } from './validateResponse';
import { TypeRequestParams } from './types/TypeRequestParams';

export function request(params: TypeRequestParams) {
  return Promise.resolve()
    .then(() => validateRequest(params))
    .then(() => sendRequest(params))
    .then((response) => validateResponse(params, response));
}
