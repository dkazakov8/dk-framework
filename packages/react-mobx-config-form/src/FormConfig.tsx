/* eslint-disable @typescript-eslint/naming-convention */

import { action, makeObservable, observable } from 'mobx';
import { mapValues, values } from 'lodash';

import { getTypedKeys } from './utils/getTypedKeys';
import { TypeGenerateFormTypes } from './types';

export class FormConfig<
  TConfigObject extends TypeGenerateFormTypes<any, any>['TypeFormConfigObject']
> {
  inputs: TConfigObject['inputs'];
  submit: TConfigObject['submit'] | any;
  original: TConfigObject;
  isSubmitting = false;

  constructor(config: TConfigObject) {
    this.inputs = config.inputs;
    this.submit = config.submit;
    this.original = config;

    makeObservable(this, {
      inputs: observable,
      isSubmitting: observable,
      submit: observable,
      clear: action,
    });
  }

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
