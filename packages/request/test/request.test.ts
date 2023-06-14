import * as t from 'ts-interface-checker';
import { expect } from 'chai';
import nock from 'nock';

import { request, errors } from '../src';

const SUCCESS_HTTP_CODE = 200;

describe('Test request', () => {
  const validators = t.createCheckers({
    request: t.iface([], { id: 'string' }),
    response: t.iface([], {
      items: t.array(
        t.iface([], {
          name: 'string',
          details: t.iface([], { isNew: 'boolean' }),
          products: t.array(
            t.iface([], {
              name: 'string',
              images: t.array(
                t.iface([], {
                  url: 'string',
                  versions: t.array(
                    t.iface([], {
                      ver: 'string',
                    })
                  ),
                })
              ),
            })
          ),
        })
      ),
    }),
  });

  const responseExpected = {
    items: [
      {
        name: 'block',
        details: { isNew: true },
        products: [
          {
            name: 'product',
            images: [
              { url: 'url', versions: [{ ver: '1' }, { ver: '2' }] },
              { url: 'url', versions: [{ ver: '1' }] },
            ],
          },
          {
            name: 'product',
            images: [
              { url: 'url', versions: [{ ver: '1' }] },
              { url: 'url', versions: [{ ver: '1' }] },
            ],
          },
        ],
      },
      {
        name: 'block',
        details: { isNew: true },
        products: [
          {
            name: 'product',
            images: [
              { url: 'url', versions: [{ ver: '1' }] },
              { url: 'url', versions: [{ ver: '1' }] },
            ],
          },
          {
            name: 'product',
            images: [
              { url: 'url', versions: [{ ver: '1' }] },
              { url: 'url', versions: [{ ver: '1' }] },
            ],
          },
        ],
      },
    ],
  };

  it('Mocked', () => {
    const data = JSON.parse(JSON.stringify(responseExpected));

    return request({
      url: 'https://google.com/api/get-items',
      mock: data,
      apiName: 'getItems',
      requestParams: { id: 'id' },
      validatorRequest: validators.request,
      validatorResponse: validators.response,
    }).then((response) => {
      expect(response).to.deep.eq(data);
    });
  });

  it('Incorrect request params', () => {
    const data = JSON.parse(JSON.stringify(responseExpected));

    return request({
      url: 'https://google.com/api/get-items',
      mock: data,
      apiName: 'getItems',
      requestParams: {},
      validatorRequest: validators.request,
      validatorResponse: validators.response,
    }).catch((error) => {
      expect(error.name).to.eq(errors.VALIDATION);
      expect(error.message).to.eq('validateRequest: request.id is missing for "getItems"');
    });
  });

  it('Success response', () => {
    const data = JSON.parse(JSON.stringify(responseExpected));

    nock('https://google.com').post('/api/get-items').reply(SUCCESS_HTTP_CODE, data);

    return request({
      url: 'https://google.com/api/get-items',
      apiName: 'getItems',
      requestParams: { id: 'id' },
      validatorRequest: validators.request,
      validatorResponse: validators.response,
    }).then((response) => {
      expect(response).to.deep.eq(responseExpected);
    });
  });

  it('Success response no validation', () => {
    const data = JSON.parse(JSON.stringify(responseExpected));

    data.items[0].name = null;

    nock('https://google.com').post('/api/get-items').reply(SUCCESS_HTTP_CODE, data);

    return request({
      url: 'https://google.com/api/get-items',
      apiName: 'getItems',
      requestParams: { id: 'id' },
      validatorRequest: validators.request,
      validatorResponse: validators.response,
      omitResponseValidation: true,
    }).then((response) => {
      expect(response).to.deep.eq(data);
    });
  });

  it('Wrong data response', () => {
    const data = JSON.parse(JSON.stringify(responseExpected));

    data.items[0].name = undefined;

    nock('https://google.com').post('/api/get-items').reply(SUCCESS_HTTP_CODE, data);

    return request({
      url: 'https://google.com/api/get-items',
      apiName: 'getItems',
      requestParams: { id: 'id' },
      validatorRequest: validators.request,
      validatorResponse: validators.response,
    }).catch((error) => {
      expect(error.name).to.eq(errors.VALIDATION);
      expect(error.message).to.eq(
        'validateResponse: response.items[0].name is missing for "getItems"'
      );
    });
  });

  it('No validators', () => {
    const data = JSON.parse(JSON.stringify(responseExpected));

    nock('https://google.com').post('/api/get-items').reply(SUCCESS_HTTP_CODE, data);

    return request({
      url: 'https://google.com/api/get-items',
      apiName: 'getItems',
      requestParams: {},
    }).then((response) => {
      expect(response).to.deep.eq(responseExpected);
    });
  });

  it('Url as function', () => {
    const data = JSON.parse(JSON.stringify(responseExpected));

    nock('https://google.com').post('/api/get-items/id').reply(SUCCESS_HTTP_CODE, data);

    return request({
      url: (requestParams) => `https://google.com/api/get-items/${requestParams.id}`,
      apiName: 'getItems',
      requestParams: { id: 'id' },
    }).then((response) => {
      expect(response).to.deep.eq(responseExpected);
    });
  });

  it('Custom headers', () => {
    const data = JSON.parse(JSON.stringify(responseExpected));

    nock('https://google.com')
      .matchHeader('some-header', 'value')
      .post('/api/get-items')
      .reply(SUCCESS_HTTP_CODE, data);

    return request({
      url: 'https://google.com/api/get-items',
      apiName: 'getItems',
      headers: { 'some-header': 'value' },
      requestParams: { id: 'id' },
    }).then((response) => {
      expect(response).to.deep.eq(responseExpected);
    });
  });
});
