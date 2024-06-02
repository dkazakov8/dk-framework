import { ComponentClass } from 'react';

import { TypeRoute } from '../types/TypeRoute';

export function loadComponentToConfig(params: { route: TypeRoute }): Promise<void> {
  const { route } = params;

  if (!route.component && route.loader) {
    const loadingFn =
      typeof route.loader === 'function'
        ? route.loader
        : // @ts-ignore
          route.loader.load;

    return loadingFn().then(
      (module: { default: ComponentClass; store?: any; actions?: any; pageName?: string }) => {
        route.component = module.default;
        route.store = module.store;
        route.actions = module.actions;
        route.pageName = module.pageName;
      }
    );
  }

  return Promise.resolve();
}
