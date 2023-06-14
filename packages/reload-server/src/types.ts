import { WatchOptions } from 'chokidar';

export type TypeServerParams = {
  port: number;
  watchPaths: Array<string>;
  aggregationTimeout: number;

  https?: boolean;
  ignored?: WatchOptions['ignored'];
  changedFilesLogs?: boolean;
};
