import loadable from '@loadable/component';

import { TypeValidator } from './TypeValidator';

export type TypeRouteRaw = {
  path: string;
  loader: ReturnType<typeof loadable> | (() => Promise<{ default: any }>);
  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;
  params?: Record<string, TypeValidator>;
  beforeEnter?: (
    config: {
      nextUrl: string;
      nextRoute: any;
      nextPathname: string;
      nextQuery?: any;
      nextSearch?: string;

      currentUrl?: string;
      currentQuery?: any;
      currentRoute?: any;
      currentSearch?: string;
      currentPathname?: string;
    },
    ...args: Array<any>
  ) => Promise<any>;
  beforeLeave?: (
    config: {
      nextUrl: string;
      nextRoute: any;
      nextPathname: string;
      nextQuery?: any;
      nextSearch?: string;

      currentUrl?: string;
      currentQuery?: any;
      currentRoute?: any;
      currentSearch?: string;
      currentPathname?: string;
    },
    ...args: Array<any>
  ) => Promise<any> | null;
};
