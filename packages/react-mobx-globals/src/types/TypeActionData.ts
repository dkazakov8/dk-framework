export type TypeActionData = {
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
