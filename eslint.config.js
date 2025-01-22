// @ts-check
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      '@stylistic': stylistic
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        project: 'tsconfig.json',
      }
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      'no-debugger': ['error'],
      'no-console': ['warn', { allow: ['error'] }],
      'no-prototype-builtins': ['off'],
      '@stylistic/max-len': [
        'error', {
          code: 80,
          tabWidth: 4,
          ignoreComments: true,
          ignoreTrailingComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        }
      ],
      '@stylistic/quotes': ['error', 'single'],
      '@typescript-eslint/no-explicit-any': ['warn'],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowedNames: [],
          allowExpressions: false,
          allowFunctionsWithoutTypeParameters: false,
          allowHigherOrderFunctions: true,
          allowIIFEs: false,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          ignoredMethodNames: [],
          overrides: {
            accessors: 'explicit', constructors: 'off', methods: 'explicit',
            parameterProperties: 'explicit', properties: 'explicit',
          }
        }
      ],
      '@typescript-eslint/no-non-null-assertion': ['off']
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.angular/**',
      '.idea/**',
      '.vscode/**',
      '.git/**',
    ]
  }
);
