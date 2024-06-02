import loadable from '@loadable/component';

import { TypeValidator } from './TypeValidator';

export type TypeRouteRaw = {
  path: string;
  loader: ReturnType<typeof loadable> | (() => Promise<{ default: any }>);
  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;
  params?: Record<string, TypeValidator>;
  beforeEnter?: (...args: Array<any>) => Promise<any>;
  beforeLeave?: (nextRoute: any, ...args: Array<any>) => Promise<any> | null;
};
