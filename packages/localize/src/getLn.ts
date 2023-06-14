import { errors } from './errors';
import { isPlainObject } from './utils/isPlainObject';
import { replaceDynamic } from './plugins/replaceDynamic';
import { replacePlurals } from './plugins/replacePlurals';
import { TypeMessage, TypePlugin, TypeTranslations, TypeValues } from './types';

const plugins: Array<TypePlugin> = [replaceDynamic, replacePlurals];

export function getLn(
  translationsSource: TypeTranslations,
  message: TypeMessage,
  values?: TypeValues
) {
  if (!message?.name) {
    throw new Error(`${errors.INCORRECT_MESSAGE_FORMAT}: incorrect message name`);
  }

  if (message?.defaultValue == null) {
    throw new Error(`${errors.INCORRECT_MESSAGE_FORMAT}: no message defaultValue`);
  }

  const localizedText = translationsSource?.[message.name];

  let text = localizedText == null ? message.defaultValue : localizedText;

  if (values && isPlainObject(values)) {
    plugins.forEach((plugin) => {
      text = plugin({ values, text });
    });
  }

  return text;
}
