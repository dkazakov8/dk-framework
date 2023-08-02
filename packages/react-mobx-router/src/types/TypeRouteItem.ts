import loadable from '@loadable/component';

export type TypeRouteItem = {
  path: string;
  loader: ReturnType<typeof loadable>;
  params: Record<string, string>;
  props?: Record<string, any>;
  validators?: Record<string, (param: string) => boolean>;
  beforeEnter?: (globals: any) => Promise<any>;
  beforeLeave?: (globals: any, nextRoute: any, event?: BeforeUnloadEvent) => Promise<any> | null;
};
