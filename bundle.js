const fs = require('fs');
const path = require('path');

const downloader = require('istanbul-cobertura-badger/lib/downloader');
const esbuild = require('esbuild');
const pkg = require(`${process.cwd()}/package.json`);
const { BuildOptions } = require('esbuild');
const folderName = process.cwd().split(path.sep).pop();

const isNode = [
  'bff-server',
  'compare-env',
  'reload-server',
  'webpack-config',
  'file-generator',
  'webpack-parallel-simple',
].includes(folderName);

function bytesForHuman(bytes, decimals = 2) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  let i = 0;

  // eslint-disable-next-line no-param-reassign
  for (i; bytes > 1024; i++) bytes /= 1024;

  return `${parseFloat(bytes.toFixed(decimals))} ${units[i]}`;
}

function afterBuild(result) {
  const size = bytesForHuman(result.metafile.outputs['dist/index.js'].bytes);
  let prevSize = 'unknown';

  if (fs.existsSync(path.resolve(process.cwd(), 'size.svg'))) {
    const sizeContents = fs.readFileSync(path.resolve(process.cwd(), 'size.svg'), 'utf-8');
    prevSize = sizeContents.match(/Size \(minified\): ([a-zA-Z0-9\s.]+)/)?.[1] || 'unknown';
  }

  const sizeResult = fs.existsSync(path.resolve(__dirname, 'sizeResult.json'))
    ? JSON.parse(fs.readFileSync(path.resolve(__dirname, 'sizeResult.json'), 'utf-8'))
    : [];

  const changeMessage =
    size === prevSize
      ? `(unchanged) Size of ${pkg.name} ${prevSize}`
      : `(changed) Size of ${pkg.name} changed from ${prevSize} to ${size}`;

  sizeResult.push(changeMessage);

  fs.writeFileSync(path.resolve(__dirname, 'sizeResult.json'), JSON.stringify(sizeResult, null, 2));

  downloader(
    `https://img.shields.io/badge/Size (minified)-${size}-blue`,
    path.resolve(process.cwd(), './size.svg'),
    function handleError(err, downloadResult) {
      if (err) console.error(err);
    }
  );
}

const buildConfig = {
  entryPoints: [path.resolve(process.cwd(), 'src')],
  bundle: true,
  format: 'cjs',
  outfile: path.resolve(process.cwd(), 'dist/index.js'),
  write: true,
  minify: false,
  metafile: false,
  sourcemap: true,
  target: isNode ? 'node18' : 'es2019',
  packages: 'external',
  tsconfig: `${process.cwd()}/tsconfig-compile.json`,
  external: Object.keys(pkg.peerDependencies || {}),
};

if (['react-mobx-router'].includes(folderName)) {
  void esbuild
    .build(buildConfig)
    .then(() =>
      esbuild.build(
        Object.assign({}, buildConfig, {
          write: false,
          minify: true,
          metafile: true,
          sourcemap: false,
          packages: isNode ? 'external' : undefined,
        })
      )
    )
    .then(afterBuild);
} else {
  void esbuild
    .build(
      Object.assign({}, buildConfig, {
        write: false,
        minify: true,
        metafile: true,
        sourcemap: false,
        entryPoints: [path.resolve(process.cwd(), pkg.main)],
        packages: isNode ? 'external' : undefined,
      })
    )
    .then(afterBuild);
}
