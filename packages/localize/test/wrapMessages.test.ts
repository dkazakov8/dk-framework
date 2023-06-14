import { expect } from 'chai';

import { errors } from '../src/errors';
import { wrapMessages } from '../src/wrapMessages';

describe('wrap messages', () => {
  it('throws when invalid dirname', () => {
    // @ts-ignore
    expect(() => wrapMessages(null, {})).to.throw(
      `${errors.INCORRECT_DIRNAME}: dirname is not a string or empty`
    );
    // @ts-ignore
    expect(() => wrapMessages('', {})).to.throw(
      `${errors.INCORRECT_DIRNAME}: dirname is not a string or empty`
    );
  });

  it('throws when invalid object', () => {
    // @ts-ignore
    expect(() => wrapMessages('some/dir', null)).to.throw(
      `${errors.INCORRECT_MESSAGES_OBJECT}: wrapMessages needs an object`
    );
  });

  it('normalizes dirname', () => {
    expect(wrapMessages('some\\dir', { key: 'value' })).to.deep.equal({
      key: {
        name: 'some/dir__key',
        defaultValue: 'value',
      },
    });
  });
});
