import { TypeMiddleware } from '../../types';
import { errorCodes, errorsNames, createError } from '../../utils';

export const handleMissingRoutes: TypeMiddleware = (app) => {
  app.use('*', (req, res) => {
    const error = createError(
      errorsNames.NOT_FOUND,
      `Route ${req.method} ${req.originalUrl} was not found`
    );

    console.error(error);

    res.status(errorCodes.NOT_FOUND).send({
      errorName: error.name,
      errorMessage: error.message,
    });
  });
};
