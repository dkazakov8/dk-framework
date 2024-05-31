import { expect } from 'chai';

import { getDynamicValues } from '../src/utils/getDynamicValues';

import { routes } from './routes';

describe('getDynamicValues', () => {
  it('Should return params from pathname', () => {
    const params = getDynamicValues({
      route: routes.dynamicRoute,
      pathname: '/test/dynamic',
    });

    expect(params).to.deep.equal({ static: 'dynamic' });

    const params2 = getDynamicValues({
      route: routes.dynamicRoute3,
      pathname: '/test4/dynamic',
    });

    // eslint-disable-next-line @typescript-eslint/naming-convention
    expect(params2).to.deep.equal({ ':static': 'dynamic' });
  });

  it('Should return multi params from pathname', () => {
    const params = getDynamicValues({
      route: routes.dynamicRouteMultiple,
      pathname: '/test/dynamic/dynamic2',
    });

    expect(params).to.deep.equal({ param: 'dynamic', param2: 'dynamic2' });
  });

  it('Should return empty params', () => {
    const params = getDynamicValues({
      route: routes.staticRoute,
      pathname: '/test/static',
    });

    // eslint-disable-next-line no-unused-expressions
    expect(params).to.be.empty;
  });
});
