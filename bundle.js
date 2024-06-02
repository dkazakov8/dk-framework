const fs = require('fs');
const path = require('path');

const downloader = require('istanbul-cobertura-badger/lib/downloader');
const esbuild = require('esbuild');

const pkg = require(`${process.cwd()}/package.json`);
// const tsconfig = require(`${process.cwd()}/tsconfig-compile.json`);

const isNode = [
  'bff-server',
  'compare-env',
  'reload-server',
  'webpack-config',
  'file-generator',
  'webpack-parallel-simple',
].includes(process.cwd().split(path.sep).pop());

function bytesForHuman(bytes, decimals = 2) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  let i = 0;

  // eslint-disable-next-line no-param-reassign
  for (i; bytes > 1024; i++) bytes /= 1024;

  return `${parseFloat(bytes.toFixed(decimals))} ${units[i]}`;
}

return esbuild
  .build({
    entryPoints: [path.resolve(process.cwd(), pkg.main)],
    bundle: true,
    outfile: 'out.js',
    minify: true,
    metafile: true,
    write: false,
    target: isNode ? 'node18' : 'es2015',
    packages: isNode ? 'external' : undefined,
    // tsconfig: JSON.stringify(tsconfig),
    external: Object.keys(pkg.peerDependencies || {}),
  })
  .then((result) => {
    const size = bytesForHuman(result.metafile.outputs['out.js'].bytes);

    downloader(
      `https://img.shields.io/badge/Size (minified)-${size}-blue`,
      path.resolve(process.cwd(), './size.svg'),
      function handleError(err, downloadResult) {
        //  if (err) console.error(err);
      }
    );
  });
