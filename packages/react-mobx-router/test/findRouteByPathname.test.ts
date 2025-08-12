import { expect } from 'chai';

import { findRouteByPathname } from '../src/utils/findRouteByPathname';
import { routes } from './routes';

describe('findRouteByPathname', () => {
  it('Get correct static route by path', () => {
    const route = findRouteByPathname({ routes, pathname: '/test/static' });

    expect(route).to.deep.eq(routes.staticRoute);

    const route2 = findRouteByPathname({ routes, pathname: '/test/static?q=test' });

    expect(route2).to.deep.eq(routes.staticRoute);
  });

  it('Get correct static route by path with slash', () => {
    const route = findRouteByPathname({ routes, pathname: '/test/static/' });

    expect(route).to.deep.eq(routes.staticRoute);

    const route2 = findRouteByPathname({ routes, pathname: '/test/static/?q=test' });

    expect(route2).to.deep.eq(routes.staticRoute);
  });

  it('Get correct dynamic route by path', () => {
    const route = findRouteByPathname({ routes, pathname: '/test3/123' });

    expect(route).to.deep.eq(routes.dynamicRoute2);

    const route2 = findRouteByPathname({ routes, pathname: '/test4/123/' });

    expect(route2).to.deep.eq(routes.dynamicRoute3);

    const route3 = findRouteByPathname({ routes, pathname: '/test3/123?q=test' });

    expect(route3).to.deep.eq(routes.dynamicRoute2);

    const route4 = findRouteByPathname({ routes, pathname: '/test4/123/?q=test' });

    expect(route4).to.deep.eq(routes.dynamicRoute3);
  });

  it('Pass empty param to dynamic route (no route found)', () => {
    const route = findRouteByPathname({
      routes,
      pathname: '/test/',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(route).to.be.undefined;

    const route2 = findRouteByPathname({
      routes,
      pathname: '/test/?q=test',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(route2).to.be.undefined;
  });

  it('Pass invalid pathname (no route found)', () => {
    const route = findRouteByPathname({
      routes,
      pathname: '/wrongpath',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(route).to.be.undefined;

    const route2 = findRouteByPathname({
      routes,
      pathname: '/wrongpath?q=test',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(route2).to.be.undefined;
  });

  it('Param not passed validator (no route found)', () => {
    const route = findRouteByPathname({
      routes,
      pathname: '/test/p',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(route).to.be.undefined;

    const route2 = findRouteByPathname({
      routes,
      pathname: '/test/p?q=test',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(route2).to.be.undefined;
  });

  it('(error) No validators', () => {
    expect(() =>
      findRouteByPathname({
        routes,
        pathname: '/test2/param',
      })
    ).to.throw('findRoute: missing validator for param ":param"');

    expect(() =>
      findRouteByPathname({
        routes,
        pathname: '/test2/param?q=test',
      })
    ).to.throw('findRoute: missing validator for param ":param"');
  });
});
