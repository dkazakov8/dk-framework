import _ from 'lodash';
import * as t from 'ts-interface-checker';
import { expect } from 'chai';

import { removeExtraneousParams } from '../src';

describe('Test removeExtraneousParams', () => {
  const validators = t.createCheckers({
    model: t.iface([], {
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

  const resultExpected = {
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
              { url: 'url', versions: [{ ver: '1' }] },
              { url: 'url', versions: [{ ver: '1' }] },
              { url: 'url', versions: [{ ver: '1' }] },
              { url: 'url', versions: [{ ver: '1' }] },
              { url: 'url', versions: [{ ver: '1' }] },
              { url: 'url', versions: [{ ver: '1' }] },
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

  it('No params omit', () => {
    const data = _.cloneDeep(resultExpected);

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit first level params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, 'extraneousParam', 'test');
    _.set(data, 'extraneousParam2', 'test');

    removeExtraneousParams({
      data,
      validators: validators.model,
      logger: ({ extraneousPaths }) => {
        console.warn(`Omitted extraneous\n${JSON.stringify(extraneousPaths, null, 2)}`);
      },
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit first level object params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, 'items[0].details.someParam', 'someParam');
    _.set(data, 'items[1].details.someParam', 'someParam');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit first level array params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, 'items[0].value', 'some color');
    _.set(data, 'items[0].id', 'some id');
    _.set(data, 'items[1].color', 'some color');
    _.set(data, 'items[1].id', 'some id');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit second level array params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, 'items[0].products[0].color', 'some color');
    _.set(data, 'items[0].products[0].id', 'some id');
    _.set(data, 'items[0].products[1].color', 'some color');
    _.set(data, 'items[0].products[1].id', 'some id');

    _.set(data, 'items[1].products[0].color', 'some color');
    _.set(data, 'items[1].products[0].id', 'some id');
    _.set(data, 'items[1].products[1].color', 'some color');
    _.set(data, 'items[1].products[1].id', 'some id');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit third level array params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, 'items[0].products[0].images[0].link', 'some link');
    _.set(data, 'items[0].products[0].images[1].link', 'some link');
    _.set(data, 'items[0].products[1].images[0].link', 'some link');
    _.set(data, 'items[0].products[1].images[1].link', 'some link');

    _.set(data, 'items[1].products[0].images[0].link', 'some link');
    _.set(data, 'items[1].products[0].images[1].link', 'some link');
    _.set(data, 'items[1].products[1].images[0].link', 'some link');
    _.set(data, 'items[1].products[1].images[1].link', 'some link');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit fourth level array params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, 'items[0].products[0].images[0].versions[0].link', 'some link');
    _.set(data, 'items[0].products[0].images[0].versions[1].link', 'some link');
    _.set(data, 'items[0].products[0].images[1].versions[0].link', 'some link');

    _.set(data, 'items[1].products[0].images[1].versions[0].link', 'some link');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });
});

describe('Test removeExtraneousParams array', () => {
  const validators = t.createCheckers({
    model: t.array(
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
  });

  const resultExpected = [
    {
      name: 'block',
      details: { isNew: true },
      products: [
        {
          name: 'product',
          images: [
            { url: 'url', versions: [{ ver: '1' }, { ver: '2' }] },
            { url: 'url', versions: [{ ver: '1' }] },
            { url: 'url', versions: [{ ver: '1' }] },
            { url: 'url', versions: [{ ver: '1' }] },
            { url: 'url', versions: [{ ver: '1' }] },
            { url: 'url', versions: [{ ver: '1' }] },
            { url: 'url', versions: [{ ver: '1' }] },
            { url: 'url', versions: [{ ver: '1' }] },
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
  ];

  it('No params omit', () => {
    const data = _.cloneDeep(resultExpected);

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit first level params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, '[0]extraneousParam', 'test');
    _.set(data, '[0]extraneousParam2', 'test');

    removeExtraneousParams({
      data,
      validators: validators.model,
      logger: ({ extraneousPaths }) => {
        console.warn(`Omitted extraneous\n${JSON.stringify(extraneousPaths, null, 2)}`);
      },
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit first level object params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, '[0].details.someParam', 'someParam');
    _.set(data, '[1].details.someParam', 'someParam');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit first level array params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, '[0].color', 'some color');
    _.set(data, '[0].id', 'some id');
    _.set(data, '[1].color', 'some color');
    _.set(data, '[1].id', 'some id');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit second level array params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, '[0].products[0].color', 'some color');
    _.set(data, '[0].products[0].id', 'some id');
    _.set(data, '[0].products[1].color', 'some color');
    _.set(data, '[0].products[1].id', 'some id');

    _.set(data, '[1].products[0].color', 'some color');
    _.set(data, '[1].products[0].id', 'some id');
    _.set(data, '[1].products[1].color', 'some color');
    _.set(data, '[1].products[1].id', 'some id');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit third level array params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, '[0].products[0].images[0].link', 'some link');
    _.set(data, '[0].products[0].images[1].link', 'some link');
    _.set(data, '[0].products[1].images[0].link', 'some link');
    _.set(data, '[0].products[1].images[1].link', 'some link');

    _.set(data, '[1].products[0].images[0].link', 'some link');
    _.set(data, '[1].products[0].images[1].link', 'some link');
    _.set(data, '[1].products[1].images[0].link', 'some link');
    _.set(data, '[1].products[1].images[1].link', 'some link');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });

  it('Omit fourth level array params', () => {
    const data = _.cloneDeep(resultExpected);

    _.set(data, '[0].products[0].images[0].versions[0].link', 'some link');
    _.set(data, '[0].products[0].images[0].versions[1].link', 'some link');
    _.set(data, '[0].products[0].images[1].versions[0].link', 'some link');

    _.set(data, '[1].products[0].images[1].versions[0].link', 'some link');

    removeExtraneousParams({
      data,
      validators: validators.model,
    });

    expect(data).to.deep.eq(resultExpected);
  });
});
