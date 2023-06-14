type TypeUniqId = string;

type TypeLocalizedValue = string;

type TypeTemplatedValue = string;

export type TypeValues = Record<string, string | number>;

export type TypeMessage = { name: TypeUniqId; defaultValue: TypeTemplatedValue };

export type TypePlugin = (params: { values: TypeValues; text: TypeLocalizedValue }) => string;

export type TypeTranslations = Record<TypeUniqId, TypeLocalizedValue>;
