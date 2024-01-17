/* eslint-disable @typescript-eslint/naming-convention */

import { FormEvent, ReactNode, Component } from 'react';
import { runInAction } from 'mobx';

import { getTypedKeys } from './utils/getTypedKeys';
import { TypeGenerateFormTypes, TypeInitialData } from './types';

type TypeChildrenProps<TFormConfig extends TypeGenerateFormTypes<any, any>['TypeFormConfig']> = {
  inputs: Record<keyof TFormConfig['inputs'], ReactNode>;
  submit?: ReactNode;
};

export type PropsReactMobxForm<
  TFormConfig extends TypeGenerateFormTypes<any, any>['TypeFormConfig']
> = {
  formConfig: TFormConfig;
  children: (childrenProps: TypeChildrenProps<TFormConfig>) => ReactNode;

  onSubmit?: () => Promise<any>;
  className?: string;
  initialData?: TypeInitialData<TFormConfig>;
};

type PropsForm<TFormConfig extends TypeGenerateFormTypes<any, any>['TypeFormConfig']> =
  PropsReactMobxForm<TFormConfig> & {
    componentsMapper: Record<string, any>;
  };

export class ReactMobxForm<
  TFormConfig extends TypeGenerateFormTypes<any, any>['TypeFormConfig']
> extends Component<PropsForm<TFormConfig>> {
  handlePreventSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  handleFormSubmit = () => {
    const { formConfig, onSubmit } = this.props;

    if (formConfig.isSubmitting || !onSubmit) return Promise.resolve();

    runInAction(() => (formConfig.isSubmitting = true));

    return onSubmit()
      .then(() => {
        runInAction(() => (formConfig.isSubmitting = false));
      })
      .catch(() => {
        runInAction(() => (formConfig.isSubmitting = false));
      });
  };

  render() {
    const { children, className, formConfig, initialData, componentsMapper } = this.props;

    const childrenProps: TypeChildrenProps<TFormConfig> = {
      inputs: getTypedKeys(formConfig.inputs).reduce((acc, name: keyof TFormConfig['inputs']) => {
        const inputConfig = formConfig.inputs[name];
        const Comp = componentsMapper[inputConfig.type];

        acc[name] = (
          <Comp
            key={name}
            name={name}
            formConfig={formConfig}
            inputConfig={inputConfig!}
            initialData={initialData?.[name]}
          />
        );

        return acc;
      }, {} as Record<keyof TFormConfig['inputs'], ReactNode>),
    };

    if (formConfig.submit) {
      const Comp = componentsMapper[formConfig.submit.type];

      childrenProps.submit = (
        <Comp
          formConfig={formConfig}
          inputConfig={formConfig.submit}
          initialData={initialData?.submit}
          onClick={this.handleFormSubmit}
        />
      );
    }

    return (
      <form onSubmit={this.handlePreventSubmit} className={className}>
        {children(childrenProps)}
      </form>
    );
  }
}
