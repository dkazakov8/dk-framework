const fs = require('fs');
const path = require('path');

const downloader = require('istanbul-cobertura-badger/lib/downloader');
const esbuild = require('esbuild');
const pkg = require(`${process.cwd()}/package.json`);

const isNode = [
  'dk-bff-server',
  'dk-compare-env',
  'dk-reload-server',
  'dk-webpack-config',
  'dk-file-generator',
  'dk-webpack-parallel-simple',
].includes(pkg.name);

function bytesForHuman(bytes, decimals = 2) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  let i = 0;

  // eslint-disable-next-line no-param-reassign
  for (i; bytes > 1024; i++) bytes /= 1024;

  return `${parseFloat(bytes.toFixed(decimals))} ${units[i]}`;
}

function getPrevSize() {
  let prevSize = 'unknown';

  if (fs.existsSync(path.resolve(process.cwd(), 'size.svg'))) {
    const sizeContents = fs.readFileSync(path.resolve(process.cwd(), 'size.svg'), 'utf-8');
    prevSize = sizeContents.match(/Size [^:]+: ([a-zA-Z0-9\s.]+)/)?.[1] || 'unknown';
  }

  return prevSize;
}

function saveSizeLog(prevSize, size) {
  const sizeResult = fs.existsSync(path.resolve(__dirname, 'sizeResult.json'))
    ? JSON.parse(fs.readFileSync(path.resolve(__dirname, 'sizeResult.json'), 'utf-8'))
    : [];

  const changeMessage =
    size === prevSize
      ? `(unchanged) Size of ${pkg.name} ${prevSize}`
      : `(changed) Size of ${pkg.name} changed from ${prevSize} to ${size}`;

  sizeResult.push(changeMessage);
  sizeResult.sort();

  fs.writeFileSync(path.resolve(__dirname, 'sizeResult.json'), JSON.stringify(sizeResult, null, 2));
}

function afterBuild(result) {
  const size = bytesForHuman(
    result.metafile.outputs[
      pkg.name === 'dk-webpack-parallel-simple' ? pkg.main : pkg.exports.import.replace('./', '')
    ].bytes
  );
  const prevSize = getPrevSize();

  setTimeout(() => saveSizeLog(prevSize, size), 1);

  return new Promise((resolve, reject) => {
    if (size !== prevSize) {
      downloader(
        `https://img.shields.io/badge/Size (minified ${isNode ? 'no deps' : 'with deps'})-${size}-blue`,
        path.resolve(process.cwd(), './size.svg'),
        function handleError(err, downloadResult) {
          if (err) console.error(err);

          resolve();
        }
      );
    } else {
      resolve();
    }
  });
}

const buildConfig = {
  entryPoints: [path.resolve(process.cwd(), 'src')],
  bundle: true,
  format: 'esm',
  outfile: path.resolve(process.cwd(), pkg.exports?.import || pkg.main),
  write: true,
  minify: false,
  metafile: false,
  sourcemap: true,
  treeShaking: true,
  target: isNode ? 'node18' : 'es2022',
  packages: 'external',
  tsconfig: `${process.cwd()}/tsconfig-compile.json`,
  external: Object.keys(pkg.peerDependencies || {}),
};

return Promise.resolve()
  .then(() => {
    if (!pkg.exports?.import) return Promise.resolve();

    return Promise.all([
      esbuild.build(buildConfig),
      esbuild.build({
        ...buildConfig,
        format: 'cjs',
        target: 'node18',
        outfile: path.resolve(process.cwd(), pkg.exports.require),
      }),
    ]);
  })
  .then(() =>
    esbuild.build({
      ...buildConfig,
      entryPoints: [path.resolve(process.cwd(), pkg.exports?.import || pkg.main)],
      format: 'cjs',
      write: false,
      minify: true,
      metafile: true,
      sourcemap: false,
      packages: isNode ? 'external' : undefined,
    })
  )
  .then(afterBuild);
