import { expect } from 'chai';

import { isDynamic } from '../src/utils/isDynamic';
import { clearDynamic } from '../src/utils/clearDynamic';

describe('isDynamic', () => {
  it('Correctly detects', () => {
    expect(isDynamic('test')).to.eq(false);
    expect(isDynamic('t:e:s:t:')).to.eq(false);
    expect(isDynamic(':test')).to.eq(true);
    expect(isDynamic(':t:e:s:t:')).to.eq(true);
    expect(isDynamic('::t:e:s:t:')).to.eq(true);
  });
});

describe('clearDynamic', () => {
  it('Correctly clears', () => {
    expect(clearDynamic('test')).to.eq('test');
    expect(clearDynamic('t:e:s:t:')).to.eq('t:e:s:t:');
    expect(clearDynamic('test')).to.eq('test');
    expect(clearDynamic(':t:e:s:t:')).to.eq('t:e:s:t:');
    expect(clearDynamic('::t:e:s:t:')).to.eq(':t:e:s:t:');
  });
});
