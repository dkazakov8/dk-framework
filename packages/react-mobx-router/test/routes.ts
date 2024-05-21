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
    params: { static: '' as string },
    loader: undefined as any,
  },
  dynamicRoute2: {
    path: '/test3/:static',
    validators: {
      static: (value: string) => value.length > 2,
    },
    params: { static: '' as string },
    loader: undefined as any,
  },
  dynamicRoute3: {
    path: '/test4/::static',
    validators: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ':static': (value: string) => value.length > 2,
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    params: { ':static': '' as string },
    loader: undefined as any,
  },
  // @ts-ignore
  dynamicRouteNoValidators: {
    path: '/test2/:param',
    params: { param: '' as string },
    loader: undefined as any,
  },
  dynamicRouteMultiple: {
    path: '/test/:param/:param2',
    validators: {
      param: (value: string) => value.length > 2,
      param2: (value: string) => value.length > 2,
    },
    params: { param: '' as string, param2: '' as string },
    loader: undefined as any,
  },
  error404: {
    path: '/error404',
    params: {},
    props: { errorNumber: 404 },
    loader: undefined as any,
  },
  error500: {
    path: '/error500',
    params: {},
    props: { errorNumber: 500 },
    loader: undefined as any,
  },
});
