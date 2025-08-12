import { AxiosResponse } from 'axios';
import { TypeLogger } from 'dk-checker-remove-extraneous';
import { Checker } from 'ts-interface-checker';

import { TypeHeaders } from './TypeHeaders';
import { TypeUrl } from './TypeUrl';

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
