// eslint-disable-next-line @typescript-eslint/naming-convention

import { expect } from 'chai';
import _ from 'lodash';
import { isObservable, makeAutoObservable, observable } from 'mobx';

import { restoreState } from '../src/restoreState';

function getTargetObject() {
  return observable({
    arr: [],
    obj: {
      obj1: { data: 'string' },
    },
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
    obj = {
      obj1: { data: 'string' },
    };
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
    obj = {
      obj1: { data: 'string' },
    };
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
    obj = {
      obj1: { data: 'string' },
    };
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

function check(result: any, source: any) {
  expect(result, 'result extends target with source').to.deep.eq({
    ...source,
    obj: {
      obj1: { data: 'string' },
      obj2: { obj3: { param: '123' } },
      str: '123',
    },
  });

  expect(isObservable(result), 'result isObservable').to.deep.eq(true);
  expect(isObservable(result.arr), 'result.arr isObservable').to.deep.eq(true);
  expect(isObservable(result.arr[0]), 'result.arr[0] isObservable').to.deep.eq(true);
  expect(isObservable(result.arr[0].obj3), 'result.arr[0].obj3 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj), 'result.obj isObservable').to.deep.eq(true);
  expect(isObservable(result.obj4), 'result.obj4 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj.obj1), 'result.obj.obj1 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj.obj2), 'result.obj.obj2 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj.obj2.obj3), 'result.obj.obj3 isObservable').to.deep.eq(true);
}

function checkErrorNoDeepMerge(result: any, source: any) {
  expect(result, 'result extends target with source').to.deep.eq(source);

  expect(isObservable(result), 'result isObservable').to.deep.eq(true);
  expect(isObservable(result.arr), 'result.arr isObservable').to.deep.eq(true);
  expect(isObservable(result.arr[0]), 'result.arr[0] isObservable').to.deep.eq(true);
  expect(isObservable(result.arr[0].obj3), 'result.arr[0].obj3 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj), 'result.obj isObservable').to.deep.eq(true);
  expect(isObservable(result.obj4), 'result.obj4 isObservable').to.deep.eq(true);
  expect(result.obj.obj1, 'result.obj.obj1 isObservable').to.deep.eq(undefined);
  expect(isObservable(result.obj.obj2), 'result.obj.obj2 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj.obj2.obj3), 'result.obj.obj3 isObservable').to.deep.eq(true);
}

function checkError(result: any, source: any) {
  expect(result, 'result extends target with source').to.deep.eq({
    ...source,
    obj: {
      obj1: { data: 'string' },
      obj2: { obj3: { param: '123' } },
      str: '123',
    },
  });

  expect(isObservable(result), 'result isObservable').to.deep.eq(true);
  expect(isObservable(result.arr), 'result.arr isObservable').to.deep.eq(true);
  expect(isObservable(result.arr[0]), 'result.arr[0] isObservable').to.deep.eq(true);
  expect(isObservable(result.arr[0].obj3), 'result.arr[0].obj3 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj), 'result.obj isObservable').to.deep.eq(true);
  expect(isObservable(result.obj4), 'result.obj4 isObservable').to.deep.eq(false); // BUG
  expect(isObservable(result.obj.obj1), 'result.obj.obj1 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj.obj2), 'result.obj.obj2 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj.obj2.obj3), 'result.obj.obj3 isObservable').to.deep.eq(true);
}

function checkErrorNoDeepMergeAndNoObservable(result: any, source: any) {
  expect(result, 'result extends target with source').to.deep.eq(source);

  expect(isObservable(result), 'result isObservable').to.deep.eq(true);
  expect(isObservable(result.arr), 'result.arr isObservable').to.deep.eq(true);
  expect(isObservable(result.arr[0]), 'result.arr[0] isObservable').to.deep.eq(true);
  expect(isObservable(result.arr[0].obj3), 'result.arr[0].obj3 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj), 'result.obj isObservable').to.deep.eq(true);
  expect(isObservable(result.obj4), 'result.obj4 isObservable').to.deep.eq(false); // BUG
  expect(result.obj.obj1, 'result.obj.obj1 isObservable').to.deep.eq(undefined);
  expect(isObservable(result.obj.obj2), 'result.obj.obj2 isObservable').to.deep.eq(true);
  expect(isObservable(result.obj.obj2.obj3), 'result.obj.obj3 isObservable').to.deep.eq(true);
}

describe('restoreState', function test() {
  /**
   * Object test
   *
   */

  it('object: success with restoreState', () => {
    const source = getSourceObject();
    const result = restoreState({ logs: true, target: getTargetObject(), source });

    check(result, source);
  });

  it('object: success with lodash.merge', () => {
    const source = getSourceObject();
    const result = _.merge(getTargetObject(), source);

    check(result, source);
  });

  it('object: error with Object.assign', () => {
    const source = getSourceObject();
    const result = Object.assign(getTargetObject(), source);

    checkErrorNoDeepMerge(result, source);
    // expect(isObservable(result2.obj4)).to.deep.eq(false); // BUG in Mobx 4
  });

  /**
   * Class test
   *
   */

  it('class: success with restoreState', () => {
    const source = getSourceObject();

    check(restoreState({ target: getTargetClassNotDefined(), source }), source);
    check(restoreState({ target: getTargetClassWithUndefined(), source }), source);
    check(restoreState({ target: getTargetClassWithInitializer(), source }), source);
  });

  it('class: error with lodash.merge', () => {
    const source = getSourceObject();

    check(_.merge(getTargetClassWithUndefined(), source), source);
    checkError(_.merge(getTargetClassNotDefined(), source), source);
    check(_.merge(getTargetClassWithInitializer(), source), source);
  });

  it('class: success with lodash.mergeWith', () => {
    const source = getSourceObject();

    check(_.merge(getTargetClassWithUndefined(), source), source);
    check(
      _.mergeWith(getTargetClassNotDefined(), source, (objValue, srcValue) => {
        if (!objValue && Object.prototype.toString.call(srcValue) === '[object Object]') {
          return observable(srcValue);
        }

        return undefined;
      }),
      source
    );
    check(
      _.mergeWith(getTargetClassWithInitializer(), source, (objValue, srcValue) => {
        if (!objValue && Object.prototype.toString.call(srcValue) === '[object Object]') {
          return observable(srcValue);
        }

        return undefined;
      }),
      source
    );
  });

  it('class: error with Object.assign', () => {
    const source = getSourceObject();

    checkErrorNoDeepMergeAndNoObservable(Object.assign(getTargetClassNotDefined(), source), source);
    checkErrorNoDeepMerge(Object.assign(getTargetClassWithInitializer(), source), source);
    checkErrorNoDeepMerge(Object.assign(getTargetClassWithUndefined(), source), source);
  });

  it('class: error with Object.assign if source observable', () => {
    const source = getSourceObject();

    checkErrorNoDeepMerge(Object.assign(getTargetClassNotDefined(), observable(source)), source);
    checkErrorNoDeepMerge(
      Object.assign(getTargetClassWithInitializer(), observable(source)),
      source
    );
    checkErrorNoDeepMerge(Object.assign(getTargetClassWithUndefined(), observable(source)), source);
  });

  it('class: success with restoreState if source observable', () => {
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
