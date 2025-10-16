import { ChokidarOptions } from 'chokidar';

export type TypeServerParamsManual = {
  port: number;
  watchPaths: Array<string>;

  https?: boolean;
  httpsKeys?: {
    key: string;
    cert: string;
  };
};

export type TypeServerParams = TypeServerParamsManual & {
  aggregationTimeout: number;

  ignored?: ChokidarOptions['ignored'];
  changedFilesLogs?: boolean;
};
