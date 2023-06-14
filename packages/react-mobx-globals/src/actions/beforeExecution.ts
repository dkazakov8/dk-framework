import { getCurrentTime } from './getCurrentTime';

/**
 * Before every action execution
 *
 */

export const beforeExecution = (fn: any) => {
  fn.state.executionTime = 0;
  fn.state.isExecuting = true;
  fn.state.timeStart = getCurrentTime();
  fn.state.error = undefined;
  fn.state.errorName = undefined;
};
