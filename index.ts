import validateTagsPlaywright from './rules/validate-tags-playwright.js';

const plugin = {
  rules: {
    'validate-tags-playwright': validateTagsPlaywright,
  },
};

const recommended = {
  plugins: {
    'playwright-tagging': plugin,
  },
  rules: {
    'playwright-tagging/validate-tags-playwright': 'error',
  },
};

const recommendedLegacy = {
  plugins: ['playwright-tagging'],
  rules: {
    'playwright-tagging/validate-tags-playwright': 'error',
  },
};

export default {
  ...plugin,
  configs: {
    recommended,
    'recommended-legacy': recommendedLegacy,
  },
};