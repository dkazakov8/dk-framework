import { getPlainActions } from 'dk-react-mobx-globals';
import { autorun, runInAction } from 'mobx';

import { TypeActionLog } from './TypeActionLog';

function getLoggedActions({
  type,
  lastItem,
  actionsArray,
  currentRouteName,
}: {
  type: 'ACTION' | 'API';
  lastItem: Array<TypeActionLog> | undefined;
  actionsArray: Array<any>;
  currentRouteName: string;
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

        runInAction(() => {
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
}: {
  globals: any;
  isClient: boolean;
  actionsLogs: Array<Array<TypeActionLog>>;
  routerStore: any;
}) {
  return autorun(() => {
    /**
     * Actions are extendable, so have to loop every time
     *
     */

    const plainApi = Object.values(globals.api);
    const plainActions = getPlainActions(globals.actions);

    const currentRouteName = !isClient ? 'server' : 'client';

    const lastItem: Array<TypeActionLog> | undefined = routerStore.lastActionsLog;

    const finalItem = [
      ...getLoggedActions({
        type: 'ACTION',
        lastItem,
        actionsArray: plainActions,
        currentRouteName,
      }),
      ...getLoggedActions({
        type: 'API',
        lastItem,
        actionsArray: plainApi,
        currentRouteName,
      }),
    ];

    if (finalItem.length > 0 && JSON.stringify(lastItem) !== JSON.stringify(finalItem)) {
      runInAction(() => actionsLogs.push(finalItem as any));
    }
  });
}
