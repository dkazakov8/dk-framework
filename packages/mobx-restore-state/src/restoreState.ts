import { runInAction, observable } from 'mobx';

export function restoreState(
  target: Record<string, any>,
  source: Record<string, any>,
  transformers: {
    batch: typeof runInAction;
    observable: typeof observable;
  }
) {
  transformers.batch(() => {
    for (const key in source) {
      if (!source.hasOwnProperty(key)) continue;

      const sourceItem = source[key];
      const targetItem = target[key];

      if (Object.prototype.toString.call(sourceItem) === '[object Object]') {
        if (!targetItem) target[key] = transformers.observable({});

        restoreState(target[key], sourceItem, transformers);
      } else {
        target[key] = sourceItem;
      }
    }
  });

  return target;
}
