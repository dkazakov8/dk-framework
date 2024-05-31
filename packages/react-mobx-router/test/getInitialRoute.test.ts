import { expect } from 'chai';

import { getInitialRoute } from '../src/utils/getInitialRoute';

import { routes } from './routes';

describe('getInitialRoute', () => {
  it('Get correct static route by path', () => {
    const routeData = getInitialRoute({
      routes,
      pathname: '/test/static',
      fallback: 'error404',
    });

    expect(routeData).to.deep.eq({ route: 'staticRoute', params: {} });
  });

  it('Get correct dynamic route by path', () => {
    const routeData = getInitialRoute({
      routes,
      pathname: '/test/foo',
      fallback: 'error404',
    });

    expect(routeData).to.deep.eq({ route: 'dynamicRoute', params: { static: 'foo' } });
  });

  it('Fallback', () => {
    let routeData = getInitialRoute({
      routes,
      pathname: '/testX/static',
      fallback: 'error404',
    });

    expect(routeData).to.deep.eq({ route: 'error404', params: {} });

    routeData = getInitialRoute({
      routes,
      pathname: '/testX/foo',
      fallback: 'error404',
    });

    expect(routeData).to.deep.eq({ route: 'error404', params: {} });
  });
});
