import loadable from '@loadable/component';

export type TypeRouteItem = {
  path: string;
  loader: ReturnType<typeof loadable> | (() => Promise<{ default: any }>);
  params: Record<string, string>;
  props?: Record<string, any>;
  validators?: Record<string, (param: string) => boolean>;
  beforeEnter?: (...args: Array<any>) => Promise<any>;
  beforeLeave?: (nextRoute: any, ...args: Array<any>) => Promise<any> | null;
};
