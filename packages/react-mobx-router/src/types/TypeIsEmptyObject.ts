export type TypeIsEmptyObject<TObj extends Record<string, unknown>> = [keyof TObj] extends [never]
  ? true
  : false;
