import helmet from 'helmet';

import { TypeMiddleware } from '../../types';

/**
 * @docs: https://github.com/helmetjs/helmet
 * @docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
 */

export const handleProtectionHeaders: TypeMiddleware = (app, { helmetOptions }) => {
  app.use(helmet(helmetOptions));
};
