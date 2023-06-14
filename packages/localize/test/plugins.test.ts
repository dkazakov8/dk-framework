/* eslint-disable @typescript-eslint/no-magic-numbers */

import { expect } from 'chai';

import { isPlainObject } from '../src/utils/isPlainObject';
import { replaceDynamic } from '../src/plugins/replaceDynamic';
import { replacePlurals } from '../src/plugins/replacePlurals';

describe('replace dynamic params', () => {
  it('dynamic params are replaced', () => {
    const result = replaceDynamic({
      values: { value1: 'some string', value2: 123, value3: 'another string' },
      text: '{value1} {value2} {value3}',
    });

    expect(result).to.eq('some string 123 another string');
  });

  it('multiple dynamic param is replaced', () => {
    const result = replaceDynamic({
      values: { value: 123 },
      text: '{value} {value} {value}',
    });

    expect(result).to.eq('123 123 123');
  });

  it('absent dynamic params are not replaced', () => {
    const result = replaceDynamic({
      values: { value2: 123, value3: 'another string' },
      text: '{value1} {value2} {value3}',
    });

    expect(result).to.eq('{value1} 123 another string');
  });

  it('null dynamic params are not replaced', () => {
    const result = replaceDynamic({
      // @ts-ignore
      values: { value1: null, value2: 0, value3: '' },
      text: '{value1} {value2} {value3}',
    });

    expect(result).to.eq('{value1} 0 ');
  });
});

describe('replace plurals', () => {
  it('plurals are replaced', () => {
    expect(
      replacePlurals({
        values: { value: 0 },
        text: '{value: item,items}',
      })
    ).to.eq('items');
    expect(
      replacePlurals({
        values: { value: 1 },
        text: '{value: item,items}',
      })
    ).to.eq('item');
    expect(
      replacePlurals({
        values: { value: 2 },
        text: '{value: item,items}',
      })
    ).to.eq('items');
  });

  it('multiple plurals are replaced', () => {
    expect(
      replacePlurals({
        values: { value: 0 },
        text: '{value: item,items} {value: item,items}',
      })
    ).to.eq('items items');
    expect(
      replacePlurals({
        values: { value1: 0, value2: 1 },
        text: '{value1: item,items} {value2: item,items}',
      })
    ).to.eq('items item');
  });

  it('empty plurals are not replaced', () => {
    expect(
      replacePlurals({
        values: { value1: 0 },
        text: '{value1: item,items} {value2: item,items}',
      })
    ).to.eq('items {value2: item,items}');
  });

  it('null plurals are not replaced', () => {
    expect(
      replacePlurals({
        // @ts-ignore
        values: { value1: 0, value2: null },
        text: '{value1: item,items} {value2: item,items}',
      })
    ).to.eq('items {value2: item,items}');
  });
});

describe('replace plurals and dynamic', () => {
  it('complex test', () => {
    const values = {
      value1: 'some string',
      value2: 123,
      value3: 'another string',
      value4: 0,
      value5: 1,
    };

    const replacedDynamic = replaceDynamic({
      values,
      text: 'value1 {value1} {value2: item,items} {value2} {value3} {value4} {value5} {value4: item,items} {value5: item,items} {value4: item,items}',
    });
    const replacedPlurals = replacePlurals({ values, text: replacedDynamic });

    expect(replacedPlurals).to.eq(
      'value1 some string items 123 another string 0 1 items item items'
    );
  });
});

describe('isPlainObject', () => {
  it('should return `true` if the object is created by the `Object` constructor', () => {
    expect(isPlainObject(Object.create({}))).to.equal(true);
    expect(isPlainObject(Object.create(Object.prototype))).to.equal(true);
    expect(isPlainObject({ foo: 'bar' })).to.equal(true);
    expect(isPlainObject({})).to.equal(true);
    expect(isPlainObject(Object.create(null))).to.equal(true);
  });

  it('should return `false` if the object is not created by the `Object` constructor', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    function Foo() {
      // @ts-ignore
      this.abc = {};
    }

    expect(!isPlainObject(/foo/)).to.equal(true);
    // eslint-disable-next-line func-names,@typescript-eslint/no-empty-function
    expect(!isPlainObject(function () {})).to.equal(true);
    expect(!isPlainObject(1)).to.equal(true);
    expect(!isPlainObject(['foo', 'bar'])).to.equal(true);
    expect(!isPlainObject([])).to.equal(true);
    // @ts-ignore
    expect(!isPlainObject(new Foo())).to.equal(true);
    expect(!isPlainObject(null)).to.equal(true);
  });
});
