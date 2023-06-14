import unset from 'lodash.unset';
import { Checker, IErrorDetail } from 'ts-interface-checker';

import { getRemovablePaths } from './getRemovablePaths';
import { TypeLogger } from './types';

function flattenValidations(params: Array<IErrorDetail>): Array<IErrorDetail> {
  return params.map((item) => (item.nested ? flattenValidations(item.nested) : item)).flat();
}

export function removeExtraneousParams(params: {
  data: any;
  validators: Checker;

  logger?: TypeLogger;
}): void {
  const { data, validators, logger } = params;

  let extraneousParams = validators.strictValidate(data);

  if (!extraneousParams) return data;

  extraneousParams = flattenValidations(extraneousParams);

  /**
   * strictValidate checks only 1 object in collection, so we need to propagate
   * this checks to all elements and omit all params in data
   *
   */

  let extraneousPaths = extraneousParams
    .filter(({ message }) => message === 'is extraneous')
    .map(({ path }) => path.replace(/^value\.?/, ''));

  if (extraneousPaths.length === 0) return data;

  extraneousPaths = getRemovablePaths({ data, paths: extraneousPaths });

  extraneousPaths.forEach((path) => unset(data, path));

  logger?.({ extraneousPaths });

  // Maybe something is left? Check twice
  return removeExtraneousParams({ data, validators, logger });
}
