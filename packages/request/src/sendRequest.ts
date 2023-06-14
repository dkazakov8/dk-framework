import axios from 'axios';

import { TypeRequestParams } from './types/TypeRequestParams';
import { downloadBlobAsFile } from './utils/downloadBlobAsFile';

export function sendRequest({
  url,
  mock,
  method,
  headers,
  requestParams,
  disableCredentials,
  downloadFileNameGetter,
  afterRequestInterceptor,
}: TypeRequestParams) {
  if (mock) return Promise.resolve(mock);

  const { formData, downloadAsFile, ...requestParamsCleared } = requestParams;

  const urlCleared = typeof url === 'function' ? url(requestParams) : url;

  Object.keys(requestParamsCleared).forEach((key) => {
    if (key.includes('omit_')) delete requestParamsCleared[key];
  });

  return axios({
    url: urlCleared,
    [method === 'GET' ? 'params' : 'data']: formData || requestParamsCleared,
    method: method || 'POST',
    headers,
    responseType: downloadAsFile ? 'blob' : undefined,
    withCredentials: !disableCredentials,
  }).then((response) => {
    if (downloadAsFile) {
      downloadBlobAsFile(response.data as Blob, downloadFileNameGetter?.(response) || 'result');
    }

    if (afterRequestInterceptor) {
      return afterRequestInterceptor(response).then(() => response.data);
    }

    return response.data;
  });
}
