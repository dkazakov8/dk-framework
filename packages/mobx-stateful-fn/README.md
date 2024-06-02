## Library for adding MobX observable state to async functions

![coverage](https://github.com/dkazakov8/dk-framework/blob/master/packages/mobx-stateful-fn/cover.svg)
[![npm](https://img.shields.io/npm/v/dk-mobx-stateful-fn)](https://www.npmjs.com/package/dk-mobx-stateful-fn)
[![license](https://img.shields.io/npm/l/dk-mobx-stateful-fn)](https://github.com/dkazakov8/dk-framework/blob/master/packages/mobx-stateful-fn/LICENSE)
![size](https://github.com/dkazakov8/dk-framework/blob/master/packages/mobx-stateful-fn/size.svg)

> [!WARNING]  
> It's fine if you use this library from NPM package with a **static versioning** in case you
> want it for some pet-project or to test it's capabilities.
> 
> But for production use it's **strongly recommended** to create a fork, because I do not write
> Changelogs and may break / add some functionality without notice.

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
- [Usage: mocks](#usage-mocks)
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
import { autorun } from 'mobx';

function asyncFunction() {
  return new Promise((resolve) => setTimeout(resolve, 100));
}

const asyncFunctionStateful = addState(asyncFunction, asyncFunction.name);

// Now you can track this function's execution like

autorun(() => {
  console.log(JSON.stringify(asyncFunctionStateful.state));
})

asyncFunctionStateful();
```

#### Anonymous functions

In case the function does not have a name you should provide it manually, otherwise a warning
will be displayed in the console.

```typescript
import { addState } from 'dk-mobx-stateful-fn';

const asyncFunctionStateful = addState(() => Promise.resolve(), 'asyncFunctionStateful');
```

### Usage: classes

#### Named methods (from prototype)

```typescript
import { addState, TypeFnAsync } from 'dk-mobx-stateful-fn';
import { makeAutoObservable } from 'mobx';

function addStateToNamedMethod(ctx: any, fn: TypeFnAsync) {
  ctx[fn.name] = addState(fn.bind(ctx), fn.name);
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
  
    return new Promise((resolve) => setTimeout(resolve, 100));
  };
}
```

#### Anonymous methods

```typescript
import { addState } from 'dk-mobx-stateful-fn';
import { makeAutoObservable } from 'mobx';

class ClassFunctions {
  constructor() {
    // we have to exclude our functions from makeAutoObservable
    makeAutoObservable(
      this,
      { asyncFunction: false },
      { autoBind: true }
    );
    
    this.asyncFunction = addState(this.asyncFunction, 'asyncFunction');
  }

  asyncFunction = () => {
    // "this" is working and bound to the instance
    // console.log(this)
  
    return new Promise((resolve) => setTimeout(resolve, 100));
  };
}
```

### Usage: mocks

When a mock is defined, the `asyncFunctionStateful` will not trigger any lifecycle and will
directly return the value defined in the mock. The logic inside `asyncFunction`
**will not be executed at all**. This is useful for tests or SSR.

```typescript
import { addState } from 'dk-mobx-stateful-fn';
import { runInAction } from 'mobx';

function asyncFunction() {
  // WILL NOT BE EXECUTED

  return new Promise((resolve) => setTimeout(() => resolve(1), 100));
}

const asyncFunctionStateful = addState(asyncFunction, asyncFunction.name);

runInAction(() => {
  asyncFunctionStateful.state.mock = Promise.resolve(2);
});

asyncFunctionStateful().then(data => console.log(data)) // 2
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
  return new Promise((resolve) => setTimeout(resolve, 100));
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
  return new Promise((resolve) => setTimeout(resolve, 100));
}

const asyncFunctionStateful = addStateToNamedFunction(asyncFunction);

asyncFunctionStateful();

const interval = setInterval(() => {
  if (!asyncFunctionStateful.state.isExecuting) {
    // make the second call
    asyncFunctionStateful();
    
    clearInterval(interval);
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
  return new Promise((resolve) => setTimeout(resolve, 100));
}

const asyncFunctionStateful = addStateToNamedFunction(asyncFunction);
const asyncFunctionStateful2 = addStateToNamedFunction(asyncFunction);

asyncFunctionStateful();
asyncFunctionStateful2();
```

or create a function factory with closures

```typescript
function createRequestFunction(url: string) {
  return function request() {
    return fetch(url)
  }
}

const getUsers = addStateToNamedFunction(createRequestFunction('/api/users'));
const getData = addStateToNamedFunction(createRequestFunction('/api/data'));

// getUsers.name === getData.name === 'request'
// so better set name explicitly
```

But these cases are rare in the real development.
