import validateTagsPlaywright from './rules/validate-tags-playwright.js';

const plugin = {
  rules: {
    'validate-tags-playwright': validateTagsPlaywright,
  },
};

// Config for ESLint 8 (legacy)
const recommendedLegacy = {
  plugins: ['playwright-tagging'],
  rules: {
    'playwright-tagging/validate-tags-playwright': 'error',
  },
};

// Config for ESLint 9+ (flat)
const recommendedFlat = {
  plugins: {
    'playwright-tagging': plugin,
  },
  rules: {
    'playwright-tagging/validate-tags-playwright': 'error',
  },
};

// Using `export =` provides better CommonJS compatibility for ESLint 8
export default {
  ...plugin,
  configs: {
    'recommended': recommendedLegacy,
    'recommended-flat': recommendedFlat,
  },
};