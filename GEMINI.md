# Gemini Code Assistant Guidance

This document provides context and instructions for interacting with the Gemini agent in this repository.

## About This Project

This is an ESLint plugin designed to enforce tagging conventions for Playwright tests. It is written in TypeScript and is compatible with both ESLint v8 (legacy config) and v9 (flat config).

## Tech Stack

-   **Language:** TypeScript
-   **Package Manager:** npm
-   **Core Dependencies:**
    -   `@typescript-eslint/parser`
    -   `@typescript-eslint/rule-tester`
    -   `eslint`
-   **CI/CD:** GitHub Actions
-   **Release Management:** `release-it`

## Key Files

-   `index.ts`: The main entry point for the plugin, where rules are exported.
-   `rules/validate-tags-playwright.ts`: The core logic for the ESLint rule.
-   `tests/lib/rules/validate-tags-playwright.ts`: The tests for the rule.
-   `.github/workflows/`: Contains the CI/CD workflows.
    -   `test.yml`: Runs tests against ESLint v8 and v9.
    -   `prepare-release.yml`: Manually triggered workflow to create a release PR.
    -   `publish.yml`: Triggered by a Git tag to publish to npm and create a GitHub Release.
-   `examples/`: Contains example projects demonstrating usage for both ESLint 8 and 9.
-   `.release-it.json`: Configuration for the `release-it` tool.

## Development Workflow

### Installation

To install dependencies, use `npm ci`.

```sh
npm ci
```

### Building

The project is built using `tsup`. The build script is defined in `package.json`.

```sh
npm run build
```

### Testing

The test command first builds the project and then runs the test suite.

```sh
npm test
```

## Release Process

This repository uses a two-part release process to accommodate branch protection on `main`.

1.  **Prepare the Release:**
    -   Manually trigger the **Prepare Release** workflow and provide a version number.
    -   This workflow runs `release-it` to update the `package.json` and `CHANGELOG.md`, then creates a pull request with these changes.

2.  **Publish the Release:**
    -   After the PR is reviewed and merged into `main`, pull the latest changes to your local machine.
    -   Create and push a Git tag for the new version.
        ```sh
        git tag v1.2.3
        git push origin v1.2.3
        ```
    -   Pushing the tag will trigger the **Publish Release** workflow, which builds the project, publishes it to npm, and creates a corresponding GitHub Release.

### Local Releases

It is also possible to run a full release from your local machine if you have the necessary permissions.

```sh
npm run release -- <version>
```
