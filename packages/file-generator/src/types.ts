import { BaseGenerator } from './BaseGenerator';

export type TypeFilePath = string;

export type TypeFolderPath = string;

export type TypeModifiedFiles = Array<string>;

export type TypePluginConstructorParams<TConfig> = {
  config: Array<TConfig>;
} & Partial<TConfig>;

export type TypeCommon = {
  logs?: boolean;
  changedFiles?: Array<TypeFilePath>;
};

export type TypeGenerateFilesParams = {
  plugins: Array<BaseGenerator>;

  changedFiles?: Array<string>;
  timeLogsOverall?: boolean;
  fileModificationLogs?: boolean;

  watch?: {
    paths: Array<string>;

    onStart?: () => void;
    onFinish?: () => void;
    changedFilesLogs?: boolean;

    /**
     * Aggregate file changes during this time (ms).
     * Use when you got some IDE reformatting (prettier, stylelint, eslint),
     * so watcher will be called only once with the final file version.
     *
     * You can measure your IDE reformatting speed by omitting this param and calculating
     * time difference between the same file changes.
     *
     */
    aggregationTimeout?: number;
  };
};
