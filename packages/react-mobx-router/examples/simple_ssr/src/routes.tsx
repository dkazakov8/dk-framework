import { createRouterConfig } from 'dk-react-mobx-router';

export const routes = createRouterConfig({
  home: {
    path: '/',
    params: {},
    loader: (() => import('./pages/home')) as any,
  },
  static: {
    path: '/static',
    params: {},
    loader: (() => import('./pages/static')) as any,
  },
  dynamic: {
    path: '/page/:param',
    validators: {
      param: (value: string) => value.length > 2,
    },
    params: { param: '' as string },
    loader: (() => import('./pages/dynamic')) as any,
  },
  error404: {
    // this page is necessary
    path: '/error',
    params: {},
    props: { errorCode: 404 },
    loader: (() => import('./pages/error')) as any,
  },
  error500: {
    // this page is necessary
    path: '/error',
    params: {},
    props: { errorCode: 500 },
    loader: (() => import('./pages/error')) as any,
  },
});
