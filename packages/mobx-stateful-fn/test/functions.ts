import { ACTION_TIMEOUT } from './constants';

export const functions = {
  asyncNoParams(timeout: number = ACTION_TIMEOUT) {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, timeout);
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
