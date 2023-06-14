import { Component, ComponentClass } from 'react';

import { TypeGlobalsAny } from './types/TypeGlobalsAny';
import { TypeActionData } from './types/TypeActionData';
import { unescapeAllStrings } from './utils/unescapeAllStrings';
import { mergeObservableDeep } from './utils/mergeObservableDeep';
import { TypeCreateContextParams } from './types/TypeCreateContextParams';

/**
 * Extends and clears stores & actions
 *
 */

type PropsModularStoresSetter<TGlobals extends TypeGlobalsAny> = {
  initialData: Partial<TGlobals['store']>;
  transformers: TypeCreateContextParams['transformers'];
  globalContext: TGlobals;
  modularStorePath: keyof TGlobals['actions'];

  logs?: boolean;
  stores?: Partial<TGlobals['store']>;
  actions?: Partial<TGlobals['actions']>;
  noActionsCancel?: boolean;
  logsCanceledActions?: boolean;
};

// @ts-ignore
export function createModularStoresSetter<TGlobals extends TypeGlobalsAny>(): ComponentClass<
  PropsModularStoresSetter<TGlobals>
> {
  class ModularStoresSetter extends Component<PropsModularStoresSetter<TGlobals>> {
    UNSAFE_componentWillMount() {
      this.extendStores();
      this.extendActions();
    }

    componentWillUnmount() {
      const { noActionsCancel } = this.props;

      if (!noActionsCancel) {
        this.cancelExecutingApi();
        this.cancelExecutingActions();
      }

      this.removeStores();
      this.removeActions();
    }

    log = (message: string) => {
      const logsPrefix = '%c[ModularStoresSetter]%c';
      const logsPrefixStyle = 'color: green';
      const logsOriginalStyle = 'color: initial';

      if (this.props.logs) {
        // eslint-disable-next-line no-console
        console.log(`${logsPrefix} ${message}`, logsPrefixStyle, logsOriginalStyle);
      }
    };

    logCanceled = (message: string) => {
      const logsPrefix = '%c[ModularStoresSetter] %c[canceled]%c';
      const logsPrefixStyle = 'color: green';
      const logsCanceledStyle = 'color: red';
      const logsOriginalStyle = 'color: initial';

      if (this.props.logsCanceledActions) {
        // eslint-disable-next-line no-console
        console.log(
          `${logsPrefix} ${message}`,
          logsPrefixStyle,
          logsCanceledStyle,
          logsOriginalStyle
        );
      }
    };

    cancelExecutingApi = () => {
      const { globalContext, transformers } = this.props;

      const apiExecuting = Object.values(globalContext.api).filter(
        (apiFn) => apiFn.state?.isExecuting
      );

      if (apiExecuting.length) {
        transformers.batch(() => {
          apiExecuting.forEach((apiFn) => {
            apiFn.state.isCancelled = true;
          });
        });

        this.logCanceled(apiExecuting.map((apiFn) => `api.${apiFn.name}`).join(', '));
      }
    };

    cancelExecutingActions = () => {
      const { globalContext, modularStorePath, actions, transformers } = this.props;

      if (!actions) return;

      const moduleName = Object.keys(actions)[0];
      const moduleActionsExecuting = Object.entries(
        globalContext.actions[modularStorePath][moduleName]
      ).filter(([, actionFn]) => (actionFn as TypeActionData).state?.isExecuting);

      if (moduleActionsExecuting.length) {
        transformers.batch(() => {
          moduleActionsExecuting.forEach(([, actionFn]) => {
            (actionFn as TypeActionData).state.isCancelled = true;
          });
        });

        this.logCanceled(
          moduleActionsExecuting.map(([actionName]) => `${moduleName}.${actionName}`).join(', ')
        );
      }
    };

    extendStores = () => {
      const { globalContext, modularStorePath, initialData, stores, transformers } = this.props;

      if (!stores) return;

      if (!globalContext.store[modularStorePath]) {
        globalContext.store[modularStorePath] = {};

        this.log(`store extended with empty "${modularStorePath}" object`);
      }

      Object.entries(stores).forEach(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ([storeName, StoreClass]) => {
          if (globalContext.store[modularStorePath][storeName]) return;

          /**
           * Client should recreate dynamic stores with initial data passed from server,
           * because SSR does not serialize get() & set() statements
           *
           */

          globalContext.store[modularStorePath][storeName] = new StoreClass!();

          this.log(`store extended with "${modularStorePath}.${storeName}"`);

          if (initialData) {
            const storeInitialData = initialData[modularStorePath]?.[storeName];

            if (storeInitialData) {
              mergeObservableDeep(
                globalContext.store[modularStorePath][storeName],
                unescapeAllStrings(storeInitialData),
                transformers
              );

              /**
               * Delete from variable for clear SPA experience on navigation (back/forward)
               * so when user comes back to the first loaded page he won't see too old data
               *
               */

              delete initialData[modularStorePath][storeName];

              this.log(
                `initialData for "${modularStorePath}.${storeName}" was restored and deleted from original object`
              );
            }
          }
        }
      );
    };

    removeStores = () => {
      const { globalContext, modularStorePath, stores } = this.props;

      if (!stores) return;

      Object.keys(stores).forEach((storeName) => {
        if (globalContext.store[modularStorePath][storeName]) {
          delete globalContext.store[modularStorePath][storeName];

          this.log(`store removed "${modularStorePath}.${storeName}"`);
        }
      });
    };

    extendActions = () => {
      const { globalContext, modularStorePath, actions } = this.props;

      if (!actions) return;

      /**
       * When actions are mocked during SSR no need to waste time on wrapping
       *
       */

      if (!globalContext.actions[modularStorePath]) {
        globalContext.actions[modularStorePath] = {};

        this.log(`actions extended with empty "${modularStorePath}" object`);
      }

      Object.entries(actions).forEach(([actionGroupName, actionGroup]) => {
        if (globalContext.actions[modularStorePath][actionGroupName]) return;

        // @ts-ignore
        globalContext.actions[modularStorePath][actionGroupName] = {};

        Object.entries(actionGroup!).forEach(([actionName, fn]) => {
          globalContext.actions[modularStorePath][actionGroupName][actionName] =
            globalContext.createWrappedAction(fn as any);
        });

        this.log(`actions extended with "${modularStorePath}.${actionGroupName}"`);
      });
    };

    removeActions = () => {
      const { globalContext, modularStorePath, actions } = this.props;

      if (!actions) return;

      Object.keys(actions).forEach((actionGroupName) => {
        if (globalContext.actions[modularStorePath][actionGroupName]) {
          delete globalContext.actions[modularStorePath][actionGroupName];

          this.log(`actions removed "${modularStorePath}.${actionGroupName}"`);
        }
      });
    };

    render() {
      return this.props.children;
    }
  }

  return ModularStoresSetter;
}
