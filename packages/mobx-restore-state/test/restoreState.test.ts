import { expect } from 'chai';
import { isObservable, observable } from 'mobx';

import { restoreState } from '../src/restoreState';

describe('restoreState', function test() {
  it('merges with restoreState', () => {
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
      str2: '123',
      num: 123,
      num2: 123,
      nonExistent1: null,
      nonExistent2: undefined,
      nonExistent3: null,
    };

    const result = restoreState({ logs: true, target, source });

    expect(result).to.deep.eq(source);

    expect(isObservable(result)).to.deep.eq(true);
    expect(isObservable(result.arr)).to.deep.eq(true);
    expect(isObservable(result.arr[0])).to.deep.eq(true);
    expect(isObservable(result.arr[0].obj3)).to.deep.eq(true);
    expect(isObservable(result.obj)).to.deep.eq(true);
    expect(isObservable(result.obj4)).to.deep.eq(true);
    expect(isObservable(result.obj.obj2)).to.deep.eq(true);
  });

  it('merges incorrectly with Object.assign', () => {
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
      str2: '123',
      num: 123,
      num2: 123,
      nonExistent1: null,
      nonExistent2: undefined,
      nonExistent3: null,
    };

    const result2 = Object.assign(target, source) as any;

    expect(result2).to.deep.eq(source);

    expect(isObservable(result2)).to.deep.eq(true);
    expect(isObservable(result2.arr)).to.deep.eq(true);
    expect(isObservable(result2.arr[0])).to.deep.eq(true);
    expect(isObservable(result2.arr[0].obj3)).to.deep.eq(true);
    expect(isObservable(result2.obj)).to.deep.eq(true);
    expect(isObservable(result2.obj4)).to.deep.eq(false); // BUG
    expect(isObservable(result2.obj.obj2)).to.deep.eq(true);
    expect(isObservable(result2.obj.obj2.obj3)).to.deep.eq(true);
  });

  it('merges incorrectly with Object.assign (simplified)', () => {
    const target = observable({ str: '123' });
    const source = { str: '321', obj: {} };

    const result = Object.assign(target, source);

    expect(result).to.deep.eq(source);
    expect(isObservable(result)).to.deep.eq(true);
    expect(isObservable(result.obj)).to.deep.eq(false); // BUG
  });
});
