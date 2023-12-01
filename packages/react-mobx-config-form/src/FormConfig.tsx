/* eslint-disable @typescript-eslint/naming-convention */

import { makeAutoObservable } from 'mobx';
import { cloneDeep } from 'lodash';

import { TypeGenerateFormTypes } from './types';

export class FormConfig<
  TConfigObject extends TypeGenerateFormTypes<any, any>['TypeFormConfigObject']
> {
  inputs: TConfigObject['inputs'];
  submit: TConfigObject['submit'] | any;
  methods?: (instance: FormConfig<TConfigObject>) => any;
  original: TConfigObject;
  isSubmitting = false;

  constructor(config: TConfigObject) {
    const copy = cloneDeep(config);

    this.original = config;
    this.inputs = copy.inputs;
    this.submit = copy.submit;

    makeAutoObservable(this);
  }

  configure = <TMethods,>(
    callback?: (instance: FormConfig<TConfigObject>) => TMethods
  ): FormConfig<TConfigObject> & TMethods => {
    if (!callback) return this as any;

    this.methods = callback;
    Object.assign(this, this.methods(this));

    return this as any;
  };

  copy = () => {
    return new FormConfig(this.original).configure(this.methods);
  };
}
