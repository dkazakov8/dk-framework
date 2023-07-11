export type TypeFnState = {
  state: {
    mock?: any;
    error?: string;
    timeStart: number;
    errorName?: string;
    isExecuting: boolean;
    isCancelled?: boolean;
    executionTime: number;
  };
};
