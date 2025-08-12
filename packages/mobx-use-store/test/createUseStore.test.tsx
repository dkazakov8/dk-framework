/* eslint-disable no-unused-expressions, no-restricted-syntax,
@typescript-eslint/naming-convention, react/jsx-no-literals, @typescript-eslint/no-empty-function,
no-useless-constructor */

import { render, renderHook } from '@testing-library/react/pure';
import { expect } from 'chai';
import {
  _getAdministration,
  autorun,
  IReactionDisposer,
  isObservable,
  makeAutoObservable,
} from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { ContextType, useContext } from 'react';
import { renderToString } from 'react-dom/server';
import { spy } from 'sinon';

import { createUseStore } from '../src/createUseStore';
import { ViewModelConstructor } from '../src/types/ViewModelConstructor';

describe('createUseStore', () => {
  const testContextValues = [
    undefined,
    null,
    'string',
    1,
    { someParam: 'value' },
    [1],
    // biome-ignore lint/suspicious/noEmptyBlockStatements: false
    function someFunction() {},
  ];

  function getElementContent(container: any, className: string) {
    return container.getElementsByClassName(className)[0].innerHTML;
  }

  it('hook (empty): context is correct', () => {
    function check<TContext>(contextValue: TContext) {
      const StoreContext = React.createContext(contextValue);

      const useStore = createUseStore(StoreContext);

      const { result } = renderHook(() => useStore());

      expect(result.current.context).to.deep.eq(contextValue);
    }

    testContextValues.forEach((contextValue) => check(contextValue));
  });

  it('hook (only VM): context is correct & vm has correct context', () => {
    function check<TContext>(contextValue: TContext) {
      const StoreContext = React.createContext(contextValue);

      const useStore = createUseStore(StoreContext);

      type ViewModel = ViewModelConstructor<TContext>;

      class VM implements ViewModel {
        constructor(public context: TContext) {
          makeAutoObservable(this, { context: false }, { autoBind: true });
        }
      }

      const { result } = renderHook(() => useStore(VM));

      expect(result.current.context).to.deep.eq(contextValue);
      expect(result.current.vm).to.deep.eq({ context: contextValue });
    }

    testContextValues.forEach((contextValue) => check(contextValue));
  });

  it('hook (VM + props): context is correct & vm has correct context and props', () => {
    function check<TContext>(contextValue: TContext, initialProps: any) {
      const StoreContext = React.createContext(contextValue);

      const useStore = createUseStore(StoreContext);

      type ViewModel = ViewModelConstructor<TContext>;

      class VM implements ViewModel {
        constructor(
          public context: TContext,
          public props: typeof initialProps
        ) {
          makeAutoObservable(this, { context: false }, { autoBind: true });
        }
      }

      const { result } = renderHook((props) => useStore(VM, props), { initialProps });

      expect(result.current.context).to.deep.eq(contextValue);
      expect(result.current.vm).to.deep.eq({ context: contextValue, props: initialProps });
      expect(isObservable(result.current.vm.props)).to.deep.eq(true);
    }

    testContextValues.forEach((contextValue) => check(contextValue, { data: 'string' }));
  });

  it('hook (VM + props): autorunDisposers are cleared', () => {
    function check<TContext>(contextValue: TContext, initialProps: { data: string }) {
      const StoreContext = React.createContext(contextValue);

      const useStore = createUseStore(StoreContext);

      const spy_autorun = spy();

      type ViewModel = ViewModelConstructor<TContext>;

      class VM implements ViewModel {
        autorunDisposers: Array<IReactionDisposer> = [];

        constructor(
          public context: TContext,
          public props: typeof initialProps
        ) {
          makeAutoObservable(this, { context: false }, { autoBind: true });

          this.autorunDisposers.push(
            autorun(() => {
              spy_autorun(this.props.data);
            })
          );
        }
      }

      const { result, rerender, unmount } = renderHook((props) => useStore(VM, props), {
        initialProps,
      });

      expect(result.current.vm.autorunDisposers.length, 'autorunDisposers').to.deep.eq(1);
      expect(
        // eslint-disable-next-line no-underscore-dangle
        _getAdministration(result.current.vm.autorunDisposers[0]).isDisposed_,
        'autorunDisposers'
      ).to.deep.eq(false);
      expect(spy_autorun.callCount, 'spy_autorun').to.deep.eq(1);
      expect(spy_autorun.getCall(0).args[0], 'spy_autorun').to.deep.eq('string');

      rerender({ data: 'string2' });

      expect(result.current.vm.autorunDisposers.length, 'autorunDisposers').to.deep.eq(1);
      expect(
        // eslint-disable-next-line no-underscore-dangle
        _getAdministration(result.current.vm.autorunDisposers[0]).isDisposed_,
        'autorunDisposers'
      ).to.deep.eq(false);
      expect(spy_autorun.callCount, 'spy_autorun').to.deep.eq(2);
      expect(spy_autorun.getCall(1).args[0], 'spy_autorun').to.deep.eq('string2');

      unmount();

      expect(result.current.vm.autorunDisposers.length, 'autorunDisposers').to.deep.eq(1);
      expect(
        // eslint-disable-next-line no-underscore-dangle
        _getAdministration(result.current.vm.autorunDisposers[0]).isDisposed_,
        'autorunDisposers'
      ).to.deep.eq(true);
      expect(spy_autorun.callCount, 'spy_autorun').to.deep.eq(2);
      expect(spy_autorun.getCall(1).args[0], 'spy_autorun').to.deep.eq('string2');
    }

    testContextValues.forEach((contextValue) => check(contextValue, { data: 'string' }));
  });

  it('component (VM + props): rerenders (1 more time than needed)', () => {
    function check<TContext>(contextValue: TContext, initialProps: { data: string }) {
      const StoreContext = React.createContext(contextValue);

      const useStore = createUseStore(StoreContext);

      const spy_render = spy();

      type ViewModel = ViewModelConstructor<TContext>;

      class VM implements ViewModel {
        constructor(
          public context: TContext,
          public props: typeof initialProps
        ) {
          makeAutoObservable(this, { context: false }, { autoBind: true });
        }

        get computedData() {
          return `${this.props.data}_computed`;
        }
      }

      const MyComponent = observer((props: typeof initialProps) => {
        const { vm } = useStore(VM, props);

        spy_render(props.data, vm.computedData);

        return (
          <>
            <div className={'computed'}>{vm.computedData}</div>
            <div className={'prop'}>{props.data}</div>
          </>
        );
      });

      const { container, rerender } = render(<MyComponent {...initialProps} />);

      expect(container.getElementsByClassName('computed')[0].innerHTML).to.eq(`string_computed`);
      expect(container.getElementsByClassName('prop')[0].innerHTML).to.eq(`string`);

      expect(spy_render.callCount, 'spy_render').to.deep.eq(1);
      expect(spy_render.getCall(0).args[0], 'spy_render').to.deep.eq('string');
      expect(spy_render.getCall(0).args[1], 'spy_render').to.deep.eq('string_computed');

      rerender(<MyComponent data={`string2`} />);

      expect(container.getElementsByClassName('computed')[0].innerHTML).to.eq(`string2_computed`);
      expect(container.getElementsByClassName('prop')[0].innerHTML).to.eq(`string2`);

      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      expect(spy_render.callCount, 'spy_render').to.deep.eq(3);
      expect(spy_render.getCall(1).args[0], 'spy_render').to.deep.eq('string2');
      expect(spy_render.getCall(1).args[1], 'spy_render').to.deep.eq('string_computed');
      expect(spy_render.getCall(2).args[0], 'spy_render').to.deep.eq('string2');
      expect(spy_render.getCall(2).args[1], 'spy_render').to.deep.eq('string2_computed');
    }

    testContextValues.forEach((contextValue) => check(contextValue, { data: 'string' }));
  });

  it('BUG: component (VM + props): excluded props do not trigger rerender', () => {
    function check<TContext>(
      contextValue: TContext,
      initialProps: { dataObs: string; data: { foo: string } }
    ) {
      const StoreContext = React.createContext(contextValue);

      const useStore = createUseStore(StoreContext);

      const spy_autorun = spy();
      const spy_autorunObs = spy();

      type ViewModel = ViewModelConstructor<TContext>;

      class VM implements ViewModel {
        constructor(
          public context: TContext,
          public props: typeof initialProps
        ) {
          makeAutoObservable(this, { context: false, props: false }, { autoBind: true });

          autorun(() => {
            spy_autorun(`${this.props.data.foo}_computed`);
          });

          autorun(() => {
            spy_autorunObs(`${this.props.dataObs}_computed`);
          });
        }

        get computedData() {
          return `${this.props.data.foo}_computed`;
        }
      }

      const MyComponent = observer((props: typeof initialProps) => {
        const { vm } = useStore(VM, props, { data: false });

        return <div className={'computed'}>{vm.computedData}</div>;
      });

      const { container, rerender } = render(<MyComponent {...initialProps} />);

      expect(getElementContent(container, 'computed')).to.eq(`string_computed`);

      expect(spy_autorun.callCount, 'spy_autorun').to.deep.eq(1);
      expect(spy_autorun.getCall(0).args[0], 'spy_autorun').to.deep.eq('string_computed');

      expect(spy_autorunObs.callCount, 'spy_autorunObs').to.deep.eq(1);
      expect(spy_autorunObs.getCall(0).args[0], 'spy_autorunObs').to.deep.eq('123_computed');

      rerender(<MyComponent dataObs={'321'} data={{ foo: `string2` }} />);

      expect(getElementContent(container, 'computed')).to.eq(`string_computed`);

      expect(spy_autorun.callCount, 'spy_autorun').to.deep.eq(1);
      expect(spy_autorun.getCall(0).args[0], 'spy_autorun').to.deep.eq('string_computed');

      expect(spy_autorunObs.callCount, 'spy_autorunObs').to.deep.eq(1);
      expect(spy_autorunObs.getCall(0).args[0], 'spy_autorunObs').to.deep.eq('123_computed');
    }

    testContextValues.forEach((contextValue) =>
      check(contextValue, { dataObs: '123', data: { foo: 'string' } })
    );
  });

  it('component (VM + props): several contexts', () => {
    function check<TContext>(contextValue: TContext, initialProps: { data: { foo: string } }) {
      const StoreContext = React.createContext(contextValue);
      const StoreContext2 = React.createContext({ data: 'string' });

      const useStore = createUseStore(StoreContext);

      type ViewModel = ViewModelConstructor<TContext>;

      class VM implements ViewModel {
        constructor(
          public context: TContext,
          public props: typeof initialProps & { context2: ContextType<typeof StoreContext2> }
        ) {
          makeAutoObservable(this, { context: false }, { autoBind: true });
        }

        get context2Data() {
          return this.props.context2.data;
        }
      }

      const MyComponent = observer((props: typeof initialProps) => {
        const context2 = useContext(StoreContext2);

        const { vm } = useStore(VM, { ...props, context2 }, { context2: false });

        return <div className={'computed'}>{vm.context2Data}</div>;
      });

      const { container } = render(<MyComponent {...initialProps} />);

      expect(getElementContent(container, 'computed')).to.eq(`string`);
    }

    testContextValues.forEach((contextValue) => check(contextValue, { data: { foo: 'string' } }));
  });

  it('hook (VM + props + exclude): props are observable with exclude', () => {
    function check<TContext>(contextValue: TContext, initialProps: any) {
      const StoreContext = React.createContext(contextValue);

      const useStore = createUseStore(StoreContext);

      type ViewModel = ViewModelConstructor<TContext>;

      class VM implements ViewModel {
        constructor(
          public context: TContext,
          public props: typeof initialProps
        ) {
          makeAutoObservable(this, { context: false }, { autoBind: true });
        }
      }

      const { result } = renderHook((props) => useStore(VM, props, { dataNoObs: false }), {
        initialProps,
      });

      expect(result.current.context).to.deep.eq(contextValue);
      expect(result.current.vm).to.deep.eq({ context: contextValue, props: initialProps });

      expect(isObservable(result.current.vm.props)).to.deep.eq(true);
      expect(isObservable(result.current.vm.props.data2)).to.deep.eq(true);
      expect(isObservable(result.current.vm.props.dataNoObs)).to.deep.eq(false);
    }

    testContextValues.forEach((contextValue) =>
      check(contextValue, {
        data: 'string',
        data2: { data3: 'string' },
        dataNoObs: { data4: 'string' },
      })
    );
  });

  it('hook (VM + props + exclude): exclude works on rerender', () => {
    function check<TContext>(contextValue: TContext, initialProps: any) {
      const StoreContext = React.createContext(contextValue);

      const useStore = createUseStore(StoreContext);

      type ViewModel = ViewModelConstructor<TContext>;

      class VM implements ViewModel {
        constructor(
          public context: TContext,
          public props: typeof initialProps
        ) {
          makeAutoObservable(this, { context: false }, { autoBind: true });
        }
      }

      const { result, rerender } = renderHook(
        (props) => useStore(VM, props, { dataNoObs: false }),
        {
          initialProps,
        }
      );

      expect(result.current.context).to.deep.eq(contextValue);
      expect(result.current.vm).to.deep.eq({ context: contextValue, props: initialProps });

      expect(isObservable(result.current.vm.props)).to.deep.eq(true);
      expect(isObservable(result.current.vm.props.data2)).to.deep.eq(true);
      expect(isObservable(result.current.vm.props.dataNoObs)).to.deep.eq(false);

      const rerenderProps = {
        data: 'string2',
        data2: { data3: 'string2' },
        dataNoObs: { data4: 'string2' },
      };

      rerender(rerenderProps);

      expect(result.current.context).to.deep.eq(contextValue);
      expect(result.current.vm).to.deep.eq({ context: contextValue, props: rerenderProps });

      expect(isObservable(result.current.vm.props)).to.deep.eq(true);
      expect(isObservable(result.current.vm.props.data2)).to.deep.eq(true);
      expect(isObservable(result.current.vm.props.dataNoObs)).to.deep.eq(false);
    }

    testContextValues.forEach((contextValue) =>
      check(contextValue, {
        data: 'string',
        data2: { data3: 'string' },
        dataNoObs: { data4: 'string' },
      })
    );
  });

  it('hook (VM + props + exclude): computed works correctly', () => {
    function check<TContext>(contextValue: TContext, initialProps: any) {
      const StoreContext = React.createContext(contextValue);

      const useStore = createUseStore(StoreContext);

      type ViewModel = ViewModelConstructor<TContext>;

      class VM implements ViewModel {
        constructor(
          public context: TContext,
          public props: typeof initialProps
        ) {
          makeAutoObservable(this, { context: false }, { autoBind: true });
        }

        get computedCalculated() {
          return this.props.data + this.props.data2.data3;
        }
      }

      const { result, rerender } = renderHook(
        (props) => useStore(VM, props, { dataNoObs: false }),
        { initialProps }
      );

      expect(result.current.vm.computedCalculated).to.deep.eq('stringstring');

      const rerenderProps = {
        data: 'string2',
        data2: { data3: 'string2' },
        dataNoObs: { data4: 'string2' },
      };

      rerender(rerenderProps);

      expect(result.current.vm.computedCalculated).to.deep.eq('string2string2');
    }

    testContextValues.forEach((contextValue) =>
      check(contextValue, {
        data: 'string',
        data2: { data3: 'string' },
        dataNoObs: { data4: 'string' },
      })
    );
  });

  it('hook (empty): lifecycle called', () => {
    function check<TContext>(contextValue: TContext, initialProps: any) {
      const StoreContext = React.createContext(contextValue);

      const spy_globalBeforeMount = spy();
      const spy_globalAfterMount = spy();
      const spy_globalBeforeUnmount = spy();

      const useStore = createUseStore(StoreContext, {
        beforeMount() {
          spy_globalBeforeMount();
        },
        afterMount() {
          spy_globalAfterMount();
        },
        beforeUnmount() {
          spy_globalBeforeUnmount();
        },
      });

      const { rerender, unmount } = renderHook(() => useStore(), { initialProps });

      expect(spy_globalBeforeMount.callCount, 'spy_globalBeforeMount').to.deep.eq(1);
      expect(spy_globalAfterMount.callCount, 'spy_globalAfterMount').to.deep.eq(1);
      expect(spy_globalBeforeUnmount.callCount, 'spy_globalBeforeUnmount').to.deep.eq(0);

      const rerenderProps = {
        data: 'string2',
      };

      rerender(rerenderProps);

      expect(spy_globalBeforeMount.callCount, 'spy_globalBeforeMount').to.deep.eq(1);
      expect(spy_globalAfterMount.callCount, 'spy_globalAfterMount').to.deep.eq(1);
      expect(spy_globalBeforeUnmount.callCount, 'spy_globalBeforeUnmount').to.deep.eq(0);

      unmount();

      expect(spy_globalBeforeMount.callCount, 'spy_globalBeforeMount').to.deep.eq(1);
      expect(spy_globalAfterMount.callCount, 'spy_globalAfterMount').to.deep.eq(1);
      expect(spy_globalBeforeUnmount.callCount, 'spy_globalBeforeUnmount').to.deep.eq(1);
    }

    testContextValues.forEach((contextValue) => check(contextValue, { data: 'string' }));
  });

  it('hook (only VM): lifecycle called', () => {
    function check<TContext>(contextValue: TContext, initialProps: any) {
      const StoreContext = React.createContext(contextValue);

      const spy_globalBeforeMount = spy();
      const spy_globalAfterMount = spy();
      const spy_globalBeforeUnmount = spy();

      const useStore = createUseStore(StoreContext, {
        beforeMount() {
          spy_globalBeforeMount();
        },
        afterMount() {
          spy_globalAfterMount();
        },
        beforeUnmount() {
          spy_globalBeforeUnmount();
        },
      });

      type ViewModel = ViewModelConstructor<TContext>;

      const spy_beforeMount = spy();
      const spy_afterMount = spy();
      const spy_beforeUnmount = spy();

      class VM implements ViewModel {
        constructor(public context: TContext) {
          makeAutoObservable(this, { context: false }, { autoBind: true });
        }

        beforeMount() {
          spy_beforeMount();
        }

        afterMount() {
          spy_afterMount();
        }

        beforeUnmount() {
          spy_beforeUnmount();
        }
      }

      const { rerender, unmount } = renderHook((props) => useStore(VM, props), { initialProps });

      expect(spy_globalBeforeMount.callCount, 'spy_globalBeforeMount').to.deep.eq(1);
      expect(spy_globalAfterMount.callCount, 'spy_globalAfterMount').to.deep.eq(1);
      expect(spy_globalBeforeUnmount.callCount, 'spy_globalBeforeUnmount').to.deep.eq(0);

      expect(spy_beforeMount.callCount, 'spy_beforeMount').to.deep.eq(1);
      expect(spy_afterMount.callCount, 'spy_afterMount').to.deep.eq(1);
      expect(spy_beforeUnmount.callCount, 'spy_beforeUnmount').to.deep.eq(0);

      const rerenderProps = {
        data: 'string2',
      };

      rerender(rerenderProps);

      expect(spy_globalBeforeMount.callCount, 'spy_globalBeforeMount').to.deep.eq(1);
      expect(spy_globalAfterMount.callCount, 'spy_globalAfterMount').to.deep.eq(1);
      expect(spy_globalBeforeUnmount.callCount, 'spy_globalBeforeUnmount').to.deep.eq(0);

      expect(spy_beforeMount.callCount, 'spy_beforeMount').to.deep.eq(1);
      expect(spy_afterMount.callCount, 'spy_afterMount').to.deep.eq(1);
      expect(spy_beforeUnmount.callCount, 'spy_beforeUnmount').to.deep.eq(0);

      unmount();

      expect(spy_globalBeforeMount.callCount, 'spy_globalBeforeMount').to.deep.eq(1);
      expect(spy_globalAfterMount.callCount, 'spy_globalAfterMount').to.deep.eq(1);
      expect(spy_globalBeforeUnmount.callCount, 'spy_globalBeforeUnmount').to.deep.eq(1);

      expect(spy_beforeMount.callCount, 'spy_beforeMount').to.deep.eq(1);
      expect(spy_afterMount.callCount, 'spy_afterMount').to.deep.eq(1);
      expect(spy_beforeUnmount.callCount, 'spy_beforeUnmount').to.deep.eq(1);
    }

    testContextValues.forEach((contextValue) => check(contextValue, { data: 'string' }));
  });

  it('component (empty): lifecycle called SSR', () => {
    function check<TContext>(contextValue: TContext, initialProps: any) {
      const StoreContext = React.createContext(contextValue);

      const spy_globalBeforeMount = spy();
      const spy_globalAfterMount = spy();
      const spy_globalBeforeUnmount = spy();

      const useStore = createUseStore(StoreContext, {
        beforeMount() {
          spy_globalBeforeMount();
        },
        afterMount() {
          spy_globalAfterMount();
        },
        beforeUnmount() {
          spy_globalBeforeUnmount();
        },
      });

      const MyComponent = () => {
        useStore();

        return <div className={'test'}>123</div>;
      };

      renderToString(<MyComponent {...initialProps} />);

      expect(spy_globalBeforeMount.callCount, 'spy_globalBeforeMount').to.deep.eq(1);
      expect(spy_globalAfterMount.callCount, 'spy_globalAfterMount').to.deep.eq(0);
      expect(spy_globalBeforeUnmount.callCount, 'spy_globalBeforeUnmount').to.deep.eq(0);
    }

    testContextValues.forEach((contextValue) => check(contextValue, { data: 'string' }));
  });

  it('component (only VM): lifecycle called SSR', () => {
    function check<TContext>(contextValue: TContext, initialProps: any) {
      const StoreContext = React.createContext(contextValue);

      const spy_globalBeforeMount = spy();
      const spy_globalAfterMount = spy();
      const spy_globalBeforeUnmount = spy();

      const useStore = createUseStore(StoreContext, {
        beforeMount() {
          spy_globalBeforeMount();
        },
        afterMount() {
          spy_globalAfterMount();
        },
        beforeUnmount() {
          spy_globalBeforeUnmount();
        },
      });

      type ViewModel = ViewModelConstructor<TContext>;

      const spy_beforeMount = spy();
      const spy_afterMount = spy();
      const spy_beforeUnmount = spy();

      class VM implements ViewModel {
        constructor(
          public context: TContext,
          public props: typeof initialProps
        ) {
          makeAutoObservable(this, { context: false }, { autoBind: true });
        }

        beforeMount() {
          spy_beforeMount();
        }

        afterMount() {
          spy_afterMount();
        }

        beforeUnmount() {
          spy_beforeUnmount();
        }
      }
      const MyComponent = (props: typeof initialProps) => {
        useStore(VM, props);

        return <div className={'test'}>123</div>;
      };

      renderToString(<MyComponent {...initialProps} />);

      expect(spy_globalBeforeMount.callCount, 'spy_globalBeforeMount').to.deep.eq(1);
      expect(spy_globalAfterMount.callCount, 'spy_globalAfterMount').to.deep.eq(0);
      expect(spy_globalBeforeUnmount.callCount, 'spy_globalBeforeUnmount').to.deep.eq(0);

      expect(spy_beforeMount.callCount).to.deep.eq(1);
      expect(spy_afterMount.callCount).to.deep.eq(0);
      expect(spy_beforeUnmount.callCount).to.deep.eq(0);
    }

    testContextValues.forEach((contextValue) => check(contextValue, { data: 'string' }));
  });
});
