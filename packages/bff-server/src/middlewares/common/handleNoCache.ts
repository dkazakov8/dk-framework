import nocache from 'nocache';

import { TypeMiddleware } from '../../types';

export const handleNoCache: TypeMiddleware = (app) => {
  app.use(nocache());
  app.set('etag', false);
};
