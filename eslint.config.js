import { defineConfig, globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs.recommended,
  globalIgnores(['node_modules/**', 'dist/**', 'private/**']),
  {
    languageOptions: {
      parser: parser
      //globals: { require: true, module: true, browser: true }
    },
    rules: {
      'semi': ['warn', 'always'],
      'prefer-const': 'warn',
      'no-unused-vars': 'warn',
      'no-var': 'warn',

      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      '@stylistic/no-tabs': 'off',
      '@stylistic/quotes': ['warn', 'single'],
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
      '@stylistic/multiline-ternary': ['off'],
      '@stylistic/keyword-spacing': 'warn',
      '@stylistic/space-before-blocks': 'warn',
      '@stylistic/no-mixed-operators': 'warn',
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/arrow-parens': 'warn',
      '@stylistic/no-extra-parens': 'warn',
      '@stylistic/padded-blocks': 'warn',
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
  }
]);
