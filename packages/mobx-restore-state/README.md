## Library for safe merging of MobX observables

![coverage](https://github.com/dkazakov8/dk-framework/blob/master/packages/mobx-restore-state/cover.svg)
[![npm](https://img.shields.io/npm/v/dk-mobx-restore-state)](https://www.npmjs.com/package/dk-mobx-restore-state)
[![license](https://img.shields.io/npm/l/dk-mobx-restore-state)](https://github.com/dkazakov8/dk-framework/blob/master/packages/mobx-restore-state/LICENSE)

> [!WARNING]  
> It's fine if you use this library from NPM package with a **static versioning** in case you
> want it for some pet-project or to test it's capabilities.
>
> But for production use it's **strongly recommended** to create a fork, because I do not write
> Changelogs and may break / add some functionality without notice.

### Purpose

The purpose of this library is to safely restore state during SSR.

MobX 4 had a bug where newly added objects were not observable, like

```typescript
const result = Object.assign(observable({ str: '123' }), { str: '321', obj: {} });

expect(isObservable(result.obj)).to.deep.eq(false); // BUG in MobX 4
```

Nowadays MobX 5 / 6 versions do not have this bug, we can use `Object.assign`. But when we speak about
classes, the behavior remain inconsistent:

```typescript
class Target {
  constructor() { makeAutoObservable(this); }
  str = '123';
}
    
const result = Object.assign(new Target(), { str: '321', obj: {} });

expect(isObservable(result.obj)).to.deep.eq(false); // BUG in all MobX versions

class Target {
  constructor() { makeAutoObservable(this); }
  str = '123';
  obj;
}
    
const result = Object.assign(new Target(), { str: '321', obj: {} });

expect(isObservable(result.obj)).to.deep.eq(false); // BUG in all MobX versions

class Target {
  constructor() { makeAutoObservable(this); }
  str = '123';
  obj = undefined;
}
    
const result = Object.assign(new Target(), { str: '321', obj: {} });

expect(isObservable(result.obj)).to.deep.eq(true); // No bug finally!
```

So, if you declare fore example `user?: User` inside your model and then SSR gives you a serialized
object like `user: { name: 'John' }` it will not become observable if you use `Object.assign(store, SSR_DATA)`.

This is very confusing and depends on transpilers (Babel, TSC, Esbuild, SWC) which all behave
differently. So, this library makes everything **consistent**.

### Usage

Install `dk-mobx-restore-state` and use it instead of `Object.assign` where needed. Everything
will be `observable` (in MobX 4 or in class objects) in all the cases mentioned above.

#### Syntax

`restoreState({ logs, target, source })`

`logs` (boolean): logging of operations

`target`: object that needs to be filled with observable data

`source`: object with some data (may be observable or not)

### Alternatives

You can still use `Object.assign` if the source is `observable`. Like this

```typescript
const result = Object.assign(new Target(), observable({ str: '321', obj: {} }));
```

It seems to work correctly in most cases.