export type TypeFnState = {
  state: {
    mock?: any;
    error?: string;
    errorName?: string;
    timeStart: number;
    isExecuting: boolean;
    executionTime: number;
  };
};
