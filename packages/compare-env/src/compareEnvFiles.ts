import { checkFilesExistence } from './checkFilesExistence';
import { compareEnvByMatrix } from './compareEnvByMatrix';
import { compareParsed } from './compareParsed';
import { errors } from './errors';
import { generateComparisonMatrix } from './generateComparisonMatrix';
import { generateConfigFromEnv } from './generateConfigFromEnv';

export function compareEnvFiles({
  paths,
  parsedEnvKeys,
}: {
  paths: Array<string>;
  parsedEnvKeys?: Array<string>;
}) {
  if (paths.length === 0 && parsedEnvKeys == null) return;

  if (paths.length === 0 && parsedEnvKeys?.length) {
    throw new Error(
      `${errors.WRONG_INPUT}: paths are empty, but parsedEnvKeys is not. Pass some .env files`
    );
  }

  checkFilesExistence({ paths });

  const envConfigs = generateConfigFromEnv({ paths });
  const matrix = generateComparisonMatrix({ envConfigs });

  compareEnvByMatrix({ envConfigs, matrix });
  compareParsed({ envConfigs, parsedEnvKeys });
}
