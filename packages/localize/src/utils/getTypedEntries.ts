type TypeEntries<T> = Array<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;

export const getTypedEntries = Object.entries as <T extends Record<string, any>>(
  obj: T
) => TypeEntries<T>;
