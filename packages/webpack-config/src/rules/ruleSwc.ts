import { TypeLoader, TypeRule } from '../types';

/**
 * @docs: https://swc.rs/docs/usage/swc-loader
 *
 */

const loaderSwc: TypeLoader = {
  loader: 'swc-loader',
  options: {
    jsc: {
      parser: { tsx: true, syntax: 'typescript', dynamicImport: true },
      transform: {
        react: { runtime: 'automatic', useBuiltins: true },
      },
      experimental: {
        plugins: [[require.resolve('@swc/plugin-loadable-components'), {}]],
      },
    },
  },
};

if (global.includePolyfills) {
  // @ts-ignore
  loaderSwc.options.env = { mode: 'usage', coreJs: 3, targets: global.browserslist };
}

/**
 * @docs: https://github.com/Va1/string-replace-loader
 *
 */

const loaderConnectedReplace: TypeLoader = {
  loader: 'string-replace-loader',
  options: {
    search:
      '\n(export default |export )?class ([a-zA-Z0-9]+)(.*?)?extends ConnectedComponent(.*?(?=}\n}))}\n}',
    // eslint-disable-next-line max-params
    replace(
      match: string,
      exportStatement: string,
      className: string,
      types: string,
      classContent: string
    ) {
      const wrappedComponent = `ConnectedComponent.observer(class ${className} extends ConnectedComponent${classContent}}\n});`;

      let str = '\n';

      if (exportStatement) str += exportStatement;

      if (!exportStatement || !exportStatement.includes('default')) {
        str += `const ${className} = ${wrappedComponent}`;
      } else {
        str += wrappedComponent;
      }

      return str;
    },
    flags: 'gs',
  },
};

export const ruleSwc: TypeRule = {
  test: /\.(jsx?|tsx?)$/,
  use: [loaderSwc, loaderConnectedReplace],
  exclude: /node_modules/,
};
