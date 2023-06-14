import { TypeCreateContextParams } from '../types/TypeCreateContextParams';

export function mergeObservableDeep(
  target: Record<string, any>,
  source: Record<string, any>,
  transformers: TypeCreateContextParams['transformers']
) {
  transformers.batch(() => {
    for (const key in source) {
      if (!source.hasOwnProperty(key)) continue;

      const sourceItem = source[key];
      const targetItem = target[key];

      if (Object.prototype.toString.call(sourceItem) === '[object Object]') {
        if (!targetItem) target[key] = transformers.observable({});

        mergeObservableDeep(target[key], sourceItem, transformers);
      } else {
        target[key] = sourceItem;
      }
    }
  });

  return target;
}
