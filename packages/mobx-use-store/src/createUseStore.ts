/* eslint-disable @typescript-eslint/naming-convention */

import { Context, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { observable, runInAction } from 'mobx';

import { ViewModelConstructor } from './types/ViewModelConstructor';

export function createUseStore<TContext extends any>(
  ctx: Context<TContext>,
  beforeUnmount?: (context: TContext, vm?: any) => void
) {
  function useStore(): { context: TContext };
  function useStore<TViewModel extends new (context: TContext) => ViewModelConstructor<TContext>>(
    ViewModel: TViewModel
  ): { vm: InstanceType<TViewModel>; context: TContext };
  function useStore<
    TViewModel extends new (
      context: TContext,
      p: ConstructorParameters<TViewModel>[1]
    ) => ViewModelConstructor<TContext>
  >(
    ViewModel: TViewModel,
    props: ConstructorParameters<TViewModel>[1],
    exclude?: Partial<Record<keyof ConstructorParameters<TViewModel>[1], false>>
  ): { vm: InstanceType<TViewModel>; context: TContext };
  function useStore(ViewModel?: any, props?: any, exclude?: any) {
    const isFirstRenderRef = useRef(true);
    const context = useContext(ctx);

    if (!ViewModel) {
      return { context };
    }

    const [vm] = useState(() => {
      const instance = new ViewModel(context, observable(props || {}, exclude));

      runInAction(() => {
        instance.beforeMount?.();
      });

      return instance;
    });

    useLayoutEffect(() => {
      if (isFirstRenderRef.current) {
        isFirstRenderRef.current = false;
      } else if (props) {
        runInAction(() => {
          vm.props = observable(props || {}, exclude);
        });
      }
    }, [props]);

    useEffect(() => {
      vm.afterMount?.();

      return () => {
        beforeUnmount?.(context, vm);

        // @ts-ignore
        vm.autorunDisposers?.forEach((disposer) => disposer());

        vm.beforeUnmount?.();
      };
    }, []);

    return { context, vm };
  }

  return useStore;
}