import { TypeFnState } from 'dk-mobx-stateful-fn';

export const defaultActionData: TypeFnState = {
  state: {
    timeStart: 0,
    isExecuting: false,
    executionTime: 0,
  },
};
