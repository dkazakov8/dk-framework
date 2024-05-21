import { createRouterConfig } from '../src/createRouterConfig';

export const routes = createRouterConfig({
  staticRoute: {
    path: '/test/static',
    params: {},
    loader: undefined as any,
  },
  dynamicRoute: {
    path: '/test/:static',
    validators: {
      static: (value: string) => value.length > 2,
    },
    params: { static: '1' as string },
    loader: undefined as any,
  },
  dynamicRoute2: {
    path: '/test3/:static',
    validators: {
      static: (value: string) => value.length > 2,
    },
    params: { static: '1' as string },
    loader: undefined as any,
  },
  dynamicRoute3: {
    path: '/test4/::static',
    validators: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ':static': (value: string) => value.length > 2,
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    params: { ':static': '1' as string },
    loader: undefined as any,
  },
  // @ts-ignore
  dynamicRouteNoValidators: {
    path: '/test2/:param',
    params: { param: '1' as string },
    loader: undefined as any,
  },
  dynamicRouteMultiple: {
    path: '/test/:param/:param2',
    validators: {
      param: (value: string) => value.length > 2,
      param2: (value: string) => value.length > 2,
    },
    params: { param: '1' as string, param2: '1' as string },
    loader: undefined as any,
  },
  errorRoute: {
    path: '/test/error',
    params: {},
    loader: undefined as any,
  },
});
