import { expect } from 'chai';
import { action, autorun, observable, runInAction } from 'mobx';

import { mergeObservableDeep } from '../src/utils/mergeObservableDeep';
import { escapeAllStrings } from '../src/utils/escapeAllStrings';
import { unescapeAllStrings } from '../src/utils/unescapeAllStrings';

describe('mergeObservableDeep', function test() {
  it('merges correctly', () => {
    const store = observable({
      arr: [],
      obj: {},
      str: '123',
      num: 123,
      nonExistent1: null,
      nonExistent2: undefined,
    });

    const initialData = {
      arr: [{ obj3: { param: '123' } }],
      obj: {
        obj2: {
          obj3: { param: '123' },
        },
        str: '123',
      },
      str: '123',
      num: 123,
      nonExistent1: null,
      nonExistent2: undefined,
    };

    expect(
      mergeObservableDeep(store, initialData, { action, batch: runInAction, autorun, observable })
    ).to.deep.eq(initialData);
  });
});

describe('escape and unescape', function test() {
  it('escape correctly', () => {
    const initialData = {
      arr: [{ obj3: { param: '12>3' } }],
      obj: {
        obj2: {
          obj3: { param: '1<"23' },
        },
        str: '123',
      },
      str: '1&&23',
      num: 123,
      nonExistent1: null,
      nonExistent2: undefined,
    };

    const result = {
      arr: [{ obj3: { param: '12&gt;3' } }],
      obj: {
        obj2: {
          obj3: { param: '1&lt;&quot;23' },
        },
        str: '123',
      },
      str: '1&amp;&amp;23',
      num: 123,
      nonExistent1: null,
      nonExistent2: undefined,
    };

    expect(escapeAllStrings(initialData)).to.deep.eq(result);
  });

  it('unescape correctly', () => {
    const initialData = {
      arr: [{ obj3: { param: '12&gt;3' } }],
      obj: {
        obj2: {
          obj3: { param: '1&lt;&quot;23' },
        },
        str: '123',
      },
      str: '1&amp;&amp;23',
      num: 123,
      nonExistent1: null,
      nonExistent2: undefined,
    };

    const result = {
      arr: [{ obj3: { param: '12>3' } }],
      obj: {
        obj2: {
          obj3: { param: '1<"23' },
        },
        str: '123',
      },
      str: '1&&23',
      num: 123,
      nonExistent1: null,
      nonExistent2: undefined,
    };

    expect(unescapeAllStrings(initialData)).to.deep.eq(result);
  });
});
