import { ComponentClass } from 'react';

import { TypeRouteItem } from './TypeRouteItem';

export type TypeRouteItemFinal = TypeRouteItem & {
  name: string;
  store?: any;
  actions?: any;
  pageName?: string;
  component?: ComponentClass;
};
