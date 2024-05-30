import { createRouterConfig } from '../src/createRouterConfig';

export const routes = createRouterConfig({
  staticRoute: {
    path: '/test/static',
    loader: (() => Promise.resolve(require('./pages/static'))) as any,
  },
  dynamicRoute: {
    path: '/test/:static',
    params: { static: (value) => value.length > 2 },
    loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
  },
  dynamicRoute2: {
    path: '/test3/:static',
    params: { static: (value) => value.length > 2 },
    loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
  },
  dynamicRoute3: {
    path: '/test4/::static',
    params: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ':static': (value) => value.length > 2,
    },
    loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
  },
  // @ts-ignore
  dynamicRouteNoValidators: {
    path: '/test2/:param',
    loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
  },
  dynamicRouteMultiple: {
    path: '/test/:param/:param2',
    params: {
      param: (value) => value.length > 2,
      param2: (value) => value.length > 2,
    },
    loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
  },
  error404: {
    path: '/error404',
    props: { errorNumber: 404 },
    loader: (() => Promise.resolve(require('./pages/error'))) as any,
  },
  error500: {
    path: '/error500',
    props: { errorNumber: 500 },
    loader: (() => Promise.resolve(require('./pages/error'))) as any,
  },
});
