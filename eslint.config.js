/* eslint-disable @typescript-eslint/no-require-imports */
const parser = require('@typescript-eslint/parser');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs['recommended-flat'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: parser,
      globals: { require: true, module: true, browser: true }
    },
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'prefer-const': 'warn',
      'no-unused-vars': 'warn',

      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      '@stylistic/semi': ['warn', 'always'],
      '@stylistic/eol-last': 'warn',
      '@stylistic/no-multiple-empty-lines': 'warn',
      '@stylistic/no-trailing-spaces': 'warn',
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      '@stylistic/object-curly-newline': 'warn',
      '@stylistic/indent': ['warn', 2, { ignoredNodes: ['ConditionalExpression'], SwitchCase: 1 }],
      '@stylistic/brace-style': ['warn', 'stroustrup', { allowSingleLine: true }],
      '@stylistic/type-annotation-spacing': 'warn',
      '@stylistic/comma-dangle': ['warn', 'never'],
      '@stylistic/no-multi-spaces': ['off'],
      '@stylistic/spaced-comment': ['off'],
      '@stylistic/key-spacing': ['warn', { mode: 'minimum' }],
      '@stylistic/member-delimiter-style': ['warn', {
        multiline: {
          delimiter: 'semi',
          requireLast: true
        },
        singleline: {
          delimiter: 'semi',
          requireLast: true
        }
      }],
      '@stylistic/space-before-function-paren': ['warn', {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }]
    }
  },
  {
    // https://github.com/eslint/eslint/discussions/18304#discussioncomment-9069706
    ignores: ['node_modules/**', 'dist/**', 'private/**']
  }
];
