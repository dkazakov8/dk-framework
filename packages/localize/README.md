## Library for injecting texts into templates

[![coverage](https://img.shields.io/codecov/c/gh/dkazakov8/dk-localize/master)](https://codecov.io/gh/dkazakov8/dk-localize)
[![npm](https://img.shields.io/npm/v/dk-localize)](https://www.npmjs.com/package/dk-localize)
[![license](https://img.shields.io/npm/l/dk-localize)](https://github.com/dkazakov8/dk-localize/blob/master/LICENSE)

> Currently suits English-only projects. Features are limited, development is in progress in accordance to my needs

### Installation

Add `dk-localize` to package.json and install.

### Usage

1. Allow usage of `__dirname` in you builder. For Webpack it is `{ node: { __dirname: true } }`

2. Attach `getLn` to the place where localized text will be located, ex.:

```typescript
import { getLn as getLnNotBound, TypeTranslations } from 'dk-localize';

class GlobalStore {
  ln: TypeTranslations = {};
};

const store = new GlobalStore();

const getLn = getLnNotBound.bind(null, store.ln);
```

3. Pass `getLn` to components (ex. in React by Context)

```tsx
import { createContext } from 'react';
import { render } from 'react-dom';

const StoreContext = createContext(undefined);

render(
  <StoreContext.Provider value={{ getLn }}>
    <App />
  </StoreContext.Provider>,
  document.getElementById('app')
)
```

4. Create file with default texts, ex. `src/page/messages.ts`

```typescript
import { wrapMessages } from 'dk-localize';

export const messages = wrapMessages(__dirname, {
  title: 'Hello {user}',
});
```

5. Use in components, ex. in React `src/page/Page.tsx`

```tsx
import { Component, ContextType } from 'react';
import { messages } from './messages';
import { StoreContext } from '/StoreContext';

type TypeContext = ContextType<typeof StoreContext>;

export class PushMessagesList extends Component {
  static context: TypeContext;
  static contextType = StoreContext;
  declare context: TypeContext;
  
  render() {
      const { getLn } = this.context;
      
      return <>{getLn(messages.title, { user: 'John' })}</>
  }
}
```

### Features

- `wrapMessages` creates uniq names for every key by `__dirname`, so in the example above
it will be `src/page__title`

Coming features:
- preparation of JSON files that can be uploaded to localization system

### Plugins

#### Dynamic variables

Dynamic value must follow in brackets, supported value types are `string | number`, ex. 
```typescript
// mesages.ts
import { wrapMessages } from 'dk-localize';

export const messages = wrapMessages(__dirname, {
  title: 'Name: {firstName}, age: {age}',
});

// component
getLn(messages.title, { firstName: 'John', age: 25 }) // 'Name: John, age: 25'
```

#### Plurals

Plural value must follow in brackets, supported value type is `number`, ex. 
```typescript
// mesages.ts
import { wrapMessages } from 'dk-localize';

export const messages = wrapMessages(__dirname, {
  title: '{count: One,Many} {count: apple,apples}',
});

// component
getLn(messages.title, { count: 1 }) // 'One apple'
getLn(messages.title, { count: 2 }) // 'Many apples'
```

Syntax is `{param: textForOne,textForMany}`. Extra spaces and special symbols for texts are
currently not supported, only `[a-zA-Z0-9]`.
