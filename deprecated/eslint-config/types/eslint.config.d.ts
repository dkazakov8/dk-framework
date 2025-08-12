export = getConfig;
declare function getConfig(options: any): {
    env: {
        node: boolean;
        browser: boolean;
    };
    parser: string;
    extends: any[];
    plugins: string[];
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': string[];
        };
        'import/resolver': {
            typescript: {
                alwaysTryTypes: boolean;
                project: any;
            };
        } | undefined;
    };
    parserOptions: {
        sourceType: string;
        ecmaVersion: number;
    };
    overrides: {
        files: string[];
        extends: any[];
        parserOptions: {
            project: any[];
        };
    }[] | undefined;
};
//# sourceMappingURL=eslint.config.d.ts.map