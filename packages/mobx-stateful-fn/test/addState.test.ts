import { expect } from 'chai';
import { action, autorun, observable, runInAction } from 'mobx';

import { addState } from '../src/addState';
import { TypeFnState } from '../src/types/TypeFnState';

const ACTION_TIMEOUT = 2;
const TIMEOUT_SYNC = 0.001;

const transformers = {
  action,
  batch: runInAction,
  observable,
};

const functions = {
  asyncNoParams() {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ACTION_TIMEOUT);
    });
  },
  asyncParams(param1: string, param2: string) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // @ts-ignore
        resolve([param1, param2]);
      }, ACTION_TIMEOUT);
    });
  },
  asyncError() {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const err = new Error('error text');
        err.name = 'CUSTOM_ERROR';

        reject(err);
      }, ACTION_TIMEOUT);
    });
  },
  syncNoParams() {
    return Promise.resolve(null);
  },
  syncParams(param1: string, param2: string) {
    return Promise.resolve([param1, param2]);
  },
  syncError() {
    const err = new Error('error text');
    err.name = 'CUSTOM_ERROR';

    throw err;
  },
};

function createStatefulFunctions(names: Array<keyof typeof functions>) {
  return names.map((name) => {
    return { name, fn: addState({ fn: functions[name], name, transformers }) };
  });
}

function startNoError(fn: ((...args: any) => Promise<any>) & TypeFnState) {
  expect(fn.state.timeStart).to.eq(0);
  expect(fn.state.isExecuting).to.eq(false);
  expect(fn.state.error).to.eq(undefined);
  expect(fn.state.errorName).to.eq(undefined);

  void fn();

  expect(fn.state.executionTime).to.be.eq(0);
  expect(fn.state.isExecuting).to.eq(true);
  expect(fn.state.timeStart).to.be.greaterThan(0);
}

function endNoError(
  fn: ((...args: any) => Promise<any>) & TypeFnState,
  timeout: number = ACTION_TIMEOUT
) {
  expect(fn.state.isExecuting).to.eq(false);
  expect(fn.state.error).to.eq(undefined);
  expect(fn.state.errorName).to.eq(undefined);
  expect(Math.ceil(Number(fn.state.executionTime))).to.be.greaterThanOrEqual(timeout);
}

function startError(fn: ((...args: any) => Promise<any>) & TypeFnState, sync?: boolean) {
  expect(fn.state.timeStart).to.eq(0);
  expect(fn.state.isExecuting).to.eq(false);

  void fn();

  if (sync) {
    expect(fn.state.isExecuting).to.eq(false);
    expect(fn.state.error).to.eq('error text');
    expect(fn.state.errorName).to.eq('CUSTOM_ERROR');
  } else {
    expect(fn.state.executionTime).to.be.eq(0);
    expect(fn.state.isExecuting).to.eq(true);
    expect(fn.state.timeStart).to.be.greaterThan(0);
    expect(fn.state.error).to.eq(undefined);
    expect(fn.state.errorName).to.eq(undefined);
  }
}

function endError(
  fn: ((...args: any) => Promise<any>) & TypeFnState,
  timeout: number = ACTION_TIMEOUT
) {
  expect(fn.state.isExecuting).to.eq(false);
  expect(fn.state.error).to.eq('error text');
  expect(fn.state.errorName).to.eq('CUSTOM_ERROR');
  expect(Math.ceil(Number(fn.state.executionTime))).to.be.greaterThanOrEqual(timeout);
}

describe('addState', () => {
  it('adds default state & name', () => {
    const statefulFunctions = createStatefulFunctions(['asyncNoParams', 'syncNoParams']);

    statefulFunctions.forEach(({ name, fn }) => {
      expect(fn.state).to.deep.eq({
        timeStart: 0,
        isExecuting: false,
        executionTime: 0,
      });
      expect(fn.name).to.eq(name);
    });
  });

  it('works with wrapping in autoAction', () => {
    const statefulFunctions = createStatefulFunctions(['asyncNoParams', 'syncNoParams']).map(
      (item) => {
        return observable(item);
      }
    );

    statefulFunctions.forEach(({ name, fn }) => {
      expect(fn.state).to.deep.eq({
        timeStart: 0,
        isExecuting: false,
        executionTime: 0,
      });
      expect(fn.name).to.eq(name);
    });
  });

  it('params are typed & result is passed', () => {
    const statefulFunctions = createStatefulFunctions(['asyncParams', 'syncParams']);

    return Promise.all(statefulFunctions.map(({ fn }) => fn('foo', 'bar'))).then((data) => {
      expect(data).to.deep.eq([
        ['foo', 'bar'],
        ['foo', 'bar'],
      ]);
    });
  });

  it('(sync) successful case', () => {
    const statefulFunctions = createStatefulFunctions(['syncNoParams', 'syncNoParams']).map(
      ({ fn }) => fn
    );

    statefulFunctions.forEach((fn) => startNoError(fn));

    return new Promise((resolve) => {
      setTimeout(() => {
        statefulFunctions.forEach((fn) => endNoError(fn, TIMEOUT_SYNC));
        statefulFunctions.forEach((fn) => startNoError(fn));

        setTimeout(() => {
          // eslint-disable-next-line max-nested-callbacks
          statefulFunctions.forEach((fn) => endNoError(fn, TIMEOUT_SYNC));

          resolve(undefined);
        }, ACTION_TIMEOUT);
      }, ACTION_TIMEOUT);
    });
  });

  it('(async) successful case', () => {
    const statefulFunctions = createStatefulFunctions(['asyncNoParams', 'asyncNoParams']).map(
      ({ fn }) => fn
    );

    statefulFunctions.forEach((fn) => startNoError(fn));

    return new Promise((resolve) => {
      setTimeout(() => {
        statefulFunctions.forEach((fn) => endNoError(fn));
        statefulFunctions.forEach((fn) => startNoError(fn));

        setTimeout(() => {
          statefulFunctions.forEach((fn) => endNoError(fn));

          resolve(undefined);
        }, ACTION_TIMEOUT + 1);
      }, ACTION_TIMEOUT + 1);
    });
  });

  it('(sync) errors case', () => {
    const statefulFunctions = createStatefulFunctions(['syncError', 'syncError']).map(
      ({ fn }) => fn
    );

    statefulFunctions.forEach((fn) => startError(fn, true));

    return new Promise((resolve) => {
      setTimeout(() => {
        statefulFunctions.forEach((fn) => startError(fn, true));

        Promise.all(statefulFunctions.map((fn) => fn())).catch((error) => {
          expect(error.message).to.eq('error text');
          expect(error.name).to.eq('CUSTOM_ERROR');

          resolve(undefined);
        });
      }, ACTION_TIMEOUT + 1);
    });
  });

  it('(async) errors case', () => {
    const statefulFunctions = createStatefulFunctions(['asyncError', 'asyncError']).map(
      ({ fn }) => fn
    );

    statefulFunctions.forEach((fn) => startError(fn));

    return new Promise((resolve) => {
      setTimeout(() => {
        statefulFunctions.forEach((fn) => endError(fn));
        statefulFunctions.forEach((fn) => startError(fn));

        setTimeout(() => {
          statefulFunctions.forEach((fn) => endError(fn));

          Promise.all(statefulFunctions.map((fn) => fn())).catch((error) => {
            expect(error.message).to.eq('error text');
            expect(error.name).to.eq('CUSTOM_ERROR');

            resolve(undefined);
          });
        }, ACTION_TIMEOUT + 1);
      }, ACTION_TIMEOUT + 1);
    });
  });

  it('autorun works', () => {
    const statefulFunctions = createStatefulFunctions(['asyncNoParams', 'syncNoParams']).map(
      ({ fn }) => fn
    );

    statefulFunctions.forEach((fn) => {
      void fn();

      expect(fn.state.isExecuting).to.eq(true);
    });

    return new Promise((resolve) => {
      autorun(() => {
        const allFinished = !statefulFunctions.some((statefulFn) => statefulFn.state.isExecuting);

        if (allFinished) resolve(undefined);
      });
    });
  });

  it('(async) cancelling', () => {
    const statefulFunctions = createStatefulFunctions([
      'asyncError',
      'asyncNoParams',
      'asyncParams',
    ]).map(({ fn }) => fn);

    statefulFunctions.forEach((fn) => {
      startNoError(fn);

      fn.state.isCancelled = true;

      expect(fn.state.isCancelled).to.eq(true);
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        statefulFunctions.forEach((fn) => {
          expect(fn.state.isExecuting).to.eq(false);
          expect(fn.state.isCancelled).to.eq(false);
          expect(fn.state.error).to.eq(fn.name);
          expect(fn.state.errorName).to.eq('ACTION_CANCELED');
          expect(Math.ceil(Number(fn.state.executionTime))).to.be.greaterThanOrEqual(
            ACTION_TIMEOUT
          );
        });

        void Promise.all(
          statefulFunctions.map((fn) => {
            const promise = fn();

            fn.state.isCancelled = true;

            return promise;
          })
        ).catch((error) => {
          expect(statefulFunctions.map((fn) => fn.name)).to.include(error.message);
          expect(error.name).to.eq('ACTION_CANCELED');

          resolve(undefined);
        });
      }, ACTION_TIMEOUT + 1);
    });
  });
});
