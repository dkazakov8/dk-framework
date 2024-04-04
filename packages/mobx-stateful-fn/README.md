## Library for adding MobX observable state to async functions

[![coverage](https://img.shields.io/codecov/c/gh/dkazakov8/dk-mobx-stateful-fn/master)](https://codecov.io/gh/dkazakov8/dk-mobx-stateful-fn)
[![npm](https://img.shields.io/npm/v/dk-mobx-stateful-fn)](https://www.npmjs.com/package/dk-mobx-stateful-fn)
[![license](https://img.shields.io/npm/l/dk-mobx-stateful-fn)](https://github.com/dkazakov8/dk-framework/blob/master/packages/mobx-stateful-fn/LICENSE)

The purpose of this library is to simplify tracking of async function execution. It uses a pattern
"function as object", adding an observable state to the function, so you could easily:
- show loaders in your React / any framework components
- see how much time the execution has taken
- show error messages and names just from this function
- easily track when all async functions have finished for SSR
- and even cancel the function's execution (it's a fake mechanism because we cannot really cancel
a Promise, but the approach here is enough for 99% apps)

#### Contents

- [Installation](#installation)
- [Usage: functions](#usage-functions)
  - [Named functions](#named-functions)
  - [Anonymous functions](#anonymous-functions)
- [Usage: classes](#usage-classes)
  - [Named methods (from prototype)](#named-methods-from-prototype)
  - [Anonymous methods](#anonymous-methods)
- [Use cases](#use-cases)
  - [Track execution / show loaders](#track-execution--show-loaders)
  - [Track execution time](#track-execution-time)
  - [Show errors](#show-errors)
  - [Cancel execution](#cancel-execution)
  - [SSR](#ssr)
- [Limitations](#limitations)

### Installation

Add `dk-mobx-stateful-fn` to package.json and install.

### Usage: functions

#### Named functions

```typescript
import { addState } from 'dk-mobx-stateful-fn';
import { action, observable, runInAction, autorun } from 'mobx';

function asyncFunction() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 100);
   });
}

const asyncFunctionStateful = addState({ 
  fn: asyncFunction, 
  name: asyncFunction.name, 
  transformers: { action, batch: runInAction, observable }
})

// Now you can track this function's execution like

autorun(() => {
  console.log(JSON.stringify(asyncFunctionStateful.state));
})

asyncFunctionStateful();
```

You probably would like to add a high-order function to make things easier like

```typescript
import { addState, TypeFnAsync } from 'dk-mobx-stateful-fn';
import { action, observable, runInAction } from 'mobx';

const transformers = { action, batch: runInAction, observable }

function addStateToNamedFunction(fn: TypeFnAsync) {
  return addState({ fn: asyncFunction, name: asyncFunction.name, transformers })
}

function asyncFunction() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 100);
  });
}

const asyncFunctionStateful = addStateToNamedFunction(asyncFunction);
```

#### Anonymous functions

In case the function does not have a name you should provide it manually

```typescript
import { addState, TypeFnAsync } from 'dk-mobx-stateful-fn';
import { action, observable, runInAction } from 'mobx';

const transformers = { action, batch: runInAction, observable }

function addStateToAnonymousFunction(fn: TypeFnAsync, name: string) {
  return addState({ fn: asyncFunction, name, transformers })
}

const asyncFunctionStateful = addStateToAnonymousFunction(() => Promise.resolve(), 'asyncFunctionStateful');
```

### Usage: classes

#### Named methods (from prototype)

```typescript
import { addState, TypeFnAsync } from 'dk-mobx-stateful-fn';
import { action, observable, runInAction } from 'mobx';

const transformers = { action, batch: runInAction, observable }

function addStateToNamedMethod(ctx: any, fn: TypeFnAsync) {
  ctx[fn.name] = addState({
    fn: fn.bind(ctx),
    name: fn.name,
    transformers,
  });
}

class ClassFunctions {
  constructor() {
    // we have to exclude our functions from makeAutoObservable
    makeAutoObservable(
      this,
      { asyncFunction: false },
      { autoBind: true }
    );
    
    addStateToNamedMethod(this, this.asyncFunction);
  }

  asyncFunction() {
    // "this" is working and bound to the instance
    // console.log(this)
  
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });
  };
}
```

#### Anonymous methods

```typescript
import { addState, TypeFnAsync } from 'dk-mobx-stateful-fn';
import { action, observable, runInAction } from 'mobx';

const transformers = { action, batch: runInAction, observable }

function addStateToAnonymousMethod(ctx: any, fn: TypeFnAsync, name: string) {
  ctx[name] = addState({
    fn,
    name,
    transformers,
  });
}

class ClassFunctions {
  constructor() {
    // we have to exclude our functions from makeAutoObservable
    makeAutoObservable(
      this,
      { asyncFunction: false },
      { autoBind: true }
    );
    
    this.asyncFunction = addStateToAnonymousMethod(this, this.asyncFunction, 'asyncFunction');
  }

  asyncFunction = () => {
    // "this" is working and bound to the instance
    // console.log(this)
  
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });
  };
}
```

### Use cases

#### Track execution / show loaders

```typescript
const MyComponent = observer(function MyComponent() {
  useEffect(() => {
    asyncFunctionStateful();
  }, []);
  
  return (
    <div>
      {asyncFunctionStateful.state.isExecuting && 'Is loading...'}
      
      {!asyncFunctionStateful.state.isExecuting && 'Loaded!'}
    </div>
  )
})

// or somewhere

autorun(() => {
  if (asyncFunctionStateful.state.isExecuting) {
    console.log(`${asyncFunctionStateful.name} is executing`);
  } else {
    console.log(`${asyncFunctionStateful.name} is idle`);
  }
})

asyncFunctionStateful();
```

#### Track execution time

```typescript
const MyComponent = observer(function MyComponent() {
  useEffect(() => {
    asyncFunctionStateful();
  }, []);
  
  return (
    <div>
      {Boolean(asyncFunctionStateful.state.executionTime) && `Loading took ${asyncFunctionStateful.state.executionTime}`}
    </div>
  )
})

// or somewhere

autorun(() => {
  if (asyncFunctionStateful.state.executionTime) {
    console.log(`${asyncFunctionStateful.name} took ${asyncFunctionStateful.state.executionTime}ms to finish`);
  }
})

asyncFunctionStateful();
```

#### Show errors

```typescript
const MyComponent = observer(function MyComponent() {
  useEffect(() => {
    asyncFunctionStateful();
  }, []);
  
  return (
    <div>
      {asyncFunctionStateful.state.error && `Error happened ${asyncFunctionStateful.state.error}`}
      {asyncFunctionStateful.state.errorName && `Error name is ${asyncFunctionStateful.state.errorName}`}
    </div>
  )
})

// or somewhere

autorun(() => {
  if (asyncFunctionStateful.state.error) {
    console.log(`${asyncFunctionStateful.name} failed with ${asyncFunctionStateful.state.error}`);
  }
})

asyncFunctionStateful();
```

#### Cancel execution

```typescript
const MyComponent = observer(function MyComponent() {
  useEffect(() => {
    asyncFunctionStateful()
      .catch(error => {
        if (error.name === 'ACTION_CANCELED') {
          console.log('Component has been unmounted, so we will just ignore this error')
        }
      });
    
    return () => {
      asyncFunctionStateful.state.isCancelled = true;
    }
  }, []);
  
  return (
    <div></div>
  )
})

// or somewhere

autorun(() => {
  if (asyncFunctionStateful.state.errorName === 'ACTION_CANCELED') {
    console.log(`${asyncFunctionStateful.name} has been cancelled`);
  }
})

asyncFunctionStateful();
```

#### SSR

For SSR you may have an architecture where the Actions layer is separate. And this actions are
executed inside React components like in examples above (but not in `useEffect` of course, because
it's not triggered during `renderToString`. Maybe you use `useState` or ssr libs). 
If that's the case, SSR is as easy as that:

```typescript
app.get('*', (req, res) => {
  Promise.resolve()
    .then(() => renderToString(<App />))
    
    // smth. like !actionsLayer.some(fnStateful => fnStateful.state.isExecuting)
    .then(() => waitActionsSettled())
    
    // smth. like actionsLayerNames.every(fnName => { actionsLayer[fnName] = () => Promise.resolve() })
    .then(() => mockActions())
    
    .then(() => renderToString(<App />))
    .then((html) => res.send(html))
})
```

If the Actions layer is not separate, but is a part of the Stores layer, you still can gather this functions
in `actionsLayer` and use the recipe above.

This way you are not limited by implementation and can easily add SSR to your app.

### Limitations

Because 1 stateful function has only 1 state, parallel execution is not supported. This code will
result in inconsistency

```typescript
function asyncFunction() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 100);
  });
}

const asyncFunctionStateful = addStateToNamedFunction(asyncFunction);

asyncFunctionStateful();

setTimeout(() => asyncFunctionStateful(), 1);
```

so `state.isExecuting` will become `false` when **first** call has been finished and 
`state.executionTime` will also be calculated incorrectly. You should either ensure that the
stateful function has been finished like

```typescript
function asyncFunction() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 100);
  });
}

const asyncFunctionStateful = addStateToNamedFunction(asyncFunction);

asyncFunctionStateful();

const interval = setInterval(() => {
  if (!asyncFunctionStateful.state.isExecuting) {
    // make the second call
    asyncFunctionStateful();
  }
}, 10)

// or smth. like

mobx.reaction(
  () => asyncFunctionStateful.state.isExecuting,
  (isExecuting) => {
    if (!isExecuting) {
      // make the second call
      asyncFunctionStateful();
    }
  }
)
```

or create several stateful functions like

```typescript
function asyncFunction() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 100);
  });
}

const asyncFunctionStateful = addStateToNamedFunction(asyncFunction);
const asyncFunctionStateful2 = addStateToNamedFunction(asyncFunction);

asyncFunctionStateful();
asyncFunctionStateful2();
```








