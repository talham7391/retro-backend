module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'airbnb-typescript/base',
    ],
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        "no-underscore-dangle": [
            "error",
            {
                "allow": ["_id"],
            },
        ],
    },
};
