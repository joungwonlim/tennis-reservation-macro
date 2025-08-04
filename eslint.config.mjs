import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      // Prettier와 충돌하는 규칙들을 비활성화
      'prettier/prettier': 'error',
      // TypeScript 관련 규칙
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // React 관련 규칙
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // 일반적인 규칙
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },
];

export default eslintConfig;
