export const getTypedKeys = Object.keys as <T extends Record<string, any>>(
  obj: T
) => Array<keyof T>;
