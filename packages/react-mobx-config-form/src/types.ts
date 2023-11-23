export type TypeGenerateFormTypes<TInputConfigs, TSubmitConfig> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TypeFormConfigObject: {
    inputs: Record<string, TInputConfigs>;
    submit?: TSubmitConfig;
  };
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TypeFormConfig: {
    inputs: Record<string, TInputConfigs>;
    submit?: TSubmitConfig;
    isSubmitting: boolean;
    clear: () => void;
    values: any;
    notValidFieldsIds: Array<string>;
  };
};

export type TypeInitialData<TFormConfig extends TypeGenerateFormTypes<any, any>['TypeFormConfig']> =
  {
    [Key in keyof TFormConfig['inputs']]?: Partial<TFormConfig['inputs'][Key]>;
  };

export type TypeFormSubmit<TFormConfig extends TypeGenerateFormTypes<any, any>['TypeFormConfig']> =
  (formData: {
    [Key in keyof TFormConfig['inputs']]: TFormConfig['inputs'][Key]['value'];
  }) => Promise<any>;

export type TypeInputProps<
  TConfig extends TypeGenerateFormTypes<any, any>['TypeFormConfig'],
  TConfigInput extends TypeGenerateFormTypes<any, any>['TypeFormConfig']['inputs']
> = {
  name: keyof TConfig['inputs'];
  formConfig: TConfig;
  inputConfig: TConfigInput;
  initialData?: Partial<TConfigInput>;
};

export type TypeSubmitProps<
  TConfig extends TypeGenerateFormTypes<any, any>['TypeFormConfig'],
  TConfigInput extends TypeGenerateFormTypes<any, any>['TypeFormConfig']['submit']
> = {
  formConfig: TConfig;
  inputConfig: TConfigInput;
  initialData?: Partial<TConfigInput>;
  onClick: () => void;
};
