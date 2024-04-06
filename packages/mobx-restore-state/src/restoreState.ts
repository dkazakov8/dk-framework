import { runInAction, observable } from 'mobx';

export function restoreState({
  logs,
  target,
  source,
  noBatch,
  prevKey,
}: {
  target: Record<string, any>;
  source: Record<string, any>;
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
          target[key] = observable({});

          if (logs) {
            // eslint-disable-next-line no-console
            console.log(`${logPrefix} set to empty observable object`);
          }
        }

        restoreState({
          target: target[key],
          source: sourceItem,
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
  else runInAction(merge);

  return target;
}
