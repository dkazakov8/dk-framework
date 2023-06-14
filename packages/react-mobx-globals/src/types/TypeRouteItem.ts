export type TypeRouteItem = {
  name: string;
  path: string;
  loader: any;
  params: Record<string, string>;

  props?: Record<string, any>;
  validators?: Record<string, (value: string) => boolean>;
  beforeEnter?: (globals: any) => Promise<any>;
  beforeLeave?: (globals: any, nextRoute: any, event?: BeforeUnloadEvent) => Promise<any> | null;
};
