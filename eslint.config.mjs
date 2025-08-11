import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginTailwind from 'eslint-plugin-tailwindcss';
import pluginUnicorn from 'eslint-plugin-unicorn';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  {
    ignores: ['.next/**', '.husky/**', 'public/**', 'node_modules/**'],
  },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  ...pluginTailwind.configs['flat/recommended'],
  pluginUnicorn.configs['flat/recommended'],
  ...compat.config({
    extends: ['next'],
    settings: {
      next: {
        rootDir: '.',
      },
    },
  }),
  {
    rules: {
      'unicorn/no-useless-undefined': 'off',
      'no-undef': 'error',
      'react/react-in-jsx-scope': 'off',
      "tailwindcss/migration-from-tailwind-2": "off",
      'tailwindcss/no-custom-classname': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'no-console': 'warn',
    },
  },
];

export default eslintConfig;
