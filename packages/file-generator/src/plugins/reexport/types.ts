import { TypeFilePath, TypeFolderPath } from '../../types';

import { pluginName } from './generateReexport';

export type TypePluginNameReexport = typeof pluginName;

export type TypeProcessParamsReexport = {
  config: Array<{
    folder: TypeFolderPath;
    importTemplate: (params: { fileNameNoExt: string; fileName: string }) => string;
    fileNameTemplate: (params: { folderName: string }) => string;

    headerTemplate?: string;
    exportTemplate?: (params: { fileNamesNoExt: Array<string>; folderName: string }) => string;
    includeChildrenMask?: RegExp;
  }>;

  logs?: boolean;
  changedFiles?: Array<TypeFilePath>;
};
