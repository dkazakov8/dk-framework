export type TypeFnState = {
  state: {
    mock?: Promise<any>;
    error?: string;
    timeStart: number;
    errorName?: string;
    isExecuting: boolean;
    isCancelled?: boolean;
    executionTime: number;
  };
};
