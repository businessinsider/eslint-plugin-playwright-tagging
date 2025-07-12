module.exports = {
  root: true,
  plugins: [
    'playwright-tagging'
  ],
  extends: [
    'plugin:playwright-tagging/recommended'
  ],
  env: {
    jest: true,
  },
  rules: {
    'playwright-tagging/validate-tags-playwright': ['error', {
      tagGroups: {
        tier: ['@tier1', '@tier2']
      }
    }]
  }
};
