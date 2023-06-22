import { expect } from 'chai';
import { action, autorun, observable, runInAction } from 'mobx';

import { addState } from '../src/addState';

const ACTION_TIMEOUT = 2;

describe('addState', function test() {
  const transformers = {
    action,
    batch: runInAction,
    observable,
  };

  const fn = () => new Promise<void>((resolve) => setTimeout(resolve, ACTION_TIMEOUT));
  const fnError = () =>
    Promise.resolve().then(() => {
      const err = new Error('error text');
      err.name = 'CUSTOM_ERROR';

      throw err;
    });
  const fnErrorSync = () => {
    const err = new Error('error text');
    err.name = 'CUSTOM_ERROR';

    throw err;
  };

  it('adds default state to functions', () => {
    const fnStateful = addState({ fn, name: 'fn', transformers });
    const fnStateful2 = addState({ fn, name: 'fn', transformers });

    [fnStateful, fnStateful2].forEach((statefulFn) => {
      expect(statefulFn.state).to.deep.eq({
        timeStart: 0,
        isExecuting: false,
        executionTime: 0,
      });
      expect(statefulFn.name).to.eq('fn');
    });
  });

  it('changes state accordingly', () => {
    const fnStateful = addState({ fn, name: 'fn', transformers });
    const fnStateful2 = addState({ fn, name: 'fn', transformers });

    fnStateful();

    expect(fnStateful.state.isExecuting).to.eq(true);
    expect(fnStateful.state.timeStart).to.be.greaterThan(0);

    expect(fnStateful2.state).to.deep.eq({
      timeStart: 0,
      isExecuting: false,
      executionTime: 0,
    });

    fnStateful2();

    expect(fnStateful2.state.isExecuting).to.eq(true);
    expect(fnStateful2.state.timeStart).to.be.greaterThan(0);

    return new Promise((resolve) => {
      setTimeout(() => {
        [fnStateful, fnStateful2].forEach((statefulFn) => {
          expect(statefulFn.state.isExecuting).to.eq(false);
          expect(statefulFn.state.error).to.eq(undefined);
          expect(statefulFn.state.errorName).to.eq(undefined);
          expect(Math.ceil(Number(statefulFn.state.executionTime))).to.be.greaterThanOrEqual(
            ACTION_TIMEOUT
          );
        });

        [fnStateful, fnStateful2].forEach((statefulFn) => {
          statefulFn();

          expect(statefulFn.state.executionTime).to.be.eq(0);
          expect(statefulFn.state.isExecuting).to.eq(true);
          expect(statefulFn.state.timeStart).to.be.greaterThan(0);
        });

        setTimeout(() => {
          [fnStateful, fnStateful2].forEach((statefulFn) => {
            expect(statefulFn.state.isExecuting).to.eq(false);
            expect(statefulFn.state.error).to.eq(undefined);
            expect(statefulFn.state.errorName).to.eq(undefined);
            expect(Math.ceil(Number(statefulFn.state.executionTime))).to.be.greaterThanOrEqual(
              ACTION_TIMEOUT
            );
          });

          resolve(undefined);
        }, ACTION_TIMEOUT + 1);
      }, ACTION_TIMEOUT + 1);
    });
  });

  it('changes errors accordingly (async)', () => {
    const fnStateful = addState({ fn: fnError, name: 'fn', transformers });
    const fnStateful2 = addState({ fn: fnError, name: 'fn', transformers });

    [fnStateful, fnStateful2].forEach((statefulFn) => {
      statefulFn();

      expect(statefulFn.state.isExecuting).to.eq(true);
      expect(statefulFn.state.timeStart).to.be.greaterThan(0);
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        [fnStateful, fnStateful2].forEach((statefulFn) => {
          expect(statefulFn.state.isExecuting).to.eq(false);
          expect(statefulFn.state.error).to.eq('error text');
          expect(statefulFn.state.errorName).to.eq('CUSTOM_ERROR');
          expect(statefulFn.state.executionTime).to.be.greaterThan(0);
        });

        [fnStateful, fnStateful2].forEach((statefulFn) => {
          statefulFn();

          expect(statefulFn.state.executionTime).to.be.eq(0);
          expect(statefulFn.state.isExecuting).to.eq(true);
          expect(statefulFn.state.timeStart).to.be.greaterThan(0);
          expect(statefulFn.state.error).to.eq(undefined);
          expect(statefulFn.state.errorName).to.eq(undefined);
        });

        setTimeout(() => {
          [fnStateful, fnStateful2].forEach((statefulFn) => {
            expect(statefulFn.state.isExecuting).to.eq(false);
            expect(statefulFn.state.error).to.eq('error text');
            expect(statefulFn.state.errorName).to.eq('CUSTOM_ERROR');
            expect(statefulFn.state.executionTime).to.be.greaterThan(0);
          });

          Promise.all([fnStateful(), fnStateful2()]).catch((error) => {
            expect(error.message).to.eq('error text');
            expect(error.name).to.eq('CUSTOM_ERROR');

            resolve(undefined);
          });
        }, ACTION_TIMEOUT + 1);
      }, ACTION_TIMEOUT + 1);
    });
  });

  it('changes errors accordingly (sync)', () => {
    const fnStateful = addState({ fn: fnErrorSync, name: 'fn', transformers });
    const fnStateful2 = addState({ fn: fnErrorSync, name: 'fn', transformers });

    [fnStateful, fnStateful2].forEach((statefulFn) => {
      statefulFn();

      expect(statefulFn.state.timeStart).to.be.eq(0);
      expect(statefulFn.state.isExecuting).to.eq(false);
      expect(statefulFn.state.error).to.eq('error text');
      expect(statefulFn.state.errorName).to.eq('CUSTOM_ERROR');
      expect(statefulFn.state.executionTime).to.be.greaterThanOrEqual(0);
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        Promise.all([fnStateful(), fnStateful2()]).catch((error) => {
          expect(error.message).to.eq('error text');
          expect(error.name).to.eq('CUSTOM_ERROR');

          resolve(undefined);
        });
      }, ACTION_TIMEOUT + 1);
    });
  });

  it('autorun works', () => {
    const fnStateful = addState({ fn, name: 'fn', transformers });
    const fnStateful2 = addState({ fn, name: 'fn', transformers });

    [fnStateful, fnStateful2].forEach((statefulFn) => {
      statefulFn();

      expect(statefulFn.state.isExecuting).to.eq(true);
    });

    return new Promise((resolve) => {
      autorun(() => {
        const allFinished = ![fnStateful, fnStateful2].some(
          (statefulFn) => statefulFn.state.isExecuting
        );

        if (allFinished) resolve(undefined);
      });
    });
  });
});
