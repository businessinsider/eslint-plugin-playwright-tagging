# ESLint 8 Legacy Config Example

This directory contains a minimal example of how to use `eslint-plugin-playwright-tagging` with ESLint 8's legacy (`.eslintrc.js`) configuration style.

## How to Run

1.  Navigate to this directory:
    ```sh
    cd examples/eslint-8-legacy-config
    ```

2.  Install the dependencies. This will install ESLint 8 and link to the local plugin in the parent directory.
    ```sh
    npm install
    ```

3.  Run the linter:
    ```sh
    npm run lint
    ```

You should see an error for the test in `test.spec.js` that is missing a `tier` tag.
