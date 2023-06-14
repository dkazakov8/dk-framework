import { TypeFilePath, TypeFolderPath } from '../../types';

import { pluginName } from './generateReexportModular';

export type TypePluginNameReexportModular = typeof pluginName;

export type TypeSubFolderOrFile = { subFolderOrFilePath: string; moduleName: string };

export type TypeProcessParamsReexportModular = {
  config: Array<{
    folder: TypeFolderPath;
    targetFile: TypeFilePath;
    childFileOrFolderName: TypeFilePath | TypeFolderPath;
    importTemplate: (params: { moduleName: string; relativePath: string }) => string;
    exportTemplate: (params: { subFoldersOfFiles: Array<TypeSubFolderOrFile> }) => string;

    headerTemplate?: string;
    includeChildrenMask?: RegExp;
  }>;

  logs?: boolean;
  changedFiles?: Array<TypeFilePath>;
};
