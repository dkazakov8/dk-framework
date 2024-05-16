## DK Framework

> [!WARNING]  
> It's fine if you use these libraries from NPM package with a **static versioning** in case you
> want it for some pet-project or to test it's capabilities.
>
> But for production use it's **strongly recommended** to create a fork, because I do not write
> Changelogs and may break / add some functionality without notice.

This multi-repository is my personal collection of libraries designed for the efficient development 
of SPA applications.

It primarily focuses on Node.js, React, MobX, and Webpack, although I now utilize Esbuild, 
rendering Webpack repositories somewhat outdated.

Feel free to explore for inspiration or fork these libraries to use in your own projects.

#### Here is a list of libraries that already have good documentation:

Mobx:
- [dk-mobx-restore-state](https://github.com/dkazakov8/dk-framework/tree/master/packages/mobx-restore-state) - Library for safe merging of MobX observables
- [dk-mobx-stateful-fn](https://github.com/dkazakov8/dk-framework/tree/master/packages/mobx-stateful-fn) - Library for adding MobX observable state to async functions
- [dk-mobx-use-store](https://github.com/dkazakov8/dk-framework/tree/master/packages/mobx-use-store) - Library for connecting MobX View Models to your React components

Node.js:
- [dk-compare-env](https://github.com/dkazakov8/dk-framework/tree/master/packages/compare-env) - Comparison utility for .env files
- [dk-reload-server](https://github.com/dkazakov8/dk-framework/tree/master/packages/reload-server) - Reload browser on files change
- [dk-file-generator](https://github.com/dkazakov8/dk-framework/tree/master/packages/file-generator) - Powerful helper that generates files for you
- [dk-bff-server](https://github.com/dkazakov8/dk-framework/tree/master/packages/bff-server) - Simple Backend-For-Frontend server

Webpack:
- [dk-webpack-parallel-simple](https://github.com/dkazakov8/dk-framework/tree/master/packages/webpack-parallel-simple) - Parallel Webpack builds
- [dk-conditional-aggregate-webpack-plugin](https://github.com/dkazakov8/dk-framework/tree/master/packages/conditional-aggregate-webpack-plugin) - Delays Webpack aggregateTimeout

ESLint:
- [dk-eslint-config](https://github.com/dkazakov8/dk-framework/tree/master/packages/eslint-config) - Enterprise-quality ESLint config

Axios / validators:
- [dk-request](https://github.com/dkazakov8/dk-framework/tree/master/packages/request) - Request utility with validations based on Axios & ts-interface-checker
- [dk-checker-remove-extraneous](https://github.com/dkazakov8/dk-framework/tree/master/packages/checker-remove-extraneous) - Utility for removing extraneous params via ts-interface-checker

Localization:
- [dk-localize](https://github.com/dkazakov8/dk-framework/tree/master/packages/localize) - Library for injecting texts into templates (just an approach, the capabilities are limited)

#### These libraries will never have a documentation:

Read the source code and find some useful parts for you projects

- [dk-webpack-config](https://github.com/dkazakov8/dk-framework/tree/master/packages/webpack-config) - Webpack config for web & BFF written in TS + ES Modules

#### And here is what I work on currently:

Actually I use them in my projects for many years, but haven't managed to write docs.

- [dk-react-mobx-router](https://github.com/dkazakov8/dk-framework/tree/master/packages/react-mobx-router)
- [dk-react-mobx-config-form](https://github.com/dkazakov8/dk-framework/tree/master/packages/react-mobx-config-form)
- [dk-react-react-mobx-globals](https://github.com/dkazakov8/dk-framework/tree/master/packages/react-mobx-globals)
- [dk-react-react-mobx-globals-logger](https://github.com/dkazakov8/dk-framework/tree/master/packages/react-mobx-globals-logger)

### So, my approach to developing SPAs is as follows (a checklist for me):

- Configure ESLint + StyleLint with `dk-eslint-config`
- Configure TypeScript
- Configure .env files with `dk-compare-env`
- Create a BFF with `dk-bff-server`
- Create a build pipeline with `dk-webpack-config` + `dk-webpack-parallel-simple`
- Configure `dk-reload-server` for the browser reloading on rebuild
- Configure `dk-file-generator` that makes all the dirty work for me
- Create a global React context with `dk-react-react-mobx-globals`
- Tune API-layer with `dk-request`
- Configure Localization layer with `dk-localize`
- Create routes with `dk-react-mobx-router`
- Organize SSR + hydration with `dk-mobx-restore-state`
- Write ViewModels (local store layer) with `dk-mobx-use-store`
- Write forms with `dk-react-mobx-config-form`
- Add something like `react-styleguidist` for components library
- Add something like `cypress` for E2E tests
- Add something like `Sentry` for debugging
- Add Dockerfile

So, the project is ready for some business-specific logic.
