/* eslint-disable @typescript-eslint/naming-convention */

import { makeAutoObservable } from 'mobx';
import { cloneDeep, mapValues, values } from 'lodash';

import { getTypedKeys } from './utils/getTypedKeys';
import { TypeGenerateFormTypes } from './types';

export class FormConfig<
  TConfigObject extends TypeGenerateFormTypes<any, any>['TypeFormConfigObject']
> {
  inputs: TConfigObject['inputs'];
  submit: TConfigObject['submit'] | any;
  methods?: (instance: FormConfig<TConfigObject>) => Record<string, any>;
  original: TConfigObject;
  isSubmitting = false;

  constructor(
    config: TConfigObject,
    methods?: (instance: FormConfig<TConfigObject>) => Record<string, any>
  ) {
    const copy = cloneDeep(config);

    this.original = config;
    this.methods = methods;
    this.inputs = copy.inputs;
    this.submit = copy.submit;

    if (this.methods) Object.assign(this, this.methods(this));

    makeAutoObservable(this);
  }

  copy = () => {
    return new FormConfig(this.original, this.methods);
  };

  clear = () => {
    getTypedKeys(this.inputs).forEach((name) => {
      this.inputs[name].value = this.original.inputs[name].value;
      this.inputs[name].validators = this.original.inputs[name].validators;
    });
  };

  get values(): {
    [Key in keyof TConfigObject['inputs']]: TConfigObject['inputs'][Key]['value'];
  } {
    return mapValues(this.inputs, ({ value }) => value);
  }

  get notValidFieldsIds() {
    return values(this.inputs)
      .filter((fieldData) => {
        if (fieldData?.validators.emptyString || fieldData?.errors.length) {
          return !fieldData?.isValidFn?.();
        }

        return false;
      })
      .map((fieldData) => fieldData?.id as string);
  }
}
