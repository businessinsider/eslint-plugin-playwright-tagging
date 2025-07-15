// @ts-check

import eslint from '@eslint/js';
import playwrightTagging from 'eslint-plugin-playwright-tagging';
import globals from 'globals';

export default [
  {
    ignores: ["**/node_modules/**"],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.js"],
    ...playwrightTagging.configs['recommended-flat'],
    languageOptions: {
      globals: {
        ...globals.jest,
      }
    },
    rules: {
      'playwright-tagging/validate-tags-playwright': ['error', {
        tagGroups: {
          tier: ['@tier1', '@tier2']
        }
      }]
    }
  }
];
