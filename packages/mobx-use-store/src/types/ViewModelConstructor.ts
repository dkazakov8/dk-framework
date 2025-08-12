import { IReactionDisposer } from 'mobx';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions,@typescript-eslint/naming-convention
export interface ViewModelConstructor<TContext> {
  systemFileName?: string;
  props?: Record<string, any>;
  context: TContext;
  beforeMount?: () => void;
  afterMount?: () => void;
  beforeUnmount?: () => void;
  autorunDisposers?: Array<IReactionDisposer>;
}
