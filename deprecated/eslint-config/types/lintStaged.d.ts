export = config;
/**
 * @docs: https://github.com/okonet/lint-staged
 *
 * Runs commands for files added to commit
 * Just simpler than creating own bash script with such recipe
 *
 */
declare const config: {
    '(*.js|*.ts|*.tsx)': string[];
    '*.scss': string[];
};
//# sourceMappingURL=lintStaged.d.ts.map