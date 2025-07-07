
# eslint-plugin-playwright-tagging

An ESLint plugin to enforce tagging of Playwright tests.

## Installation

You can install the plugin using npm:

```sh
npm install eslint-plugin-playwright-tagging --save-dev
```

# eslint-plugin-playwright-tagging

An ESLint plugin to enforce tagging of Playwright tests.

## Installation

You can install the plugin using npm:

```sh
npm install eslint-plugin-playwright-tagging --save-dev
```

## Usage

This plugin supports both the new "flat" config (`eslint.config.js`) for ESLint 9+ and the legacy `.eslintrc` format for ESLint 8.

### ESLint 9+ (Flat Config)

In your `eslint.config.js` file:

```javascript
import playwrightTagging from 'eslint-plugin-playwright-tagging';

export default [
  playwrightTagging.configs.recommended,
  {
    // Optionally override rule settings
    rules: {
      'playwright-tagging/validate-tags-playwright': [
        'error',
        {
          tagGroups: {
            priority: ['smoke', 'regression'],
          },
        },
      ],
    },
  },
];
```

### ESLint 8 (Legacy `.eslintrc`)

In your `.eslintrc.js` file:

```javascript
module.exports = {
  extends: 'plugin:playwright-tagging/recommended-legacy',
  rules: {
    // Optionally override rule settings
    'playwright-tagging/validate-tags-playwright': [
      'error',
      {
        tagGroups: {
          priority: ['smoke', 'regression'],
        },
      },
    ],
  },
};
```

## Rule Details

The `validate-tags-playwright` rule ensures that all Playwright `test` calls have at least one tag from each of the configured groups.

### Configuring Tag Locations

By default, tags are only allowed in the test title. You can configure where tags are allowed using the `allow` option:

- `title`: Set to `false` to disallow tags in the test title.
- `tagAnnotation`: Set to `true` to allow tags in the Playwright `test.info().annotations` object.

For example, to only allow tags in the tag annotation:

```javascript
'playwright-tagging/validate-tags-playwright': [
  'error',
  {
    tagGroups: {
      priority: ['smoke', 'regression', 'integration'],
    },
    allow: {
      title: false,
      tagAnnotation: true,
    }
  },
],
```


