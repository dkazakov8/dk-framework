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

If you want to restore your state and see a problem, it may be as follows:

1. You use MobX 4. It has a bug where newly added objects are not observable, like

```typescript
const result = Object.assign(observable({ str: '123' }), { str: '321', obj: {} });

expect(isObservable(result.obj)).to.eq(false); // BUG in MobX 4
```

Nowadays MobX 5 / 6 versions do not have this bug, we can use `Object.assign`. But when we speak about
classes, the behavior remains inconsistent.

2. You use a class mobx store without enumerated value

```typescript
class Target {
  constructor() { makeAutoObservable(this); }
  str = '123';
}
    
const result = Object.assign(new Target(), { str: '321', obj: {} });

expect(isObservable(result.obj)).to.eq(false); // BUG in all MobX versions
```

3. You use a class mobx store without initial value

```typescript
class Target {
  constructor() { makeAutoObservable(this); }
  str = '123';
  obj?: SomeType;
}
    
const result = Object.assign(new Target(), { str: '321', obj: {} });

expect(isObservable(result.obj)).to.eq(false); // BUG in all MobX versions
```

This is very confusing and depends on transpilers (Babel, TSC, Esbuild, SWC) which all behave
differently. So, this library makes everything **consistent**.

Now that you have fixed these errors and feels happy and still don't want `dk-mobx-restore-state`...

```typescript
class Target {
  constructor() { makeAutoObservable(this); }
  str = '123';
  obj?: SomeType = undefined;
}
    
const result = Object.assign(new Target(), { str: '321', obj: {} });

expect(isObservable(result.obj)).to.eq(true); // No bug finally!
```

4. You come across a problem that `Object.assign` is not a **deep merge**. So you can not restore 
a partial data like

```typescript
class Target {
  constructor() { makeAutoObservable(this); }
  obj = { a: 1 };
}
    
const result = Object.assign(new Target(), { obj: { b: 2 } });

expect(result.obj.a).to.eq(undefined); // Lost some initial data!
```

5. You try `lodash.merge` and see that it merges deeply, but with the same inconsistencies as 
`Object.assign`. You write a customizer and feel happy finally...

```typescript
mergeWith(new Target(), source, (objValue, srcValue) => {
  if (objValue == null && Object.prototype.toString.call(srcValue) === '[object Object]') {
    return observable(srcValue);
  }
}
```

But... There are some edge-cases in the strategy of merging and you need to see logs of the process...
Actually, you may consider `dk-mobx-restore-state` just from the start. It is thoroughly tested, 1.8kb unminified,
handles most of edge-cases and has no deps.

### Usage

Install `dk-mobx-restore-state` and use it instead of `Object.assign / mergeWith` where needed. Everything
will be `observable` (in MobX 4 or in class objects) in all the cases mentioned above.

#### Syntax

`restoreState({ logs, target, source })`

`logs` (boolean): logging of operations

`target`: object that needs to be filled with observable data

`source`: object with some data (may be observable or not)