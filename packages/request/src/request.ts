import { sendRequest } from './sendRequest';
import { TypeRequestParams } from './types/TypeRequestParams';
import { validateRequest } from './validateRequest';
import { validateResponse } from './validateResponse';

export function request(params: TypeRequestParams) {
  return Promise.resolve()
    .then(() => validateRequest(params))
    .then(() => sendRequest(params))
    .then((response) => validateResponse(params, response));
}
