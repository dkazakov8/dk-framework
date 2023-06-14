// Fix ERR_OSSL_EVP_UNSUPPORTED
const path = require('path');
const crypto = require('crypto');
const crypto_orig_createHash = crypto.createHash;
crypto.createHash = (algorithm) =>
  crypto_orig_createHash(algorithm === 'md4' ? 'sha256' : algorithm);

module.exports = {
  name: 'config2',
  mode: 'production',
  entry: path.resolve(__dirname, './entry2.js'),
  output: {
    path: path.resolve(__dirname, '../../tmp'),
    filename: 'entry2.bundle.js',
  },
  devtool: false,
  stats: {
    colors: true,
    errors: true,
    errorDetails: true,

    env: false,
    all: false,
    hash: false,
    depth: false,
    assets: false,
    cached: false,
    chunks: false,
    source: false,
    builtAt: false,
    modules: false,
    reasons: false,
    version: false,
    timings: false,
    children: false,
    warnings: false,
    publicPath: false,
    chunkGroups: false,
    entrypoints: false,
    performance: false,
    moduleTrace: false,
    usedExports: false,
    cachedAssets: false,
    chunkOrigins: false,
    chunkModules: false,
    providedExports: false,
  },
  performance: {
    hints: false,
  },
};
