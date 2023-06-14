import { TypeEnvConfig } from './types';
import { errors } from './errors';
import { arrayDifference } from './arrayDifference';

export function compareParsed({
  envConfigs,
  parsedEnvKeys,
}: {
  envConfigs: Array<TypeEnvConfig>;
  parsedEnvKeys?: Array<string>;
}) {
  if (!parsedEnvKeys) return;

  envConfigs.forEach(({ keys, fileName }) => {
    const diff = arrayDifference(keys, parsedEnvKeys);

    if (diff.length > 0) {
      throw new Error(
        `${
          errors.PARSED_INTERSECTION_FAILED
        }: ${fileName} & parsedEnvKeys have different keys: ${diff.join(', ')}`
      );
    }
  });
}
