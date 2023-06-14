import { errors } from './errors';
import { compareEnvByMatrix } from './compareEnvByMatrix';
import { checkFilesExistence } from './checkFilesExistence';
import { generateConfigFromEnv } from './generateConfigFromEnv';
import { compareParsed } from './compareParsed';
import { generateComparisonMatrix } from './generateComparisonMatrix';

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
