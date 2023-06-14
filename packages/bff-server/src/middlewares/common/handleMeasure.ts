import { createMeasure } from '../../utils/createMeasure';
import { measuresServer } from '../../utils/measuresServer';
import { TypeMiddleware } from '../../types';

export const handleMeasure: TypeMiddleware = (app) => {
  app.use((req, res, next) => {
    const reqExtended: typeof req & { measure: ReturnType<typeof createMeasure> } = req as any;

    reqExtended.measure = createMeasure();

    return Promise.resolve()
      .then(reqExtended.measure.wrap(measuresServer.FULL_TIME))
      .then(reqExtended.measure.wrap(measuresServer.MIDDLEWARES))
      .then(() => next());
  });
};
