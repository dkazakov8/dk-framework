import { CompilerOptions } from 'typescript';

import { TypeFilePath, TypeFolderPath } from '../../types';

import { pluginName } from './generateValidators';

export type TypePluginNameValidators = typeof pluginName;

export type TypeProcessParamsValidators = {
  config: Array<{
    folder: TypeFolderPath;
    targetFolder: TypeFolderPath;

    triggerFolder?: TypeFolderPath;
    headerTemplate?: string;
    compilerOptions?: CompilerOptions;
    includeChildrenMask?: RegExp;
  }>;

  logs?: boolean;
  changedFiles?: Array<TypeFilePath>;
};
