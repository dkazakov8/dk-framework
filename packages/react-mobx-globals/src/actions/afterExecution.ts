import { getCurrentTime } from './getCurrentTime';
import { errorActionCanceledName } from './errorActionCanceledName';

/**
 * After every action execution
 *
 * be aware that isCancelled resets only after execution,
 * so if one action was called and cancelled, and another with the same name was called when
 * first hasn't finished yet - the first to finish will be cancelled
 *
 */

export const afterExecution = (fn: any, data: any) => {
  fn.state.isExecuting = false;
  fn.state.executionTime = (getCurrentTime() - fn.state.timeStart).toFixed(1);
  fn.state.timeStart = 0;

  if (fn.state.isCancelled) {
    fn.state.isCancelled = false;

    const error = new Error(fn.name);
    error.name = errorActionCanceledName;

    throw error;
  }

  return data;
};
