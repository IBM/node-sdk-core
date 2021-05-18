module.exports = {
  root: true,
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['**/*.js', '**/*.jsx'],
      plugins: ['node', 'jest', 'prettier'],
      extends: ['airbnb-base', 'plugin:jest/recommended', 'plugin:jest/style', 'prettier'],
      rules: {
        'prefer-const': 'error',
        'prettier/prettier': 'error',
      },
    },
    {
      files: ['*.test.js', '*.test.jsx'],
      rules: {
        'global-require': 'off',
        'import/no-dynamic-require': 'off',
        'jest/no-commented-out-tests': 'off',
        'jest/no-done-callback': 'off',
        'no-plusplus': 'off',
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      env: {
        node: true,
      },
      extends: ['airbnb-typescript/base', 'prettier'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
      plugins: ['eslint-plugin-jsdoc', 'eslint-plugin-import', '@typescript-eslint', 'prettier'],
      rules: {
        '@typescript-eslint/no-use-before-define': 'off',
        'import/prefer-default-export': 'off',
        'no-else-return': 'off',
        'no-param-reassign': 'off',
        'prettier/prettier': 'error',
        'spaced-comment': ['error', 'always', { exceptions: ['*'] }],
      },
    },
  ],
};
