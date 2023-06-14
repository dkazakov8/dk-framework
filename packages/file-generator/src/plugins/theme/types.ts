import { TypeFilePath } from '../../types';

import { pluginName } from './generateTheme';

export type TypePluginNameTheme = typeof pluginName;

export type TypeThemeStrings = Array<string>;

export type TypeThemeName = string;

export type TypeVariableName = string;

export type TypeVariableValue = string;

export type TypeThemes = Record<TypeThemeName, Record<TypeVariableName, TypeVariableValue>>;

export type TypeVariableConfig = { key: TypeVariableName; value: TypeVariableValue };

export type TypeThemeConfig = { name: TypeThemeName; variables: Array<TypeVariableConfig> };

export type TypeProcessParamsTheme = {
  config: Array<{
    file: TypeFilePath;
    targetFile: TypeFilePath;
    exportTemplate: (params: { targetFileNameNoExt: string; themes: TypeThemes }) => string;
  }>;

  logs?: boolean;
  changedFiles?: Array<TypeFilePath>;
};
