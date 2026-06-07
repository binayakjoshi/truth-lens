// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.mjs'],
  },

  js.configs.recommended,

  // KEEP type-checked, but we will relax rules below
  ...tseslint.configs.recommendedTypeChecked,

  prettier,

  {
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      import: importPlugin,
      unicorn,
    },

    rules: {
      // Prettier
      'prettier/prettier': 'error',

      // Allow unused vars with _
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/explicit-function-return-type': 'off',

      // =========================
      // RELAX STRICT TYPE SAFETY
      // =========================
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      '@typescript-eslint/no-floating-promises': 'off',

      // JS safety
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],

      // Filename convention
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],

      // Import ordering
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
);
