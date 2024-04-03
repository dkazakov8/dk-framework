import { runInAction, action, observable } from 'mobx';

import { getCurrentTime } from './utils/getCurrentTime';
import { TypeFnState } from './types/TypeFnState';

export function addState<
  TApiFn extends (...args: Array<any>) => Promise<any>,
  TName extends string
>({
  fn,
  name,
  transformers,
}: {
  fn: TApiFn;
  name: TName;
  transformers: {
    batch: typeof runInAction;
    action: typeof action;
    observable: typeof observable;
  };
}) {
  function beforeExecution() {
    wrappedAction.state.executionTime = 0;
    wrappedAction.state.isExecuting = true;
    wrappedAction.state.timeStart = getCurrentTime();
    wrappedAction.state.error = undefined;
    wrappedAction.state.errorName = undefined;
  }

  function afterExecution() {
    if (wrappedAction.state.isCancelled) {
      const error = new Error(fn.name);
      error.name = 'ACTION_CANCELED';

      throw error;
    }

    transformers.batch(() => {
      wrappedAction.state.isExecuting = false;
      wrappedAction.state.executionTime = Number(
        (getCurrentTime() - wrappedAction.state.timeStart).toFixed(1)
      );
      wrappedAction.state.timeStart = 0;
    });
  }

  function afterExecutionError(error: any) {
    transformers.batch(() => {
      wrappedAction.state.isExecuting = false;
      wrappedAction.state.executionTime = Number(
        (getCurrentTime() - wrappedAction.state.timeStart).toFixed(1)
      );
      wrappedAction.state.timeStart = 0;

      if (wrappedAction.state.isCancelled) {
        wrappedAction.state.isCancelled = false;

        const e = new Error(fn.name);
        e.name = 'ACTION_CANCELED';

        wrappedAction.state.error = e.message;
        wrappedAction.state.errorName = e.name;

        throw e;
      } else {
        wrappedAction.state.error = error.message;
        wrappedAction.state.errorName = error.name;
      }
    });

    return Promise.reject(error);
  }

  const fnAction = transformers.action(fn);

  const wrappedAction = Object.defineProperties(
    transformers.action(function wrappedActionDecorator(...args: Parameters<TApiFn>) {
      try {
        beforeExecution();

        return fnAction(...args)
          .then((response: any) => {
            afterExecution();

            return response;
          })
          .catch(afterExecutionError);
      } catch (error: any) {
        return afterExecutionError(error);
      }
    } as ((...args: Parameters<TApiFn>) => ReturnType<TApiFn>) & TypeFnState & { name: TName }),
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
