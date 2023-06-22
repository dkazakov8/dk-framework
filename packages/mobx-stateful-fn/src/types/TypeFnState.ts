export type TypeFnState = {
  state: {
    mock?: any;
    error?: string;
    errorName?: string;
    isCancelled?: boolean;
    timeStart: number;
    isExecuting: boolean;
    executionTime: number;
  };
};
