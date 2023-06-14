import { errors } from './errors';
import { TypeMessage } from './types';
import { isPlainObject } from './utils/isPlainObject';

export function wrapMessages<T>(dirname: string, obj: T): Record<keyof T, TypeMessage> {
  if (typeof dirname !== 'string' || !dirname) {
    throw new Error(`${errors.INCORRECT_DIRNAME}: dirname is not a string or empty`);
  }

  if (!obj || !isPlainObject(obj)) {
    throw new Error(`${errors.INCORRECT_MESSAGES_OBJECT}: wrapMessages needs an object`);
  }

  const messages: Record<keyof T, TypeMessage> = {} as any;
  const dirnameNormalized = dirname.toLowerCase().replace(/\\/g, '/');

  // eslint-disable-next-line guard-for-in
  for (const key in obj) {
    // @ts-ignore
    messages[key] = {
      name: `${dirnameNormalized}__${key}`,
      defaultValue: obj[key],
    };
  }

  return messages;
}
