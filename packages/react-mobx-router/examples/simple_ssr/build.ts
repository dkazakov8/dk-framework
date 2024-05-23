/* eslint-disable no-restricted-syntax, no-console */

import fs from 'fs';
import path from 'path';

import betterSpawn from 'better-spawn';
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
  const clientEntry = ['src/client.tsx'];

  const ctxClient = await context({
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

  const ctxServer = await context({
    entryPoints: ['src/server.tsx'],
    bundle: true,
    write: true,
    metafile: true,
    treeShaking: true,
    sourcemap: false,
    outdir: path.resolve(__dirname, 'build'),
    platform: 'node',
    packages: 'external',
    target: 'node18',
    define: {
      'process.env.NODE_ENV': JSON.stringify('development'),
      PATH_SEP: JSON.stringify(path.sep),
    },
    resolveExtensions: ['.js', '.ts', '.tsx'],
    plugins: [pluginReplaceDirname({ filter: /\.(tsx?)$/ })],
  });

  await Promise.all([ctxClient.watch(), ctxServer.watch()]);

  const serverProcess = betterSpawn('node-dev --no-warnings --notify=false ./build/server.js', {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  serverProcess.stdout?.on('data', (msg: Buffer) => {
    // eslint-disable-next-line no-console
    console.log(msg.toString().trim());
  });
  serverProcess.stderr?.on('data', (msg: Buffer) => console.error(msg.toString().trim()));

  const watchProcess = betterSpawn('tsx ./src/watchServer.ts', {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  watchProcess.stdout?.on('data', (msg: Buffer) => {
    // eslint-disable-next-line no-console
    console.log(msg.toString().trim());
  });
  watchProcess.stderr?.on('data', (msg: Buffer) => console.error(msg.toString().trim()));

  process.on('exit', () => {
    if (serverProcess) serverProcess.close();
    if (watchProcess) watchProcess.close();

    void ctxClient?.dispose();
    void ctxServer?.dispose();
  });

  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

void watch();
