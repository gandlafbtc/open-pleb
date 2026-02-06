import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default [
  // Include recommended rules
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // ============================================================================
  // TIERED ARCHITECTURE + ADMIN/APP SEPARATION RULES
  // ============================================================================

  // 1. Default: Non-repository files cannot access db directly
  //    (Excludes repository, business, and api — they get their own blocks below)
  {  files: ['**/*.ts', '**/*.js'],
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: __dirname,
    },
  },},
  {
    files: ['**/*.ts'],
    ignores: [
      '**/repository/**',
      '**/business/**',
      '**/api/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/db/db*'],
              message: 'Direct db imports are not allowed. Use repository layer instead.',
            },
          ],
        },
      ],
    },
  },

  // 2. Repository Layer (non-admin, non-app)
  {
    files: ['**/repository/**/*.ts'],
    ignores: ['**/repository/admin/**', '**/repository/app/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/business/**', '**/api/**'],
              message: 'Repository layer cannot import from business or api layers.',
            },
          ],
        },
      ],
    },
  },

  // 2a. Repository Admin
  {
    files: ['**/repository/admin/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/business/**', '**/api/**'],
              message: 'Repository layer cannot import from business or api layers.',
            },
            {
              group: ['**/repository/app/**'],
              message: 'Admin repository files cannot import from app repository.',
            },
          ],
        },
      ],
    },
  },

  // 2b. Repository App
  {
    files: ['**/repository/app/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/business/**', '**/api/**'],
              message: 'Repository layer cannot import from business or api layers.',
            },
            {
              group: ['**/repository/admin/**'],
              message: 'App repository files cannot import from admin repository.',
            },
          ],
        },
      ],
    },
  },

  // 3. Business Layer (non-admin, non-app)
  {
    files: ['**/business/**/*.ts'],
    ignores: ['**/business/admin/**', '**/business/app/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/api/**'],
              message: 'Business layer cannot import from api layer.',
            },
            {
              group: ['**/db/db*'],
              message: 'Business layer cannot directly access db. Use repository layer instead.',
            },
          ],
        },
      ],
    },
  },

  // 3a. Business Admin
  {
    files: ['**/business/admin/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/api/**'],
              message: 'Business layer cannot import from api layer.',
            },
            {
              group: ['**/db/db*'],
              message: 'Business layer cannot directly access db. Use repository layer instead.',
            },
            {
              group: ['**/business/app/**', '**/repository/app/**'],
              message: 'Admin business files can only import from admin folders in repository layer.',
            },
          ],
        },
      ],
    },
  },

  // 3b. Business App
  {
    files: ['**/business/app/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/api/**'],
              message: 'Business layer cannot import from api layer.',
            },
            {
              group: ['**/db/db*'],
              message: 'Business layer cannot directly access db. Use repository layer instead.',
            },
            {
              group: ['**/business/admin/**', '**/repository/admin/**'],
              message: 'App business files cannot import from admin folders.',
            },
          ],
        },
      ],
    },
  },

  // 4. API Layer (non-admin, non-app)
  {
    files: ['**/api/**/*.ts'],
    ignores: ['**/api/**/admin/**', '**/api/**/app/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/db/db*'],
              message: 'API layer cannot directly access db. Use business or repository layer instead.',
            },
          ],
        },
      ],
    },
  },

  // 4a. API Admin
  {
    files: ['**/api/**/admin/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/db/db*'],
              message: 'API layer cannot directly access db. Use business or repository layer instead.',
            },
            {
              group: ['**/api/**/app/**', '**/business/app/**', '**/repository/app/**'],
              message: 'Admin API files can only import from admin folders in business and repository layers.',
            },
          ],
        },
      ],
    },
  },

  // 4b. API App
  {
    files: ['**/api/**/app/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/db/db*'],
              message: 'API layer cannot directly access db. Use business or repository layer instead.',
            },
            {
              group: ['**/api/**/admin/**', '**/business/admin/**', '**/repository/admin/**'],
              message: 'App API files cannot import from admin folders.',
            },
          ],
        },
      ],
    },
  },
];