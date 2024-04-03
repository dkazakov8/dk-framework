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
  - [Track execution / show loaders](#named-methods-from-prototype)
  - [Track execution time](#track-execution-time)
  - [Show errors](#show-errors)
  - [Cancel execution](#cancel-execution)

### Installation

Add `dk-mobx-stateful-fn` to package.json and install.

### Usage: functions

#### Named functions

```typescript
import { addState } from 'dk-mobx-stateful-fn';
import { action, observable, runInAction, autorun } from 'mobx';

function asyncFunction() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ACTION_TIMEOUT);
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
    setTimeout(resolve, ACTION_TIMEOUT);
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
  ctx[fn.name] = addState({
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