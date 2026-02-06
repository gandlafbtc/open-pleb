// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // Include recommended rules
  eslint.configs.recommended,
  ...tseslint.configs.recommended, // For TypeScript

  // Restrict db imports for all files except repository
  {
    files: ['**/*.ts'],
    ignores: ['**/repository/**'],
    rules: {
      'no-restricted-imports': [ 
        'error',
        {
          patterns: [
            {
              group: ['**/db/db', '../db/db', './db/db', '*/db/db'],
              message: 'Direct db imports are not allowed. Use repository layer instead.'
            }
          ]
        }
      ]
    }
  },
  
  // Allow db imports in repository folder
  {
    files: ['**/repository/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off'
    }
  }
];
