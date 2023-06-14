// Fix ERR_OSSL_EVP_UNSUPPORTED
import path from 'path';
import crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/naming-convention
const crypto_orig_createHash = crypto.createHash;
crypto.createHash = (algorithm) =>
  crypto_orig_createHash(algorithm === 'md4' ? 'sha256' : algorithm);

module.exports = {
  name: 'config1',
  mode: 'production',
  entry: path.resolve(__dirname, './entry1.ts'),
  output: {
    path: path.resolve(__dirname, '../../tmp'),
    filename: 'entry1.bundle.js',
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
