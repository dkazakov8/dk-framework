## Library for merging observables (DEPRECATED)

![coverage](https://github.com/dkazakov8/dk-framework/blob/master/packages/mobx-restore-state/cover.svg)
[![npm](https://img.shields.io/npm/v/dk-mobx-restore-state)](https://www.npmjs.com/package/dk-mobx-restore-state)
[![license](https://img.shields.io/npm/l/dk-mobx-restore-state)](https://github.com/dkazakov8/dk-framework/blob/master/packages/mobx-restore-state/LICENSE)

> [!WARNING]  
> It's fine if you use this library from NPM package with a **static versioning** in case you
> want it for some pet-project or to test it's capabilities.
>
> But for production use it's **strongly recommended** to create a fork, because I do not write
> Changelogs and may break / add some functionality without notice.

The purpose of this library is to safely restore state during SSR.

MobX 4 had a bug where newly added objects were not observable, like

```typescript
const target = observable({ str: '123' });
const source = { str: '321', obj: {} };

const result = Object.assign(target, source);

expect(result).to.deep.eq(source);
expect(isObservable(result)).to.deep.eq(true);
expect(isObservable(result.obj)).to.deep.eq(false); // BUG
```

Nowadays MobX 5 / 6 versions do not have this bug, we can safely use `Object.assign`. So this library
is **DEPRECATED** and may be used in legacy-projects only. So with MobX 4 use this:

```typescript
const target = observable({ str: '123' });
const source = { str: '321', obj: {} };

const result = restoreState(target, source);

expect(result).to.deep.eq(source);
expect(isObservable(result)).to.deep.eq(true);
expect(isObservable(result.obj)).to.deep.eq(true); // NO BUGS
```