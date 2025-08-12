export type TypeThemeStrings = Array<string>;

export type TypeThemeName = string;

export type TypeVariableName = string;

export type TypeVariableValue = string;

export type TypeThemes = Record<TypeThemeName, Record<TypeVariableName, TypeVariableValue>>;

export type TypeVariableConfig = { key: TypeVariableName; value: TypeVariableValue };

export type TypeThemeConfig = { name: TypeThemeName; variables: Array<TypeVariableConfig> };
