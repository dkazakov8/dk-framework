import { TypePlugin } from '../types';
import { getTypedEntries } from '../utils/getTypedEntries';

export const replacePlurals: TypePlugin = ({ values, text }) => {
  let textWithPlurals = text;

  getTypedEntries(values).forEach(([paramName, value]) => {
    if (value == null) return;

    textWithPlurals = textWithPlurals.replace(
      new RegExp(`{${paramName}:\\s([a-zA-Z0-9]+),([a-zA-Z0-9]+)}`, 'g'),
      value === 1 ? '$1' : '$2'
    );
  });

  return textWithPlurals;
};
