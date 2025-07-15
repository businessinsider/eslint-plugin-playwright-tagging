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

const main = {
  ...plugin,
  configs: {
    recommended: recommendedLegacy,
    'recommended-flat': recommendedFlat,
  },
};

export const { rules, configs } = main;

// The default export is for ESM consumers (e.g., ESLint 9 flat config)
export default main;
