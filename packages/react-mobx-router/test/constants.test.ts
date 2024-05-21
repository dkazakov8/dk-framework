import { expect } from 'chai';

import { constants } from '../src/utils/constants';

describe('constants', () => {
  it('Correct constants', () => {
    expect(constants).to.deep.eq({
      dynamicSeparator: ':',
      pathPartSeparator: '/',
      isClient: false,
      errorRedirect: 'REDIRECT',
      errorPrevent: 'PREVENT_REDIRECT',
    });
  });
});
