import { ComponentClass } from 'react';

import { TypeRoutesGenerator } from '../types/TypeRoutesGenerator';

export function loadComponentToConfig(params: {
  componentConfig: TypeRoutesGenerator<any>[string];
}): Promise<void> {
  const { componentConfig } = params;

  if (!componentConfig.component) {
    const loadingFn =
      typeof componentConfig.loader === 'function'
        ? componentConfig.loader
        : componentConfig.loader.load;

    return loadingFn().then((module: { default: ComponentClass }) => {
      componentConfig.component = module.default;
    });
  }

  return Promise.resolve();
}
