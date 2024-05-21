## Config-based routing for React + MobX applications

![coverage](https://github.com/dkazakov8/dk-framework/blob/master/packages/react-mobx-router/cover.svg)
[![npm](https://img.shields.io/npm/v/dk-react-mobx-router)](https://www.npmjs.com/package/dk-react-mobx-router)
[![license](https://img.shields.io/npm/l/dk-react-mobx-router)](https://github.com/dkazakov8/dk-framework/blob/master/packages/react-mobx-router/LICENSE)

> [!WARNING]  
> It's fine if you use this library from NPM package with a **static versioning** in case you
> want it for some pet-project or to test it's capabilities.
>
> But for production use it's **strongly recommended** to create a fork, because I do not write
> Changelogs and may break / add some functionality without notice.

I CURRENTLY WRITE THIS DOCUMENTATIONS, IT'S NOT READY YET

### Features

- Has lifecycle with `beforeEnter` and `beforeLeave`
- Supports dynamically loaded components (from async chunks like `() => import('/some-page')`)
- Supports dynamically loaded modular stores and actions for pages
- Supports SSR
- Ensures that every dynamic param from URL has a validator
- TypeScript works for every route and it's dynamic params
- It is a separate layer, no more markup like `<Route path="..." />` inside React components

### Usage

1. Install `dk-react-mobx-router`
2. Create a basic routes config `routes.ts`

```typescript
import { createRouterConfig } from 'dk-react-mobx-router';

import PageError from 'src/pages/PageError';
import PageStatic from 'src/pages/PageStatic';
import PageDynamic from 'src/pages/PageDynamic';

export const routes = createRouterConfig({
  staticRoute: {
    path: '/static',
    params: {},
    component: PageStatic as any,
  },
  dynamicRoute: {
    path: '/:dynamic',
    validators: {
      dynamic: (value: string) => value.length > 2,
    },
    params: { dynamic: '' },
    component: PageDynamic as any,
  },
  error404: {
    path: '/test/error',
    params: {},
    props: { errorCode: 404 },
    component: PageError as any,
  },
  error500: {
    path: '/test/error',
    params: {},
    props: { errorCode: 500 },
    component: PageError as any,
  },
});
```

3. Configure action for redirecting

```typescript
import { redirectToGenerator, TypeRedirectToParams } from 'dk-react-mobx-router';

import { routes } from 'routes';

export const redirectTo = (params: TypeRedirectToParams<typeof routes>) => {
  return redirectToGenerator({
    routes,
    routerStore: globals.store.router,
    routeError500: routes.error500,
  })(params);
};
```


























