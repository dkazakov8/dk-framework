import { removeExtraneousParams } from 'dk-checker-remove-extraneous';

import { errors } from './errors';
import { createError } from './utils/createError';
import { TypeRequestParams, TypeResponse } from './types/TypeRequestParams';

export function validateResponse(
  {
    apiName,
    requestParams,
    extraneousLogger,
    validatorResponse,
    omitResponseValidation,
  }: TypeRequestParams,
  response: TypeResponse
): TypeResponse | void {
  if (requestParams?.downloadAsFile) return undefined;

  if (!validatorResponse || omitResponseValidation) return response;

  try {
    validatorResponse.check(response);

    removeExtraneousParams({
      data: response,
      logger: extraneousLogger,
      validators: validatorResponse,
    });

    return response;
  } catch (error: any) {
    throw createError(
      errors.VALIDATION,
      `validateResponse: ${error.message.replace('value', 'response')} for "${apiName}"`
    );
  }
}
