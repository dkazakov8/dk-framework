export function escapeHelper(
  item: Record<string, any> | string | Array<string>,
  fn: (str: string) => string
): any {
  if (typeof item === 'string') return fn(item);

  if (Array.isArray(item)) return item.map((prop) => escapeHelper(prop, fn));

  if (Object.prototype.toString.call(item) === '[object Object]') {
    for (const key in item) {
      if (item.hasOwnProperty(key)) item[key] = escapeHelper(item[key], fn);
    }
  }

  return item;
}
