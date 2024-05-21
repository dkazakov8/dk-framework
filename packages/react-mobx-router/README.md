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

3. Configure a router store

```typescript
import { makeAutoObservable } from 'mobx';
import { InterfaceRouterStore } from 'dk-react-mobx-router';

import { routes } from 'routes';

type TInterfaceRouterStore = InterfaceRouterStore<typeof routes>;

export class RouterStore implements TInterfaceRouterStore {
  constructor() {
    makeAutoObservable(this);
  }

  routesHistory: TInterfaceRouterStore['routesHistory'] = [];
  currentRoute: TInterfaceRouterStore['currentRoute'] = {} as any;
}

// Singlton pattern does not work in SSR so create where needed
export const routerStore = new RouterStore();
```

4. Configure an action for redirecting. It may be an independent function if you do not need SSR and
use a Singleton architecture

```typescript
import { redirectToGenerator } from 'dk-react-mobx-router';
import { addState } from 'dk-mobx-stateful-fn';

import { routes } from 'routes';
import { routerStore } from 'routerStore';

const redirectToWithoutState = redirectToGenerator({
  routes,
  routerStore,
  routeError500: routes.error500,
});

// This is optional, but helpful in lots of scenarios
// Read https://github.com/dkazakov8/dk-framework/tree/master/packages/mobx-stateful-fn

export const redirectTo = addState(redirectToWithoutState, 'redirectTo');
```

Or may be a part of `RouterStore` if you need SSR

```typescript
import { addState } from 'dk-mobx-stateful-fn';

export class RouterStore implements TInterfaceRouterStore {
  constructor() {
    makeAutoObservable(this, { redirectTo: false });
    
    // This is optional, but helpful in lots of scenarios
    // Read https://github.com/dkazakov8/dk-framework/tree/master/packages/mobx-stateful-fn
    
    this.redirectTo = addState(this.redirectTo.bind(this), 'redirectTo');
  }

  routesHistory: TInterfaceRouterStore['routesHistory'] = [];
  currentRoute: TInterfaceRouterStore['currentRoute'] = {} as any;
  
  redirectTo = redirectToGenerator({
    routes,
    routerStore: this,
    routeError500: routes.error500,
  });
}
```

I personally prefer putting this function to a separate layer called "global actions". So this library
does not dictate you how to write the code, it's very flexible.

5. Now it is time to create a Router React component that will react to changes of `routerStore.currentRoute`
and render a relevant page component.






















