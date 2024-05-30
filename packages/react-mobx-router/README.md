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

### Setup

The setup consists of 3 parts:
- routes config - describes your routes in a plain object
- router store - a MobX store or an object that includes current route data and transitions history
- redirect function - may be a part of the router store or a separate function

1. Install `dk-react-mobx-router`, `dk-mobx-stateful-fn` and `mobx-react-lite`
2. Create a basic routes config `routes.ts`

```typescript
import { createRouterConfig } from 'dk-react-mobx-router';

export const routes = createRouterConfig({
  home: {
    path: '/',
    // "as any" prevents TypeScript circular dependency error 
    // if you import "routes" inside your component
    loader: (() => import('./pages/home')) as any,
  },
  static: {
    path: '/static',
    loader: (() => import('./pages/static')) as any,
  },
  dynamic: {
    path: '/page/:foo/id/:bar',
    params: {
      foo: (value) => value.length > 2,
      bar: (value) => value.length > 0,
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
  // we will load/hydrate initial route before app render, so "as any" is safe
  currentRoute: TInterfaceRouterStore['currentRoute'] = {} as any;
}

export const routerStore = new RouterStore();
```

4. Configure an action for redirecting. It may be an independent function if you do not need SSR and
use a Singleton architecture

```typescript
import { redirectToGenerator } from 'dk-react-mobx-router';
import { addState } from 'dk-mobx-stateful-fn';

import { routes } from 'routes';
import { routerStore } from 'routerStore';

const redirectToWithoutState = addState(redirectToGenerator({
  routes,
  routerStore,
  routeError500: routes.error500,
}), 'redirectTo');
```

Or may be a part of `RouterStore`

```typescript
import { addState } from 'dk-mobx-stateful-fn';

export class RouterStore implements TInterfaceRouterStore {
  constructor() {
    makeAutoObservable(this, { redirectTo: false });
    
    this.redirectTo = addState(this.redirectTo, 'redirectTo');
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

```typescript
import { Router as RouterMobx } from 'dk-react-mobx-router';
import { observer } from 'mobx-react-lite';

import { routes } from 'routes';
import { routerStore } from 'routerStore';

// observer decorator is not necessary, it just gives "memo"
export const Router = observer(() => {
  return (
    <RouterMobx
      routes={routes}
      redirectTo={routerStore.redirectTo}
      routerStore={routerStore}
    />
  );
});
```

6. The last step to make it work - find an initial route and render React application (an example for SPA
without SSR)

```typescript
import { getInitialRoute } from 'dk-react-mobx-router';
import { observer } from 'mobx-react-lite';
import { createRoot } from 'react-dom/client';

import { Router } from 'components/Router';
import { routes } from 'routes';
import { routerStore } from 'routerStore';

const App = observer(() => {
  return (
    <>
      <div className="menu">
        <div 
          onClick={() => routerStore.redirectTo({ route: routes.home })}
          className={routerStore.currentRoute.name === 'home' ? 'active' : ''}
        >
          Home
        </div>
        <div 
          onClick={() => routerStore.redirectTo({ route: routes.static })}
          className={routerStore.currentRoute.name === 'static' ? 'active' : ''}
        >
          Static
        </div>
        <div 
          onClick={() => routerStore.redirectTo({ route: routes.dynamic, params: { foo: 'test', bar: 'smth' } })}
          className={routerStore.currentRoute.name === 'dynamic' ? 'active' : ''}
        >
          Dynamic
        </div>
      </div>
      <Router />
    </>
  );
});

Promise.resolve()
  // be sure to load an initial route
  .then(() => routerStore.redirectTo(getInitialRoute({ 
    routes, 
    pathname: location.pathname, 
    fallback: routes.error404 
  })))
  .then(() => createRoot(document.getElementById('app')!).render(<App />));
```

The full code for this example (SPA without SSR version) is 
[here](https://github.com/dkazakov8/dk-framework/tree/master/packages/react-mobx-router/examples/simple_spa).
It is configured with code-splitting for every page, but it's easy to disable this function
in bundler config.




















