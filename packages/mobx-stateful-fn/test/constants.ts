import { action, observable, runInAction } from 'mobx';

export const ACTION_TIMEOUT = 3;

export const TIMEOUT_SYNC = 0.001;

export const transformers = {
  action,
  batch: runInAction,
  observable,
};
