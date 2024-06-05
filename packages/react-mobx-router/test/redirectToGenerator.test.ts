/* eslint-disable @typescript-eslint/naming-convention */

import _ from 'lodash';
import { expect } from 'chai';
import { spy } from 'sinon';

import { constants } from '../src/utils/constants';
import { getInitialRoute } from '../src/utils/getInitialRoute';
import { createRouterConfig } from '../src/createRouterConfig';
import { replaceDynamicValues } from '../src/utils/replaceDynamicValues';
import { InterfaceRouterStore } from '../src/types/InterfaceRouterStore';
import { TypeRoute } from '../src/types/TypeRoute';
import { TypeRouteWithParams } from '../src/types/TypeRouteWithParams';

import { routes } from './routes';
import { getData } from './helpers';

function checkHistory(routerStore: InterfaceRouterStore<any>, history: Array<TypeRouteWithParams>) {
  expect(routerStore.routesHistory).to.deep.eq(
    history.map((c) =>
      replaceDynamicValues({
        route: c,
        params: c.params,
      })
    )
  );
}

function checkCurrent(routerStore: InterfaceRouterStore<any>, route: TypeRouteWithParams) {
  expect(routerStore.currentRoute).to.deep.eq({
    name: route.name,
    path: route.path,
    props: route.props,
    params: route.params || {},
    query: route.query,
    pageName:
      // eslint-disable-next-line no-nested-ternary
      route.path === '/test/static'
        ? 'static'
        : ['/error404', '/error500'].includes(route.path)
          ? 'error'
          : 'dynamic',
  });

  if (route.path === '/test/static') {
    expect(route.store).to.deep.eq('');
    expect(route.actions).to.deep.eq('');
  }
}

function checkHistoryAndCurrent(
  routerStore: InterfaceRouterStore<any>,
  history: Array<TypeRouteWithParams>
) {
  checkHistory(routerStore, history);
  checkCurrent(routerStore, history[history.length - 1]);
}

function cloneWithParams<TRoute extends TypeRoute>(config: {
  route: TRoute;
  params?: Record<keyof TRoute['params'], string>;
  query?: Record<keyof TRoute['params'], string>;
}): TypeRouteWithParams {
  if ('params' in config) {
    return Object.assign(_.cloneDeep(config.route) as any, {
      params: config.params,
      query: config.query || {},
    });
  }

  return Object.assign(_.cloneDeep(config.route) as any, {
    query: config.query || {},
  });
}

describe('redirectToGenerator', () => {
  function test1(mode: 'separate' | 'store') {
    const customRoutes = routes;

    const { redirectTo, routerStore } = getData(mode, customRoutes);

    expect(typeof redirectTo).to.deep.eq('function');
    expect(routerStore.routesHistory).to.deep.eq([]);
    expect(routerStore.currentRoute).to.deep.eq({});

    return Promise.resolve();
  }

  function test2(mode: 'separate' | 'store') {
    const customRoutes = routes;

    const { redirectTo, routerStore } = getData(mode, customRoutes);

    const initialRoute = getInitialRoute({
      routes: customRoutes,
      pathname: customRoutes.staticRoute.path,
      fallback: 'error404',
    });

    const history: Array<TypeRouteWithParams> = [];

    return Promise.resolve()
      .then(() => redirectTo(initialRoute))
      .then(() => {
        history.push(cloneWithParams({ route: customRoutes.staticRoute }));

        checkHistoryAndCurrent(routerStore, history);
      });
  }

  function test3(mode: 'separate' | 'store') {
    const customRoutes = routes;

    const { redirectTo, routerStore } = getData(mode, customRoutes);

    const initialRoute = getInitialRoute({
      routes: customRoutes,
      pathname: '/testX/static',
      fallback: 'error404',
    });

    const history: Array<TypeRouteWithParams> = [];

    return Promise.resolve()
      .then(() => redirectTo(initialRoute))
      .then(() => {
        history.push(cloneWithParams({ route: customRoutes.error404 }));

        checkHistoryAndCurrent(routerStore, history);
      });
  }

  function test4(mode: 'separate' | 'store') {
    const customRoutes = routes;

    const { redirectTo, routerStore } = getData(mode, customRoutes);

    const history: Array<TypeRouteWithParams> = [];

    return (
      Promise.resolve()
        .then(() => redirectTo({ route: 'staticRoute' }))
        .then(() => {
          history.push(cloneWithParams({ route: customRoutes.staticRoute }));

          checkHistoryAndCurrent(routerStore, history);
        })
        .then(() => redirectTo({ route: 'staticRoute' }))
        // Does not add to routesHistory, it's good
        .then(() => {
          checkHistoryAndCurrent(routerStore, history);
        })
    );
  }

  function test5(mode: 'separate' | 'store') {
    const customRoutes = routes;

    const { redirectTo, routerStore } = getData(mode, customRoutes);

    const history: Array<TypeRouteWithParams> = [];

    return (
      Promise.resolve()
        .then(() => redirectTo({ route: 'staticRoute' }))
        .then(() => {
          history.push(cloneWithParams({ route: customRoutes.staticRoute }));

          checkHistoryAndCurrent(routerStore, history);
        })
        .then(() => redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } }))
        .then(() => {
          history.push(
            cloneWithParams({ route: customRoutes.dynamicRoute, params: { static: 'asd' } })
          );

          checkHistoryAndCurrent(routerStore, history);
        })
        .then(() => redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } }))
        .then(() => {
          checkHistoryAndCurrent(routerStore, history);
        })
        // @ts-ignore
        .then(() => redirectTo({ route: 'dynamicRoute' }))
        .catch((error) => {
          expect(error.message).to.deep.eq(
            'replaceDynamicValues: no param ":static" passed for route dynamicRoute'
          );
          checkHistoryAndCurrent(routerStore, history);
        })
        .then(() => redirectTo({ route: 'dynamicRoute', params: { static: 'foo' } }))
        .then(() => {
          history.push(
            cloneWithParams({ route: customRoutes.dynamicRoute, params: { static: 'foo' } })
          );

          checkHistoryAndCurrent(routerStore, history);
        })
    );
  }

  function test6(mode: 'separate' | 'store') {
    const beforeEnter_spy = spy();
    const beforeEnter_spy2 = spy();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: (() => Promise.resolve(require('./pages/static'))) as any,
        beforeEnter(param: string) {
          beforeEnter_spy(param);

          return Promise.resolve();
        },
      },
      spyTwoDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
        beforeEnter(param: string) {
          beforeEnter_spy2(param);

          return Promise.resolve();
        },
      },
      redirectToSpyOne: {
        path: '/test/static3',
        loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
        beforeEnter: (() => {
          return Promise.resolve({ route: 'spyOne' });
        }) as any,
      },
      buggyCode: {
        path: '/test/static4',
        loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
        beforeEnter: (() => {
          // eslint-disable-next-line no-unused-expressions
          a;

          return Promise.resolve();
        }) as any,
      },
      error500: {
        path: '/error500',
        props: { errorNumber: 500 },
        loader: (() => Promise.resolve(require('./pages/error'))) as any,
      },
    });

    const { redirectTo, routerStore } = getData(mode, customRoutes, ['']);

    const history: Array<TypeRouteWithParams> = [];
    let countSpy1 = 0;
    let countSpy2 = 0;

    return Promise.resolve()
      .then(() => redirectTo({ route: 'spyOne' }))
      .then(() => {
        countSpy1 += 1;

        expect(beforeEnter_spy.callCount, 'beforeEnter_spy').to.deep.eq(countSpy1);
        expect(beforeEnter_spy.getCall(0).args[0], 'beforeEnter_spy').to.deep.eq('');

        history.push(cloneWithParams({ route: customRoutes.spyOne }));

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'spyOne' }))
      .then(() => {
        expect(beforeEnter_spy.callCount, 'beforeEnter_spy').to.deep.eq(countSpy1);

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'spyTwoDynamic', params: { static: 'asd' } }))
      .then(() => {
        countSpy2 += 1;

        expect(beforeEnter_spy.callCount, 'beforeEnter_spy').to.deep.eq(countSpy1);
        expect(beforeEnter_spy2.callCount, 'beforeEnter_spy2').to.deep.eq(countSpy2);
        expect(beforeEnter_spy2.getCall(0).args[0], 'beforeEnter_spy2').to.deep.eq('');

        history.push(
          cloneWithParams({ route: customRoutes.spyTwoDynamic, params: { static: 'asd' } })
        );

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'spyTwoDynamic', params: { static: 'xyz' } }))
      .then(() => {
        countSpy2 += 1;

        expect(beforeEnter_spy.callCount, 'beforeEnter_spy').to.deep.eq(countSpy1);
        expect(beforeEnter_spy2.callCount, 'beforeEnter_spy2').to.deep.eq(countSpy2);

        history.push(
          cloneWithParams({ route: customRoutes.spyTwoDynamic, params: { static: 'xyz' } })
        );

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'redirectToSpyOne' }))
      .catch((error) => {
        // SSR should handle redirects manually and not push to history or change current
        expect(error.name).to.deep.eq(constants.errorRedirect);
        expect(error.message).to.deep.eq(customRoutes.spyOne.path);

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'buggyCode' }))
      .catch((error) => {
        // SSR on syntax error should not push to history, replace currentRoute with error500
        expect(error.message).to.deep.eq('a is not defined');

        checkHistory(routerStore, history);
        checkCurrent(routerStore, cloneWithParams({ route: customRoutes.error500 }));
      })
      .then(() => {
        expect(beforeEnter_spy.callCount, 'beforeEnter_spy').to.deep.eq(countSpy1);
        expect(beforeEnter_spy2.callCount, 'beforeEnter_spy2').to.deep.eq(countSpy2);

        return redirectTo({ route: 'redirectToSpyOne', asClient: true });
      })
      .then(() => {
        countSpy1 += 1;

        // Front handles redirects automatically and calls lifecycle
        expect(beforeEnter_spy.callCount, 'beforeEnter_spy').to.deep.eq(countSpy1);
        expect(beforeEnter_spy2.callCount, 'beforeEnter_spy2').to.deep.eq(countSpy2);

        history.push(cloneWithParams({ route: customRoutes.spyOne }));

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'buggyCode', asClient: true }))
      .then(() => {
        // Front does not throw an exception on buggy code, replace currentRoute with error500
        checkHistory(routerStore, history);
        checkCurrent(routerStore, cloneWithParams({ route: customRoutes.error500 }));
      });
  }

  function test7(mode: 'separate' | 'store') {
    const beforeLeave_spy = spy();
    const beforeLeave_spy2 = spy();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: (() => Promise.resolve(require('./pages/static'))) as any,
        beforeLeave(route: any, param: string) {
          beforeLeave_spy(param);

          return Promise.resolve();
        },
      },
      spyTwoDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
        beforeLeave(nextRoute: any, param: string) {
          beforeLeave_spy2(param);

          return Promise.resolve();
        },
      },
      preventRedirect: {
        path: '/test/prevent-redirect',
        loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
        beforeLeave: ((nextRoute: any) => {
          if (nextRoute.name === 'spyOne') {
            const err = Object.assign(new Error(''), { name: constants.errorPrevent });

            return Promise.reject(err);
          }

          return Promise.resolve();
        }) as any,
      },
      buggyCode: {
        path: '/test/buggy-code',
        loader: (() => Promise.resolve(require('./pages/dynamic'))) as any,
        beforeLeave: (() => {
          // eslint-disable-next-line no-unused-expressions
          a;

          return Promise.resolve();
        }) as any,
      },
      error500: {
        path: '/error500',
        props: { errorNumber: 500 },
        loader: (() => Promise.resolve(require('./pages/error'))) as any,
      },
    });

    const { redirectTo, routerStore } = getData(mode, customRoutes, ['']);

    const history: Array<TypeRouteWithParams> = [];
    let countSpy1 = 0;
    let countSpy2 = 0;

    return Promise.resolve()
      .then(() => redirectTo({ route: 'spyOne' }))
      .then(() => {
        expect(beforeLeave_spy.callCount, 'beforeLeave_spy').to.deep.eq(countSpy1);
        expect(beforeLeave_spy.callCount, 'beforeLeave_spy').to.deep.eq(countSpy2);

        history.push(cloneWithParams({ route: customRoutes.spyOne }));

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'spyOne' }))
      .then(() => {
        expect(beforeLeave_spy.callCount, 'beforeLeave_spy').to.deep.eq(countSpy1);

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'spyTwoDynamic', params: { static: 'asd' } }))
      .then(() => {
        countSpy1 += 1;

        expect(beforeLeave_spy.callCount, 'beforeLeave_spy').to.deep.eq(countSpy1);
        expect(beforeLeave_spy.getCall(0).args[0], 'beforeLeave_spy').to.deep.eq('');

        expect(beforeLeave_spy2.callCount, 'beforeLeave_spy2').to.deep.eq(countSpy2);

        history.push(
          cloneWithParams({ route: customRoutes.spyTwoDynamic, params: { static: 'asd' } })
        );

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'spyOne' }))
      .then(() => {
        countSpy2 += 1;

        expect(beforeLeave_spy.callCount, 'beforeLeave_spy').to.deep.eq(countSpy1);
        expect(beforeLeave_spy2.callCount, 'beforeLeave_spy2').to.deep.eq(countSpy2);
        expect(beforeLeave_spy2.getCall(0).args[0], 'beforeLeave_spy2').to.deep.eq('');

        history.push(cloneWithParams({ route: customRoutes.spyOne }));

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'preventRedirect' }))
      .then(() => {
        history.push(cloneWithParams({ route: customRoutes.preventRedirect }));

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'spyOne' }))
      .then(() => {
        // Redirect to spyOne prevented
        checkHistoryAndCurrent(routerStore, history);
        checkCurrent(routerStore, cloneWithParams({ route: customRoutes.preventRedirect }));
      })
      .then(() => redirectTo({ route: 'spyTwoDynamic', params: { static: 'asd' } }))
      .then(() => {
        // Redirect to spyTwoDynamic not prevented
        history.push(
          cloneWithParams({ route: customRoutes.spyTwoDynamic, params: { static: 'asd' } })
        );

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'buggyCode' }))
      .then(() => {
        history.push(cloneWithParams({ route: customRoutes.buggyCode }));

        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'spyOne' }))
      .catch((error) => {
        // SSR on syntax error should not push to history, replace currentRoute with error500
        expect(error.message).to.deep.eq('a is not defined');

        checkHistory(routerStore, history);
        checkCurrent(routerStore, cloneWithParams({ route: customRoutes.error500 }));
      })
      .then(() => redirectTo({ route: 'buggyCode', asClient: true }))
      .then(() => {
        checkHistoryAndCurrent(routerStore, history);
      })
      .then(() => redirectTo({ route: 'spyOne', asClient: true }))
      .catch((error) => {
        // Front on syntax error should not push to history, replace currentRoute with error500
        expect(error.message).to.deep.eq('a is not defined');

        checkHistory(routerStore, history);
        checkCurrent(routerStore, cloneWithParams({ route: customRoutes.error500 }));
      });
  }

  it('Creates', () => test1('separate').then(() => test1('store')));
  it('Sets initial route', () => test2('separate').then(() => test2('store')));
  it('Sets initial route not found', () => test3('separate').then(() => test3('store')));
  it('Several redirect to same route', () => test4('separate').then(() => test4('store')));
  it('Several redirects', () => test5('separate').then(() => test5('store')));
  it('Before enter', () => test6('separate').then(() => test6('store')));
  it('Before leave', () => test7('separate').then(() => test7('store')));
});
