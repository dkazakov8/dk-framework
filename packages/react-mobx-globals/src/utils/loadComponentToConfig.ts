import { ComponentClass } from 'react';

import { TypeRoutesGenerator } from '../types/TypeRoutesGenerator';

export function loadComponentToConfig(params: {
  componentConfig: TypeRoutesGenerator<any>[string];
}): Promise<void> {
  const { componentConfig } = params;

  return Promise.all([
    Promise.resolve().then(() => {
      if (!componentConfig.component && componentConfig.loader) {
        const loadingFn =
          typeof componentConfig.loader === 'function'
            ? componentConfig.loader
            : componentConfig.loader.load;

        return loadingFn().then((module: { default: ComponentClass }) => {
          componentConfig.component = module.default;
        });
      }

      return Promise.resolve();
    }),
    Promise.resolve().then(() => {
      if (!componentConfig.actions && componentConfig.actionsLoader) {
        const loadingFn =
          typeof componentConfig.actionsLoader === 'function'
            ? componentConfig.actionsLoader
            : componentConfig.actionsLoader.load;

        return loadingFn().then((module: any) => {
          componentConfig.actions = module;
        });
      }

      return Promise.resolve();
    }),
    Promise.resolve().then(() => {
      if (!componentConfig.store && componentConfig.storeLoader) {
        const loadingFn =
          typeof componentConfig.storeLoader === 'function'
            ? componentConfig.storeLoader
            : componentConfig.storeLoader.load;

        return loadingFn().then((module: any) => {
          componentConfig.store = module;
        });
      }

      return Promise.resolve();
    }),
  ]).then(() => undefined);
}
