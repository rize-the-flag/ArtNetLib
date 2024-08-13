// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import * as path from 'path';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/unified-signatures': 'warn',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/consistent-generic-constructors': 'off',
      '@/semi': 'error',
    },
  },
  {
    ignores: [
        '**/*.d.ts',
      '**/build/**',
      '**/*.js',
      'eslint.config.mjs',
      '**/node_modules'
    ],
  }
);
