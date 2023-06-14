export const prettierRules: {
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
export const getEslintConfig: typeof import("./eslint.config");
export const stylelintConfig: {
    extends: string[];
    customSyntax: string;
};
export const lintStagedConfig: {
    '(*.js|*.ts|*.tsx)': string[];
    '*.scss': string[];
};
//# sourceMappingURL=index.d.ts.map