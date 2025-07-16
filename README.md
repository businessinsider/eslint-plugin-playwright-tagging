# ESLint Plugin Playwright Tagging

An ESLint plugin to enforce tagging of Playwright tests.

## Installation

You can install the plugin using npm:

```sh
npm i -D eslint-plugin-playwright-tagging
```

## Usage

This plugin supports both the new "flat config" format (ESLint v9+) and the legacy `.eslintrc.js` format (ESLint v8).

### With ESLint 9+ (Flat Config)

Add the plugin to your `eslint.config.js` file:

```javascript
// eslint.config.js
import playwrightTagging from 'eslint-plugin-playwright-tagging';

export default [
  {
    files: ["tests/**/*.spec.js"], // Or your test files
    ...playwrightTagging.configs['recommended-flat'],
    // To add custom options:
    rules: {
      'playwright-tagging/validate-tags-playwright': ['error', {
        allow: {
          title: false, // Do not allow tags in test titles
          tagAnnotation: true // Allow tags via test.info().annotations
        },
        tagGroups: {
          tier: ['@tier1', '@tier2'],
          team: ['@squad-a', '@squad-b']
        }
      }]
    }
  }
];
```

### With ESLint 8 (Legacy Config)

Add `playwright-tagging` to the plugins section of your `.eslintrc.js` configuration file. You can omit the `eslint-plugin-` prefix:

```javascript
// .eslintrc.js
module.exports = {
  plugins: [
    'playwright-tagging'
  ],
  overrides: [
    {
      files: ['tests/**/*.spec.js'], // Or your test files
      extends: [
        'plugin:playwright-tagging/recommended'
      ],
      // To add custom options:
      rules: {
        'playwright-tagging/validate-tags-playwright': ['error', {
          allow: {
            title: true, // Allow tags in test titles
            tagAnnotation: false // Do not allow tags via test.info().annotations
          },
          tagGroups: {
            tier: ['@tier1', '@tier2'],
            team: ['@squad-a', '@squad-b']
          }
        }]
      }
    }
  ]
};
```

## Rule: validate-tags-playwright

This rule ensures that every Playwright `test` block is associated with one or more tags.

### Options

The rule takes an optional object with the following properties:

-   `tagGroups` (optional): An object where each key is a "group name" and the value is an array of tags. The rule will enforce that every test has at least one tag from each defined group.
-   `optionalTagGroups` (optional): An object where each key is a group name and the value is an array of tags. These tags are considered valid by the linter, but their presence is not enforced. This is useful for tags that are allowed but not mandatory.
-   `allow` (optional): An object to control where tags can be placed.
    -   `title`: `boolean` (default: `true`). Allows tags in the test title (e.g., `test('@smoke ...')`). If set to `false`, an error will be reported if tags are found in the title.
    -   `tagAnnotation`: `boolean` (default: `false`). Allows tags via the test's options object, which is commonly used for `test.info().annotations`. The plugin specifically looks for a `tag` property that can be a string or an array of strings.

### Automatic Fixes

When no `tagGroups` are configured and a test is missing a tag, the rule can automatically add a placeholder tag (`@tagme`) to the test title as a fix. This feature is only active when `allow.title` is `true`.

#### Example: `tagGroups` and `optionalTagGroups`

If you want to ensure every test has a required `tier` tag and also allow for optional `team` tags, you can configure it like this:

```json
{
  "tagGroups": {
    "tier": ["@tier1", "@tier2", "@tier3"]
  },
  "optionalTagGroups": {
    "team": ["@squad-a", "@squad-b"]
  }
}
```

-   A test titled `test('@tier1 @squad-a my test')` would **pass**.
-   A test titled `test('@tier1 my test')` would also **pass** because the `team` tag is optional.
-   A test titled `test('@squad-a my test')` would **fail** because it is missing a required tag from the `tier` group.
-   A test titled `test('@tier1 @unknown-tag my test')` would **fail** because `@unknown-tag` is not defined in any of the required or optional groups.

**Note:** The plugin normalizes tags by removing the leading `@` symbol and trimming whitespace before validation. This means you can define tags in your configuration with or without the `@` prefix (e.g., `'@tier1'` and `'tier1'` are treated as the same tag).
