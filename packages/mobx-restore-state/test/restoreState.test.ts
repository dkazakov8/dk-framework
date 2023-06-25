import { expect } from 'chai';
import { observable, runInAction } from 'mobx';

import { restoreState } from '../src/restoreState';

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

    expect(restoreState(store, initialData, { batch: runInAction, observable })).to.deep.eq(
      initialData
    );
  });
});
