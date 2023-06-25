import { expect } from 'chai';
import { observable, runInAction } from 'mobx';

import { restoreState } from '../src/restoreState';

describe('restoreState', function test() {
  it('merges correctly', () => {
    const target = observable({
      arr: [],
      obj: {},
      str: '123',
      num: 123,
      nonExistent1: null,
      nonExistent2: undefined,
    });

    const source = {
      arr: [{ obj3: { param: '123' } }],
      obj: {
        obj2: {
          obj3: { param: '123' },
        },
        str: '123',
      },
      obj4: {},
      str: '123',
      num: 123,
      nonExistent1: null,
      nonExistent2: undefined,
    };

    expect(
      restoreState({
        logs: true,
        target,
        source,
        transformers: { batch: runInAction, observable },
      })
    ).to.deep.eq(source);
  });
});
