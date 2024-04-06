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

The purpose of this library is to allow local MobX View Models be attached to React components.



"function as object", adding an observable state to the function, so you could easily:
- show loaders in your React / any framework components
- see how much time the execution has taken
- show error messages and names just from this function
- easily track when all async functions have finished for SSR
- and even cancel the function's execution (it's a fake mechanism because we cannot really cancel
  a Promise, but the approach here is enough for 99% apps)

#### Contents

- [Installation](#installation)

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

const asyncFunctionStateful = addState(asyncFunction, asyncFunction.name)

// Now you can track this function's execution like

autorun(() => {
  console.log(JSON.stringify(asyncFunctionStateful.state));
})

asyncFunctionStateful();
```