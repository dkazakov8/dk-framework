import { Application, Request, Response } from 'express';
import helmet from 'helmet';

import { TypeMeasures } from './utils';

export type TypeRunServerParams = {
  port: number;
  templatePath: string;
  helmetOptions: Parameters<typeof helmet>[0];
  staticFilesPath: string;
  versionIdentifier: string;

  https?: boolean;
  customSsl?: { key: any; cert: any };
  injectMeasures?: (params: { template: string; measures: TypeMeasures }) => string;
  template500Path?: string;
  maxAgeForStatic?: string | number;
  templateModifier?: (params: { template: string; req: Request; res: Response }) => Promise<string>;
  customMiddlewares?: Array<TypeMiddleware>;
  customFileMiddlewares?: Array<TypeMiddleware>;
  compressedFilesGenerated?: boolean;
};

export type TypeMiddleware = (app: Application, params: TypeRunServerParams) => void;
