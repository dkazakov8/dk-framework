import { expect } from 'chai';
import { isObservable, makeAutoObservable, observable } from 'mobx';

import { restoreState } from '../src/restoreState';

function getTargetObject() {
  return observable({
    arr: [],
    obj: {},
    str: '123',
    num: 123,
    nonExistent1: null,
    nonExistent2: undefined,
  });
}

function getTargetClassWithInitializer() {
  return new (class Target {
    constructor() {
      makeAutoObservable(this);
    }

    arr = [];
    obj = {};
    obj4: any;
    str = '123';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    num = 123;
    nonExistent1 = null;
    nonExistent2 = undefined;
  })();
}

function getTargetClassWithUndefined() {
  return new (class Target {
    constructor() {
      makeAutoObservable(this);
    }

    arr = [];
    obj = {};
    obj4 = undefined;
    str = '123';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    num = 123;
    nonExistent1 = null;
    nonExistent2 = undefined;
  })();
}

function getTargetClassNotDefined() {
  return new (class Target {
    constructor() {
      makeAutoObservable(this);
    }

    arr = [];
    obj = {};
    str = '123';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    num = 123;
    nonExistent1 = null;
    nonExistent2 = undefined;
  })();
}

function getSourceObject() {
  return {
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
}

describe('restoreState', function test() {
  function check(result: any, source: any) {
    expect(result, 'result equals source').to.deep.eq(source);

    expect(isObservable(result), 'result isObservable').to.deep.eq(true);
    expect(isObservable(result.arr), 'result.arr isObservable').to.deep.eq(true);
    expect(isObservable(result.arr[0]), 'result.arr[0] isObservable').to.deep.eq(true);
    expect(isObservable(result.arr[0].obj3), 'result.arr[0].obj3 isObservable').to.deep.eq(true);
    expect(isObservable(result.obj), 'result.obj isObservable').to.deep.eq(true);
    expect(isObservable(result.obj4), 'result.obj4 isObservable').to.deep.eq(true);
    expect(isObservable(result.obj.obj2), 'result.obj.obj2 isObservable').to.deep.eq(true);
    expect(isObservable(result.obj.obj2.obj3), 'result.obj.obj3 isObservable').to.deep.eq(true);
  }

  function checkError(result: any, source: any) {
    expect(result, 'result equals source').to.deep.eq(source);

    expect(isObservable(result), 'result isObservable').to.deep.eq(true);
    expect(isObservable(result.arr), 'result.arr isObservable').to.deep.eq(true);
    expect(isObservable(result.arr[0]), 'result.arr[0] isObservable').to.deep.eq(true);
    expect(isObservable(result.arr[0].obj3), 'result.arr[0].obj3 isObservable').to.deep.eq(true);
    expect(isObservable(result.obj), 'result.obj isObservable').to.deep.eq(true);
    expect(isObservable(result.obj4), 'result.obj4 isObservable').to.deep.eq(false); // BUG
    expect(isObservable(result.obj.obj2), 'result.obj.obj2 isObservable').to.deep.eq(true);
    expect(isObservable(result.obj.obj2.obj3), 'result.obj.obj3 isObservable').to.deep.eq(true);
  }

  it('object: merges with restoreState', () => {
    const source = getSourceObject();
    const result = restoreState({ logs: true, target: getTargetObject(), source });

    check(result, source);
  });

  it('object: merges with Object.assign', () => {
    const source = getSourceObject();
    const result = Object.assign(getTargetObject(), source);

    check(result, source);
    // expect(isObservable(result2.obj4)).to.deep.eq(false); // BUG in Mobx 4
  });

  it('class: error with Object.assign', () => {
    const source = getSourceObject();

    checkError(Object.assign(getTargetClassNotDefined(), source), source);
    checkError(Object.assign(getTargetClassWithInitializer(), source), source);
    check(Object.assign(getTargetClassWithUndefined(), source), source);
  });

  it('class: success with Object.assign if source observable', () => {
    const source = getSourceObject();

    check(Object.assign(getTargetClassNotDefined(), observable(source)), source);
    check(Object.assign(getTargetClassWithInitializer(), observable(source)), source);
    check(Object.assign(getTargetClassWithUndefined(), observable(source)), source);
  });

  it('class: merges with restoreState', () => {
    const source = getSourceObject();

    check(restoreState({ target: getTargetClassNotDefined(), source }), source);
    check(restoreState({ target: getTargetClassWithUndefined(), source }), source);
    check(restoreState({ target: getTargetClassWithInitializer(), source }), source);
  });

  it('class: merges with restoreState if source observable', () => {
    const source = getSourceObject();

    check(restoreState({ target: getTargetClassNotDefined(), source: observable(source) }), source);
    check(
      restoreState({ target: getTargetClassWithUndefined(), source: observable(source) }),
      source
    );
    check(
      restoreState({ target: getTargetClassWithInitializer(), source: observable(source) }),
      source
    );
  });
});
