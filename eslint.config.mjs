import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Import plugins and configs through the compatibility layer
const compatConfigs = compat.extends(
  'next/core-web-vitals',
  'eslint:recommended',
  'plugin:react/recommended',
  'plugin:react-hooks/recommended',
  'plugin:jsx-a11y/recommended'
);

// TypeScript config
const typescriptConfig = tseslint.config(...tseslint.configs.recommended);

// Define ignore patterns (files that should not be linted)
const ignores = [
  'node_modules',
  '.next/**/*',
  'out',
  'public',
  '*.config.js',
  '*.config.mjs',
  'dist',
];

// Define custom rules
const customRules = {
  // Ensure 'error' is used in catch blocks
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    },
  ],

  // Accessibility for mobile
  'jsx-a11y/click-events-have-key-events': 'error',
  'jsx-a11y/no-static-element-interactions': 'error',

  // React specific rules
  'react/jsx-uses-react': 'error',
  'react/jsx-uses-vars': 'error',
  'react/prop-types': 'off', // We use TypeScript which handles prop types
  'react/react-in-jsx-scope': 'off', // Not needed with Next.js

  // Next.js specific rules
  '@next/next/no-img-element': 'warn', // Prefer next/image component

  // Hooks
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
};

// Settings
const settings = {
  react: {
    version: 'detect',
  },
};

export default [
  {
    ignores,
  },
  js.configs.recommended,
  ...typescriptConfig,
  ...compatConfigs,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: customRules,
    settings,
  },
  // Additional overrides for specific file patterns can be added here
];
