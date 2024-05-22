import { ComponentClass } from 'react';

import { TypeRouteRaw } from './TypeRouteRaw';

export type TypeRoute = TypeRouteRaw & {
  name: string;
  store?: any;
  actions?: any;
  pageName?: string;
  component?: ComponentClass;
};
