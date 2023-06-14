import compression from 'compression';

import { TypeMiddleware } from '../../types';

/**
 * @docs: https://github.com/expressjs/compression
 *
 */

export const handleCompression: TypeMiddleware = (app) => {
  app.use(compression());
};
