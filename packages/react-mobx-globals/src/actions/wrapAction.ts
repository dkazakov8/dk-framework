import { TypeActionBound } from '../types/TypeActionBound';
import { TypeActionWrapped } from '../types/TypeActionWrapped';
import { TypeCreateContextParams } from '../types/TypeCreateContextParams';

import { afterExecution } from './afterExecution';
import { beforeExecution } from './beforeExecution';
import { defaultActionData } from './defaultActionData';

export const wrapAction = (params: {
  fn: TypeActionBound;
  name: string;
  onError: (error: any) => void;
  transformers: TypeCreateContextParams['transformers'];
}): TypeActionWrapped => {
  const fnAction = params.transformers.action(params.fn);
  const afterExecutionBound = params.transformers.action(afterExecution).bind(null, wrappedAction);
  const beforeExecutionBound = params.transformers
    .action(beforeExecution)
    .bind(null, wrappedAction);

  function wrappedAction(arg: any) {
    try {
      beforeExecutionBound();

      return fnAction(arg)
        .then(afterExecutionBound)
        .catch((error) => {
          afterExecutionBound(null);

          params.transformers.batch(() => {
            (wrappedAction as TypeActionWrapped).state.error = error.message;
            (wrappedAction as TypeActionWrapped).state.errorName = error.name;
          });

          return Promise.reject(error);
        });
    } catch (error: any) {
      afterExecutionBound(null);

      params.transformers.batch(() => {
        (wrappedAction as TypeActionWrapped).state.error = error.message;
        (wrappedAction as TypeActionWrapped).state.errorName = error.name;
      });

      params.onError(error);

      return Promise.reject(error);
    }
  }

  Object.assign(wrappedAction, params.transformers.observable(defaultActionData));

  Object.defineProperty(wrappedAction, 'name', { value: params.name, writable: false });

  return wrappedAction as TypeActionWrapped;
};
