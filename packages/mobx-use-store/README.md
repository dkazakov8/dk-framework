## Library for connecting MobX View Models to your React components

[![coverage](https://img.shields.io/codecov/c/gh/dkazakov8/dk-mobx-use-store/master)](https://codecov.io/gh/dkazakov8/dk-mobx-use-store)
[![npm](https://img.shields.io/npm/v/dk-mobx-use-store)](https://www.npmjs.com/package/dk-mobx-use-store)
[![license](https://img.shields.io/npm/l/dk-mobx-use-store)](https://github.com/dkazakov8/dk-framework/blob/master/packages/mobx-stateful-fn/LICENSE)

> [!WARNING]  
> It's fine if you use this library from NPM package with a **static versioning** in case you
> want it for some pet-project or to test it's capabilities.
>
> But for production use it's **strongly recommended** to create a fork, because I do not write
> Changelogs and may break / add some functionality without notice.

The purpose of this library is to allow local MobX View Models (VM) be attached to FC React components.

The logic in FC components may become bloated, so it's much more comfortable to write it in
MobX class stores. This gives you a great structure, clean code and powerful reactive performance.
Approach React FC + MobX VM allows to get rid of messy hooks and write good-looking performant applications.

This library:
- allows to inject 1 or more Context dependencies inside VM
- may be used in different modes (without arguments or with VM, props, exclude)
- automatically converts props to `observable` and synchronizes VM with new props
- has a comprehensive lifecycle similar to React Class Components (beforeMount, afterMount, beforeUnmount)
- has a storage for `reaction / autorun` subscriptions which are automatically disposed on component unmount


#### Contents

- [Installation](#installation)
- [Usage: modes](#usage-modes)
  - [Without arguments (just context)](#without-arguments-just-context)
  - [With VM](#with-vm)
  - [With VM & props](#with-vm--props)
  - [With VM & props & exclude](#with-vm--props--exclude)
  - [With several contexts](#with-several-contexts)
- [Usage: Lifecycle](#usage-lifecycle)
  - [Inside VM](#inside-vm)
  - [Global](#global)

### Installation

Add `dk-mobx-use-store` to package.json and install.

### Usage: modes

#### Without arguments (just context)

```typescript
import { createUseStore } from 'dk-mobx-use-store';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';

const StoreContext = React.createContext(undefined); // any context

const useStore = createUseStore(StoreContext);

function TopWrapper() {
  return (
    <StoreContext.Provider value={observable({ ui: {}, user: {}, api: {} })}>
      <App />
    </StoreContext.Provider>
  );
}

const App = observer(() => {
  const { context } = useStore();

  return (
    <>
      <div>{context.user.name}</div>
    </>
  );
});
```

This is a minimal example. `StoreContext` may be any (`undefined | null | object | observable | function | array`), but
it is required as a first argument for `createUseStore`. You can construct several different `useStore`
if you use some feature-sliced, domain, atomic or other architecture.

```typescript
import { createUseStore } from 'dk-mobx-use-store';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';

const ContextGlobal = React.createContext(observable({ ui: {}, user: {}, api: {} }));
const useStoreGlobal = createUseStore(ContextGlobal);

const ContextWidget = React.createContext(['123']);
const useStoreWidget = createUseStore(ContextWidget);

const ContextPageModule = React.createContext({ pageName: 'users' });
const useStorePageModule = createUseStore(ContextPageModule);
```

and use them accordingly. By design **only one** context may be attached. This is applied by React
Hooks implementation (we cannot iterate hooks like `arrayOfContexts.forEach(ctx => useContext(ctx)`).

But there will be a workaround in other sections of the docs if you need this feature.

#### With VM

```typescript
import { ViewModelConstructor } from 'dk-mobx-use-store';
import { ContextType } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

... attach context and create useStore hook

type ViewModel = ViewModelConstructor<ContextType<typeof StoreContext>>;

class VM implements ViewModel {
  constructor(public context: ContextType<typeof StoreContext>) {
    makeAutoObservable(this, { context: false }, { autoBind: true });
  }
  
  get dataFromContext() {
    return this.context.user.name;
  }
}

const App = observer(() => {
  const { context, vm } = useStore(VM);

  return (
    <>
      <div>{vm.dataFromContext}</div>
      <div>{context.user.name}</div>
    </>
  );
});
```

Note that in this example we expect that `StoreContext` is already observable, so no need to wrap
it by `makeAutoObservable`. But if you want to wrap it, just do not include `{ context: false }` in
`makeAutoObservable`.

#### With VM & props

```typescript
... attach context and create useStore hook

type ViewModel = ViewModelConstructor<ContextType<typeof StoreContext>>;

type PropsApp = {
  data: string;
}

class VM implements ViewModel {
  localParam = 'string';

  constructor(public context: ContextType<typeof StoreContext>, public props: PropsApp) {
    makeAutoObservable(this, { context: false }, { autoBind: true });
  }
  
  get dataFromContext() {
    return this.context.user.name;
  }
  
  get dataFromProps() {
    return this.props.data;
  }
  
  get mixData() {
    return this.dataFromProps + this.dataFromContext + this.localParam;
  }
}

const App = observer((props: PropsApp) => {
  const { vm } = useStore(VM, props);

  return (
    <>
      <div>{vm.dataFromContext}</div>
      <div>{vm.dataFromProps}</div>
      <div>{vm.localParam}</div>
      <div>{vm.mixData}</div>
    </>
  );
});
```

Here is an example how to connect 3 types of data. On is passed by Context, the second is passed
by `props` and the last is a part of VM (`localParam`).

Props passed to `useStore` will be **automatically converted to an observable**. If you want
to exclude something read the next section.

#### With VM & props & exclude

```typescript
... attach context and create useStore hook

type ViewModel = ViewModelConstructor<ContextType<typeof StoreContext>>;

type PropsApp = {
  data: string;
  dataNotObservable: { foo: 'bar' }
}

class VM implements ViewModel {
  constructor(public context: ContextType<typeof StoreContext>, public props: PropsApp) {
    makeAutoObservable(this, { context: false }, { autoBind: true });
  }
}

const App = observer((props: PropsApp) => {
  const { vm } = useStore(VM, props, { dataNotObservable: false });

  return null;
});
```

This way `dataNotObservable` will not be converted to observable. You can use this for connecting
several contexts to your VM:

#### With several contexts

```typescript
const StoreContext = React.createContext(observable({ data: 1 }));
const StoreContext2 = React.createContext(observable({ data: 2 }));

const useStore = createUseStore(StoreContext);

type ViewModel = ViewModelConstructor<ContextType<typeof StoreContext>>;

type PropsApp = {
  data: string;
}

class VM implements ViewModel {
  constructor(
    public context: ContextType<typeof StoreContext>, 
    public props: PropsApp & { context2: ContextType<typeof StoreContext2> }
   ) {
    makeAutoObservable(this, { context: false }, { autoBind: true });
  }
  
  get computedFromTwoContexts() {
    return this.context.data + this.props.context2.data;
  }
}

const App = observer((props: PropsApp) => {
  const context2 = useContext(StoreContext2);
        
  const { vm } = useStore(VM, { ...props, context2 });

  return vm.computedFromTwoContexts; // 3
});
```

This way you can use `dk-mobx-use-store` as a Dependency Injection (DI) system that works over
React Context. This is fully supported by Server-Side Rendering (SSR).

### Usage: Lifecycle

#### Inside VM

```typescript
... attach context and create useStore hook

class VM implements ViewModel {
  constructor(public context: ContextType<typeof StoreContext>) {
    makeAutoObservable(this, { context: false }, { autoBind: true });
  }
  
  beforeMount() {
    // this function is invoked both during SSR & Client rendering
    // React class-component analog: componentWillMount
  }

  afterMount() {
    // this function is invoked during Client rendering only
    // React class-component analog: componentDidMount
  }

  beforeUnmount() {
    // this function is invoked during Client rendering only
    // React class-component analog: componentWillUnmount
  }
}

const App = observer(() => {
  const { vm } = useStore(VM);

  return null;
});
```

Be aware that during SSR only `beforeMount` is invoked. So start your isomorphic logic like 
api-requests here.

#### Global

```typescript
const useStore = createUseStore(StoreContext, {
  beforeMount(context, vm?) {},
  afterMount(context, vm?) {},
  beforeUnmount(context, vm?) {},
});

class VM implements ViewModel {
  constructor(public context: ContextType<typeof StoreContext>) {
    makeAutoObservable(this, { context: false }, { autoBind: true });
  }
}

const App = observer(() => {
  const { vm } = useStore(VM);
  
  // useStore(); if you call without VM argument then "vm" in global lifecycle will be empty

  return null;
});
```

Global lifecycle methods defined in the second argument of `createUseStore` are invoked for every
component that uses `useStore`, and **before local lifecycle methods defined in VM**. The most
obvious purpose of using them is logging (ex. add param `name = 'VM_for_Select'` to VM and log it 
in global lifecycle to know which component has been mounted / unmounted).

### Usage: Reactions (instead of useEffect)

React's `useEffect` tends to be messy, does not work with SSR, requires manual deps list to
be triggered, and can not be arranged conditionally or dynamically. 

MobX offers better experience with `reaction` / `autorun`, and this library provides a convenient 
way to describe them inside VM.

```typescript
... attach context and create useStore hook

class VM implements ViewModel {
  autorunDisposers: Array<IReactionDisposer> = [];
        
  constructor(public context: ContextType<typeof StoreContext>) {
    makeAutoObservable(this, { context: false }, { autoBind: true });
    
    // we can describe it here or in beforeMount / afterMount
    // can be put in if-condition or set dynamically
    this.autorunDisposers.push(
      autorun(() => {
        console.log(this.props.data, this.context.data);
      })
    );
  }
}

const App = observer(() => {
  const { vm } = useStore(VM);

  return null;
});
```

`autorunDisposers` is a system property that accepts reactions. All reactions in it will be 
**automatically** disposed on component unmount (right after `beforeUnmount` lifecycle is called).

To make it more convenient I prefer a small helper function:

```typescript
export function appendAutorun(ctx: ViewModel, fn: () => void) {
  if (isAction(fn)) {
    console.error(`appendAutorun: ${fn.name} can not be added, 
    because it is an action. Put it in the exclude section of makeAutoObservable`);

    return;
  }

  if (!ctx.autorunDisposers) {
    Object.defineProperty(ctx, 'autorunDisposers', { value: [] });
  }

  ctx.autorunDisposers!.push(autorun(fn));
}


class VM implements ViewModel {
  constructor(public context: ContextType<typeof StoreContext>) {
    makeAutoObservable(this, { context: false, someReaction: false }, { autoBind: true });
    
    appendAutorun(this, this.someReaction);
  }
  
  someReaction() {
    console.log(this.props.data, this.context.data);
  }
}

const App = observer(() => {
  const { vm } = useStore(VM);

  return null;
});
```

This way we can add a reaction with 1 line of code without boilerplate at all. `appendAutorun` will
also send an error to the console if we forgot exclude the autorun function in `makeAutoObservable`.
Current versions of MobX do not allow `action function` as an argument to `autorun`.

### Limitations

When a component rerenders and if you pass props to useStore and use some computations like

```typescript
class VM implements ViewModel {
  constructor(public context: ContextType<typeof StoreContext>, props: TypeProps) {
    makeAutoObservable(this, { context: false }, { autoBind: true });
  }
  
  get computedFromProps() {
    return this.props.user.name;
  }
}

const App = observer((props: TypeProps) => {
  const { vm } = useStore(VM, props);
  
  console.log(vm.computedFromProps);

  return vm.computedFromProps;
});
```

this component **will be rerendered twice**. This happens because React does not have a way to update
VM props _before_ render. So, the flow of renders will be like this:

1. `<App user={{ name: 'John' }}` shows in console 'John'
2. `<App user={{ name: 'Mark' }}` shows in console 'John' then 'Mark'

So, the component accepted new prop 'Mark', but `useStore` will update it's `this.props.user.name`
**after** the render. Then `observer` will detect that `vm.computedFromProps` and trigger
**the second rerender**. 

We can't overcome this limitation yet, because 2 reactivity systems (React and MobX) work separately.


















