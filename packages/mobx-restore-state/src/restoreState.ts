import { runInAction, observable } from 'mobx';

export function restoreState({
  logs,
  target,
  source,
  noBatch,
  prevKey,
  transformers,
}: {
  target: Record<string, any>;
  source: Record<string, any>;
  transformers: {
    batch: typeof runInAction;
    observable: typeof observable;
  };
  logs?: boolean;
  noBatch?: boolean;
  prevKey?: string;
}) {
  function merge() {
    for (const key in source) {
      if (!source.hasOwnProperty(key)) continue;

      const sourceItem = source[key];
      const targetItem = target[key];
      const logPrefix = `target.${prevKey ? `${prevKey}.` : ''}${key}`;

      if (Object.prototype.toString.call(sourceItem) === '[object Object]') {
        if (!targetItem) {
          target[key] = transformers.observable({});

          if (logs) {
            // eslint-disable-next-line no-console
            console.log(`${logPrefix} set to empty observable object`);
          }
        }

        restoreState({
          target: target[key],
          source: sourceItem,
          transformers,
          noBatch: true,
          prevKey: prevKey ? `${prevKey}.${key}` : key,
          logs,
        });
      } else if (target[key] !== sourceItem) {
        target[key] = sourceItem;

        if (logs) {
          // eslint-disable-next-line no-console
          console.log(`${logPrefix} set to`, sourceItem);
        }
      } else if (logs) {
        // eslint-disable-next-line no-console
        console.log(`${logPrefix} not modified`, target[key]);
      }
    }
  }

  if (noBatch) merge();
  else transformers.batch(merge);

  return target;
}
