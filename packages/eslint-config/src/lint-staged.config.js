/**
 * @docs: https://github.com/okonet/lint-staged
 *
 * Runs commands for files added to commit
 * Just simpler than creating own bash script with such recipe
 *
 */

const config = {
  '(*.js|*.ts|*.tsx)': ['yarn format:js'],
  '*.scss': ['yarn format:style'],
};

module.exports = config;
