/* eslint-disable camelcase, @typescript-eslint/naming-convention */

import TerserPlugin from 'terser-webpack-plugin';

// const terserOptions = {
//   parallel: true,
//   terserOptions: {
//     sourceMap: true,
//     keep_fnames: false,
//     keep_classnames: true,
//     output: {
//       beautify: false,
//       comments: /^!\s@env/,
//     },
//   },
// };

const terserOptionsSwc = {
  minify: TerserPlugin.swcMinify,
  parallel: true,
  terserOptions: {
    sourceMap: true,
    keepFnames: false,
    keepClassnames: true,
    compress: {
      arrows: false,
    },
    format: {
      comments: false,
    },
  },
};

export function getTerserConfig(): any {
  return new TerserPlugin(terserOptionsSwc);
}
