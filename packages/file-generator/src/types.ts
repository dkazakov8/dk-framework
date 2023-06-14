import { TypeProcessParamsTheme, TypePluginNameTheme } from './plugins/theme/types';
import { TypeProcessParamsReexport, TypePluginNameReexport } from './plugins/reexport/types';
import { TypeProcessParamsValidators, TypePluginNameValidators } from './plugins/validators/types';
import {
  TypeProcessParamsReexportModular,
  TypePluginNameReexportModular,
} from './plugins/reexport-modular/types';

export type TypeFilePath = string;

export type TypeFolderPath = string;

export type TypeModifiedFiles = Array<string>;

export type TypeGeneratorPlugin<TParams> = (params: TParams) => TypeModifiedFiles;

export type TypeGeneratorPluginData =
  | { plugin: TypePluginNameTheme; config: TypeProcessParamsTheme['config'] }
  | { plugin: TypePluginNameReexport; config: TypeProcessParamsReexport['config'] }
  | { plugin: TypePluginNameValidators; config: TypeProcessParamsValidators['config'] }
  | { plugin: TypePluginNameReexportModular; config: TypeProcessParamsReexportModular['config'] };

export type TypeGenerateFilesParams = {
  configs: Array<TypeGeneratorPluginData>;

  timeLogs?: boolean;
  changedFiles?: Array<string>;
  timeLogsOverall?: boolean;
  fileModificationLogs?: boolean;

  watch?: {
    /**
     * Watch this paths
     *
     */
    paths: Array<string>;

    onStart?: () => void;
    onFinish?: () => void;
    changedFilesLogs?: boolean;

    /**
     * Aggregate file changes during this time (ms).
     * Use when you got some IDE reformatting (prettier, stylelint, eslint),
     * so watcher will be called only once with final file version.
     *
     * You can measure your IDE reformatting speed by omitting this param and calculating
     * time difference between the same file changes.
     *
     */
    aggregationTimeout?: number;
  };
};
