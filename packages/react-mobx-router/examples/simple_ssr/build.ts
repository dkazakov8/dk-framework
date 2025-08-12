/* eslint-disable no-restricted-syntax, no-console */

import fs from 'node:fs';
import path from 'node:path';

import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
// @ts-ignore
import betterSpawn from 'better-spawn';
import { runManual } from 'dk-reload-server';
import { BuildOptions, context, Loader, Plugin } from 'esbuild';

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

export const createPluginParallel = (callback: () => void) => {
  const activeProcesses = new Set<string>();
  let callbackTimeout: ReturnType<typeof setTimeout>;

  return function pluginParallel(params: { name: string }): Plugin {
    return {
      name: 'plugin-parallel',
      setup(build) {
        build.onStart(() => {
          clearTimeout(callbackTimeout);
          activeProcesses.add(params.name);
        });
        build.onEnd(() => {
          activeProcesses.delete(params.name);

          clearTimeout(callbackTimeout);
          if (activeProcesses.size === 0)
            callbackTimeout = setTimeout(() => {
              callback();
              // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 200);
        });
      },
    };
  };
};

async function watch() {
  const { sendReloadSignal } = runManual({
    port: 8001,
    watchPaths: [path.resolve(__dirname, './build')],
  });
  const pluginParallel = createPluginParallel(sendReloadSignal);

  const configServer: BuildOptions = {
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
    plugins: [pluginReplaceDirname({ filter: /\.(tsx?)$/ }), pluginParallel({ name: 'server' })],
  };

  const configClient: BuildOptions = {
    ...configServer,
    entryPoints: ['src/client.tsx'],
    outdir: path.resolve(__dirname, 'build/public'),
    format: 'esm',
    publicPath: '/',
    splitting: true,
    platform: 'browser',
    target: 'es2020',
    packages: undefined,
    plugins: [
      pluginReplaceDirname({ filter: /\.(tsx?)$/ }),
      pluginParallel({ name: 'client' }),
      // https://github.com/craftamap/esbuild-plugin-html
      // @ts-ignore
      htmlPlugin({
        files: [
          {
            entryPoints: ['src/client.tsx'],
            filename: 'template.html',
            scriptLoading: 'module',
            htmlTemplate: fs.readFileSync(path.resolve('./template.html'), 'utf-8'),
          },
        ],
      }),
    ],
  };

  const ctxClient = await context(configClient);
  const ctxServer = await context(configServer);

  await Promise.all([ctxClient.watch(), ctxServer.watch()]);

  const serverProcess = betterSpawn('node-dev --no-warnings --notify=false ./build/server.js', {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  serverProcess.stdout?.on('data', (msg: Buffer) => {
    // eslint-disable-next-line no-console
    console.log(msg.toString().trim());
  });
  serverProcess.stderr?.on('data', (msg: Buffer) => console.error(msg.toString().trim()));

  process.on('exit', () => serverProcess?.close());
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

void watch();
