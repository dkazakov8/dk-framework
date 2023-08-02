import { expect } from 'chai';

import { createRouterConfig } from '../src/createRouterConfig';
import { getDynamicValues } from '../src/utils/getDynamicValues';
import { findRouteByPathname } from '../src/utils/findRouteByPathname';
import { replaceDynamicValues } from '../src/utils/replaceDynamicValues';

// @ts-ignore
const routes = createRouterConfig({
  dynamicRoute: {
    path: '/test/:static',
    validators: {
      static: (value: string) => value.length > 2,
    },
    params: { static: '1' as string },
    loader: undefined as any,
  },
  staticRoute: {
    path: '/test/static',
    params: {},
    loader: undefined as any,
  },
  dynamicRoute2: {
    path: '/test3/:static',
    validators: {
      static: (value: string) => value.length > 2,
    },
    params: { static: '1' as string },
    loader: undefined as any,
  },
  // @ts-ignore
  dynamicRouteNoValidators: {
    path: '/test2/:param',
    params: { param: '1' as string },
    loader: undefined as any,
  },
  dynamicRouteMultiple: {
    path: '/test/:param/:param2',
    validators: {
      param: (value: string) => value.length > 2,
      param2: (value: string) => value.length > 2,
    },
    params: { param: '1' as string, param2: '1' as string },
    loader: undefined as any,
  },
});

describe('findRouteByPathname', function test() {
  it('Get correct static route by path', () => {
    const route = findRouteByPathname({ routes, pathname: '/test/static' });

    expect(route).to.deep.eq(routes.staticRoute);
  });

  it('Get correct static route by path with slash', () => {
    const route = findRouteByPathname({ routes, pathname: '/test/static/' });

    expect(route).to.deep.eq(routes.staticRoute);
  });

  it('Get correct dynamic route by path', () => {
    const route = findRouteByPathname({ routes, pathname: '/test3/123/' });

    expect(route).to.deep.eq(routes.dynamicRoute2);
  });

  it('Pass empty param to dynamic route (no route found)', () => {
    const route = findRouteByPathname({
      routes,
      pathname: '/test/',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(route).to.be.undefined;
  });

  it('Pass invalid pathname (no route found)', () => {
    const route = findRouteByPathname({
      routes,
      pathname: '/wrongpath',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(route).to.be.undefined;
  });

  it('Param not passed validator (no route found)', () => {
    const route = findRouteByPathname({
      routes,
      pathname: '/test/p',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(route).to.be.undefined;
  });

  it('(error) No validators', () => {
    expect(() =>
      findRouteByPathname({
        routes,
        pathname: '/test2/param',
      })
    ).to.throw('findRoute: missing validator for param ":param"');
  });
});

describe('replaceDynamicValues', function test() {
  it('Dynamic params', () => {
    const pathname = replaceDynamicValues({
      routesObject: routes.dynamicRoute,
      params: { static: 'dynamic' },
    });

    expect(pathname).to.be.eq('/test/dynamic');
  });

  it('Dynamic params multiple', () => {
    const pathname = replaceDynamicValues({
      routesObject: routes.dynamicRouteMultiple,
      params: { param: 'dynamic', param2: 'dynamic2' },
    });

    expect(pathname).to.be.eq('/test/dynamic/dynamic2');
  });

  it('(error) No dynamic param value', () => {
    expect(() => {
      replaceDynamicValues({
        routesObject: routes.dynamicRoute,
        // @ts-ignore
        params: {},
      });
    }).to.throw(`replaceDynamicValues: no param ":static" passed for route dynamicRoute`);
  });
});

describe('getDynamicValues', function test() {
  it('Should return params from pathname', () => {
    const params = getDynamicValues({
      routesObject: routes.dynamicRoute,
      pathname: '/test/dynamic',
    });

    expect(params).to.deep.equal({ static: 'dynamic' });
  });

  it('Should return multi params from pathname', () => {
    const params = getDynamicValues({
      routesObject: routes.dynamicRouteMultiple,
      pathname: '/test/dynamic/dynamic2',
    });

    expect(params).to.deep.equal({ param: 'dynamic', param2: 'dynamic2' });
  });

  it('Should return empty params', () => {
    const params = getDynamicValues({
      routesObject: routes.staticRoute,
      pathname: '/test/static',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(params).to.be.empty;
  });
});
