/* eslint-disable no-restricted-syntax, no-console */

import fs from 'fs';
import path from 'path';

import { context, Loader, Plugin } from 'esbuild';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';

export const pluginReplaceDirname = ({
  filter = /.*/,
  loader = 'tsx',
  rootDir = process.cwd(),
}: {
  filter?: RegExp;
  loader?: Loader;
  rootDir?: string;
}): Plugin => ({
  name: 'dk-esbuild-plugin-replace',
  setup(build) {
    const rootDirDefined = rootDir || process.cwd();
    const isWindows = process.platform.startsWith('win');
    const esc = (p: string) => (isWindows ? p.replace(/\\/g, '/') : p);

    build.onLoad({ filter }, (args) => {
      return fs.promises.readFile(args.path, 'utf-8').then((content) => {
        const contents = content
          .replace(/__dirname/g, `"${esc(path.relative(rootDirDefined, path.dirname(args.path)))}"`)
          .replace(/__filename/g, `"${esc(path.relative(rootDirDefined, args.path))}"`);

        return { loader, contents };
      });
    });
  },
});

async function watch() {
  const clientEntry = ['src/entry.tsx'];

  const ctx = await context({
    entryPoints: clientEntry,
    bundle: true,
    format: 'esm',
    publicPath: '/',
    outdir: path.resolve(__dirname, 'build'),
    write: true,
    metafile: true,
    splitting: true,
    platform: 'browser',
    target: 'es2020',
    define: {
      process: JSON.stringify({ env: { NODE_ENV: 'development' } }),
      'process.env.NODE_ENV': JSON.stringify('development'),
      PATH_SEP: JSON.stringify(path.sep),
    },
    resolveExtensions: ['.js', '.ts', '.tsx'],
    plugins: [
      pluginReplaceDirname({ filter: /\.(tsx?)$/ }),

      // https://github.com/craftamap/esbuild-plugin-html
      htmlPlugin({
        files: [
          {
            entryPoints: clientEntry,
            filename: 'index.html',
            scriptLoading: 'module',
            htmlTemplate: fs.readFileSync(path.resolve('./template.html'), 'utf-8'),
          },
        ],
      }),
    ],
  });

  await ctx.watch();

  await ctx.serve({
    port: 8000,
    servedir: path.resolve(__dirname, 'build'),
    fallback: 'build/index.html',
  });

  console.log('Dev server started on http://localhost:8000');
}

void watch();
