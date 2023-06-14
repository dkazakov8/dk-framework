import { Checker } from 'ts-interface-checker';
import { TypeLogger } from 'dk-checker-remove-extraneous';
import { AxiosResponse } from 'axios';

import { TypeUrl } from './TypeUrl';
import { TypeHeaders } from './TypeHeaders';

export type TypeResponse = any;

export type TypeRequestParams = {
  url: TypeUrl;
  apiName: string;
  requestParams: Record<string, any> & { formData?: any; downloadAsFile?: boolean };

  mock?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: TypeHeaders;
  extraneousLogger?: TypeLogger;
  validatorRequest?: Checker;
  validatorResponse?: Checker;
  disableCredentials?: boolean;
  omitResponseValidation?: boolean;
  downloadFileNameGetter?: (response: AxiosResponse) => string;
  afterRequestInterceptor?: (response: AxiosResponse) => Promise<void>;
};
