/* eslint-disable no-unused-expressions, no-restricted-syntax, @typescript-eslint/naming-convention, react/jsx-no-literals */

import { expect } from 'chai';
import { render, screen, renderHook } from '@testing-library/react';
import React from 'react';

import { createUseStore } from '../src/createUseStore';

describe('createUseStore', () => {
  it('adds default state & name', async () => {
    expect(1).to.eq(1);

    const MyComponent = () => {
      return <div className={'test'}>123</div>;
    };

    const { container } = render(<MyComponent />);

    const button = await screen.getByText('123');

    expect(button).to.be.not.null;
    expect(container.getElementsByTagName('div').length).to.eq(1);
  });

  it.only('adds default state & name2', () => {
    function checkContextIsPresent(value: any) {
      const StoreContext = React.createContext(value);

      const useStore = createUseStore(StoreContext);

      const { result } = renderHook(() => useStore());

      expect(result.current.context).to.deep.eq(value);
    }

    checkContextIsPresent(undefined);
    checkContextIsPresent(null);
    checkContextIsPresent(1);
  });
});
