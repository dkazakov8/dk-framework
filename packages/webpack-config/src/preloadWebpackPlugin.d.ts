/**
 * Basic types, check docs for usage
 *
 */

declare module 'preload-webpack-plugin' {
  class Plugin {
    constructor(options?: {
      rel: 'preload';
      include: 'allAssets';
      fileWhitelist: Array<any>;
      as: (filePath: string) => string;
    });
    apply: any;
  }

  // eslint-disable-next-line import/no-default-export,import/no-unused-modules
  export default Plugin;
}
