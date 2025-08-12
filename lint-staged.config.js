/**
 * @docs: https://github.com/okonet/lint-staged
 *
 * Runs commands for files added to commit
 * Just simpler than creating own bash script with such recipe
 *
 */

// biome-ignore lint/style/noCommonJs: false
module.exports = {
  '(*.js|*.ts|*.tsx|*.mjs)': ['pnpm run format:js'],
};
