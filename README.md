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

## Releasing

To create a new release, follow these steps:

1.  Go to the [Actions](https://github.com/businessinsider/eslint-plugin-playwright-tagging/actions) tab in your GitHub repository.
2.  Select the "Publish" workflow.
3.  Click the "Run workflow" button.
4.  Enter the version you want to release (e.g., `1.0.1`, `1.1.0-beta.0`) in the input field.
5.  Click the "Run workflow" button to start the release process.

This will automatically:

-   Create a new Git tag for the release.
-   Generate a changelog and commit it.
-   Create a GitHub release.
-   Publish the new version to npm.
