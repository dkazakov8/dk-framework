import { runInAction, action, observable } from 'mobx';

import { getCurrentTime } from './utils/getCurrentTime';
import { TypeFnState } from './types/TypeFnState';

export function addState<TApiFn extends (...args: Array<any>) => Promise<any>>({
  fn,
  name,
  transformers,
}: {
  fn: TApiFn;
  name: string;
  transformers: {
    batch: typeof runInAction;
    action: typeof action;
    observable: typeof observable;
  };
}) {
  function afterExecutionError(error: any) {
    transformers.batch(() => {
      wrappedAction.state.isExecuting = false;
      wrappedAction.state.executionTime = Number(
        (getCurrentTime() - wrappedAction.state.timeStart).toFixed(1)
      );
      wrappedAction.state.timeStart = 0;
      wrappedAction.state.error = error.message;
      wrappedAction.state.errorName = error.name;
    });

    return Promise.reject(error);
  }

  const wrappedAction = Object.defineProperties(
    function wrappedActionDecorator(...args: Parameters<TApiFn>) {
      try {
        transformers.batch(() => {
          wrappedAction.state.executionTime = 0;
          wrappedAction.state.isExecuting = true;
          wrappedAction.state.timeStart = getCurrentTime();
          wrappedAction.state.error = undefined;
          wrappedAction.state.errorName = undefined;
        });

        return transformers
          .action(fn)(...args)
          .then((response: any) => {
            transformers.batch(() => {
              wrappedAction.state.isExecuting = false;
              wrappedAction.state.executionTime = Number(
                (getCurrentTime() - wrappedAction.state.timeStart).toFixed(1)
              );
              wrappedAction.state.timeStart = 0;

              if (wrappedAction.state.isCancelled) {
                wrappedAction.state.isCancelled = false;

                const error = new Error(fn.name);
                error.name = 'ACTION_CANCELED';

                throw error;
              }
            });

            return response;
          })
          .catch(afterExecutionError);
      } catch (error: any) {
        return afterExecutionError(error);
      }
    } as ((...args: Parameters<TApiFn>) => ReturnType<TApiFn>) & TypeFnState,
    {
      state: {
        value: transformers.observable({
          timeStart: 0,
          isExecuting: false,
          executionTime: 0,
        }),
        writable: false,
      },
      name: { value: name, writable: false },
    }
  );

  return wrappedAction;
}
