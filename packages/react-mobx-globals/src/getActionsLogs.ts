import { TypeActionLog } from './types/TypeActionLog';
import { TypeGlobalsAny } from './types/TypeGlobalsAny';
import { getPlainActions } from './getPlainActions';
import { TypeCreateContextParams } from './types/TypeCreateContextParams';

function getLoggedActions({
  type,
  lastItem,
  transformers,
  actionsArray,
  currentRouteName,
}: {
  type: 'ACTION' | 'API';
  lastItem: Array<TypeActionLog> | undefined;
  actionsArray: Array<any>;
  currentRouteName: string;
  transformers: TypeCreateContextParams['transformers'];
}) {
  return actionsArray
    .filter((actionFn) => {
      const logName = type === 'ACTION' ? actionFn.name : `API ${actionFn.name}`;

      const lastItemFn = lastItem?.find(({ name }) => name === logName);

      if (!actionFn.state.isExecuting) {
        if (!lastItemFn || !actionFn.state.executionTime || lastItemFn.executionTime) {
          return false;
        }

        /**
         * If action has finished, update previous column with it's execution time
         *
         */

        transformers.batch(() => {
          lastItemFn!.executionTime = actionFn.state.executionTime;
        });

        return false;
      }

      /**
       * If action has not finished, include
       *
       */

      return true;
    })
    .sort((a, b) => a.state.timeStart - b.state.timeStart)
    .map((actionFn) => ({
      name: type === 'ACTION' ? actionFn.name : `API ${actionFn.name}`,
      type,
      routeName: currentRouteName,
    }));
}

export function getActionsLogs({
  globals,
  isClient,
  actionsLogs,
  routerStore,
  transformers,
}: {
  globals: TypeGlobalsAny;
  isClient: boolean;
  actionsLogs: Array<Array<TypeActionLog>>;
  routerStore: any;
  transformers: TypeCreateContextParams['transformers'];
}) {
  return transformers.autorun(() => {
    /**
     * Actions are extendable, so have to loop every time
     *
     */

    const plainApi = Object.values(globals.api);
    const plainActions = getPlainActions(globals.actions);

    const currentRouteName = !isClient ? 'server' : routerStore.currentRoute?.name || 'INITIAL';

    const lastItem: Array<TypeActionLog> | undefined = routerStore.lastActionsLog;

    const finalItem = [
      ...getLoggedActions({
        type: 'ACTION',
        lastItem,
        actionsArray: plainActions,
        currentRouteName,
        transformers,
      }),
      ...getLoggedActions({
        type: 'API',
        lastItem,
        actionsArray: plainApi,
        currentRouteName,
        transformers,
      }),
    ];

    if (finalItem.length > 0 && JSON.stringify(lastItem) !== JSON.stringify(finalItem)) {
      transformers.batch(() => actionsLogs.push(finalItem as any));
    }
  });
}
