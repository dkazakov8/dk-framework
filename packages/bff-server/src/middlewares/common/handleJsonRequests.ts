import bodyParser from 'body-parser';

import { TypeMiddleware } from '../../types';

export const handleJsonRequests: TypeMiddleware = (app) => {
  app.use(bodyParser.json());
};
