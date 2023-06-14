/* eslint-disable @typescript-eslint/no-magic-numbers */

import { expect } from 'chai';

import { getLn } from '../src/getLn';
import { errors } from '../src/errors';

describe('get localization', () => {
  it('throws when no message name', () => {
    expect(() => getLn({}, { name: '', defaultValue: '' })).to.throw(
      `${errors.INCORRECT_MESSAGE_FORMAT}: incorrect message name`
    );
    // @ts-ignore
    expect(() => getLn({}, { name: null, defaultValue: '' })).to.throw(
      `${errors.INCORRECT_MESSAGE_FORMAT}: incorrect message name`
    );
    // @ts-ignore
    expect(() => getLn({}, { defaultValue: '' })).to.throw(
      `${errors.INCORRECT_MESSAGE_FORMAT}: incorrect message name`
    );
  });

  it('throws when no message defaultValue', () => {
    // @ts-ignore
    expect(() => getLn({}, { name: 'name', defaultValue: null })).to.throw(
      `${errors.INCORRECT_MESSAGE_FORMAT}: no message defaultValue`
    );
    // @ts-ignore
    expect(() => getLn({}, { name: 'name' })).to.throw(
      `${errors.INCORRECT_MESSAGE_FORMAT}: no message defaultValue`
    );
  });

  it('default value used when no localization', () => {
    expect(getLn({}, { name: 'name', defaultValue: 'test' })).to.equal(`test`);
  });

  it('value used when possible in localization', () => {
    expect(
      // eslint-disable-next-line @typescript-eslint/naming-convention
      getLn({ 'some/uniq/id__name': 'test2' }, { name: 'some/uniq/id__name', defaultValue: 'test' })
    ).to.equal(`test2`);
  });

  it('with plugins', () => {
    const values = {
      value1: 'some string',
      value2: 123,
      value3: 'another string',
      value4: 0,
      value5: 1,
    };

    expect(
      getLn(
        {},
        {
          name: 'name',
          defaultValue:
            'value1 {value1} {value2: item,items} {value2} {value3} {value4} {value5} {value4: item,items} {value5: item,items} {value4: item,items}',
        },
        values
      )
    ).to.equal('value1 some string items 123 another string 0 1 items item items');
  });
});
