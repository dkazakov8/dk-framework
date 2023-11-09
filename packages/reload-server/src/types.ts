import { WatchOptions } from 'chokidar';

export type TypeServerParamsManual = {
  port: number;
  watchPaths: Array<string>;

  https?: boolean;
};

export type TypeServerParams = TypeServerParamsManual & {
  aggregationTimeout: number;

  ignored?: WatchOptions['ignored'];
  changedFilesLogs?: boolean;
};
