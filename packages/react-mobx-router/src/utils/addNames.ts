type TypeObjectWithNames<T> = { [Key in keyof T]: T[Key] & { name: Key } };

export function addNames<T extends Record<string, any>>(obj: T): TypeObjectWithNames<T> {
  Object.entries(obj).forEach(([key, value]) => {
    value.name = key;
  });

  return obj as TypeObjectWithNames<T>;
}
