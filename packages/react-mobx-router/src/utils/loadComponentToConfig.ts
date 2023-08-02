import { ComponentClass } from 'react';

import { TypeRouteItemFinal } from '../types/TypeRouteItemFinal';

export function loadComponentToConfig(params: {
  componentConfig: TypeRouteItemFinal;
}): Promise<void> {
  const { componentConfig } = params;

  if (!componentConfig.component && componentConfig.loader) {
    const loadingFn =
      typeof componentConfig.loader === 'function'
        ? componentConfig.loader
        : // @ts-ignore
          componentConfig.loader.load;

    return loadingFn().then(
      (module: { default: ComponentClass; store?: any; actions?: any; pageName: string }) => {
        componentConfig.component = module.default;
        componentConfig.store = module.store;
        componentConfig.actions = module.actions;
        componentConfig.pageName = module.pageName;
      }
    );
  }

  return Promise.resolve();
}
