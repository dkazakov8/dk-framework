import { TypeLoader, TypeRule } from '../types';

/**
 * @docs: https://swc.rs/docs/usage/swc-loader
 *
 */

const loaderSwcServer: TypeLoader = {
  loader: 'swc-loader',
  options: {
    jsc: {
      parser: { tsx: true, syntax: 'typescript' },
      transform: {
        react: { runtime: 'automatic', useBuiltins: true },
      },
      experimental: {
        plugins: [[require.resolve('@swc/plugin-loadable-components'), {}]],
      },
    },
  },
};

export const ruleSwcServer: TypeRule = {
  test: /\.(jsx?|tsx?)$/,
  use: [loaderSwcServer],
};
