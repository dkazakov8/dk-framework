import { expect } from 'chai';

import { replaceDynamicValues } from '../src/utils/replaceDynamicValues';

import { routes } from './routes';

describe('replaceDynamicValues', () => {
  it('Dynamic params', () => {
    const pathname = replaceDynamicValues({
      routesObject: routes.dynamicRoute,
      params: { static: 'dynamic' },
    });

    expect(pathname).to.be.eq('/test/dynamic');

    const pathname2 = replaceDynamicValues({
      routesObject: routes.dynamicRoute3,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      params: { ':static': 'dynamic' },
    });

    expect(pathname2).to.be.eq('/test4/dynamic');
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
        params: {} as any,
      });
    }).to.throw(`replaceDynamicValues: no param ":static" passed for route dynamicRoute`);
  });

  it('(error) No dynamic param value multiple', () => {
    expect(() => {
      replaceDynamicValues({
        routesObject: routes.dynamicRouteMultiple,
        params: { param: 'dynamic' } as any,
      });
    }).to.throw(`replaceDynamicValues: no param ":param2" passed for route dynamicRoute`);
  });
});
