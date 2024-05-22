export let prettierRules: {
    semi: boolean;
    tabWidth: number;
    proseWrap: string;
    printWidth: number;
    arrowParens: string;
    singleQuote: boolean;
    trailingComma: string;
    bracketSpacing: boolean;
    bracketSameLine: boolean;
};
export let getEslintConfig: typeof import("./eslint.config");
export let stylelintConfig: {
    extends: string[];
    customSyntax: string;
};
export let lintStagedConfig: {
    '(*.js|*.ts|*.tsx)': string[];
    '*.scss': string[];
};
//# sourceMappingURL=index.d.ts.map