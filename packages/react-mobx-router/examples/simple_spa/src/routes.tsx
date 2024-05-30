import { createRouterConfig } from 'dk-react-mobx-router';

export const routes = createRouterConfig({
  home: {
    path: '/',
    loader: (() => import('./pages/home')) as any,
  },
  static: {
    path: '/static',
    loader: (() => import('./pages/static')) as any,
  },
  dynamic: {
    path: '/page/:foo',
    params: {
      foo: (value: string) => value.length > 2,
    },
    loader: (() => import('./pages/dynamic')) as any,
  },
  // this page is necessary
  error404: {
    path: '/error',
    props: { errorCode: 404 },
    loader: (() => import('./pages/error')) as any,
  },
  // this page is necessary
  error500: {
    path: '/error',
    props: { errorCode: 500 },
    loader: (() => import('./pages/error')) as any,
  },
});
