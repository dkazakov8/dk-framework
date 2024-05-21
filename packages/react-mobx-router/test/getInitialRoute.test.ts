import { expect } from 'chai';

import { getInitialRoute } from '../src/utils/getInitialRoute';

import { routes } from './routes';

describe('getInitialRoute', () => {
  it('Get correct static route by path', () => {
    const routeData = getInitialRoute({
      routes,
      pathname: '/test/static',
      fallback: routes.errorRoute,
    });

    expect(routeData).to.deep.eq({ route: routes.staticRoute, params: {} });
  });

  it('Get correct dynamic route by path', () => {
    const routeData = getInitialRoute({
      routes,
      pathname: '/test/foo',
      fallback: routes.errorRoute,
    });

    expect(routeData).to.deep.eq({ route: routes.dynamicRoute, params: { static: 'foo' } });
  });

  it('Fallback', () => {
    let routeData = getInitialRoute({
      routes,
      pathname: '/testX/static',
      fallback: routes.errorRoute,
    });

    expect(routeData).to.deep.eq({ route: routes.errorRoute, params: {} });

    routeData = getInitialRoute({
      routes,
      pathname: '/testX/foo',
      fallback: routes.errorRoute,
    });

    expect(routeData).to.deep.eq({ route: routes.errorRoute, params: {} });
  });
});
