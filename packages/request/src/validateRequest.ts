import { errors } from './errors';
import { TypeRequestParams } from './types/TypeRequestParams';
import { createError } from './utils/createError';

export function validateRequest({
  apiName,
  requestParams,
  validatorRequest,
}: TypeRequestParams): void {
  if (!validatorRequest) return;

  try {
    validatorRequest.strictCheck(requestParams);
  } catch (error: any) {
    throw createError(
      errors.VALIDATION,
      `validateRequest: ${error.message.replace('value', 'request')} for "${apiName}"`
    );
  }
}
