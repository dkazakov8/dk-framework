import { IReactionDisposer } from 'mobx';
import { Component } from 'react';

import { TypeCreateContextParams } from '../types/TypeCreateContextParams';

export function appendAutorun(
  ctx: Component & { autorunDisposers?: Array<IReactionDisposer> },
  fn: () => void,
  transformers: TypeCreateContextParams['transformers']
): void {
  const disposer = transformers.autorun(fn);

  if (!ctx.autorunDisposers) {
    Object.defineProperty(ctx, 'autorunDisposers', { value: [] });
  }

  ctx.autorunDisposers!.push(disposer);

  const original = ctx.componentWillUnmount ? ctx.componentWillUnmount.bind(ctx) : null;

  Object.defineProperty(ctx, 'componentWillUnmount', {
    value: function componentWillUnmount() {
      ctx.autorunDisposers!.forEach((d) => d());
      if (original) original();
    },
    writable: true,
  });
}
