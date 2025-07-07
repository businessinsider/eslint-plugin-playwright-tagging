
import rule from '../../../rules/validate-tags-playwright.js';
import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';

RuleTester.afterAll = () => {};
RuleTester.describe = (text, method) => method();
RuleTester.it = (text, method) => method();

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2017,
      sourceType: 'module',
    },
    globals: {
      test: 'readonly',
      describe: 'readonly',
      it: 'readonly',
      afterAll: 'readonly',
    },
  },
});

ruleTester.run('validate-tags-playwright', rule, {
  valid: [
    {
      code: "test('should do something @tag1', () => {});",
    },
    {
      code: "test('should do something @projectTag @otherTag', () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { projectTags: ['projectTag'], otherTags: ['otherTag'] },
        },
      ],
    },
    {
      code: "test('should do something @projectTag @otherTag @anotherTag', () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { projectTags: ['projectTag'], otherTags: ['otherTag'] },
        },
      ],
    },
    {
      code: "test('should do something @smoke @regression', () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { priority: ['smoke', 'fast'], type: ['regression'] },
        },
      ],
    },
    {
      code: `
        test('should do something', () => {
          test.info().annotations.push({
            type: 'tag',
            description: 'smoke',
          });
        });
      `,
      options: [
        {
          allow: { title: false, tagAnnotation: true },
          tagGroups: { priority: ['smoke'] },
        },
      ],
    },
    {
      code: `
        test('should do something', () => {
          test.info().annotations.push({
            type: 'tag',
            description: 'smoke',
          });
          test.info().annotations.push({
            type: 'tag',
            description: 'regression',
          });
        });
      `,
      options: [
        {
          allow: { title: false, tagAnnotation: true },
          tagGroups: { priority: ['smoke'], type: ['regression'] },
        },
      ],
    },
  ],
  invalid: [
    {
      code: "test('should do something', () => {});",
      errors: [{ messageId: 'missingTag' }],
      output: "test('should do something @tagme', () => {});",
    },
    {
      code: "test('should do something @projectTag', () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { projectTags: ['projectTag'], otherTags: ['otherTag'] },
        },
      ],
      errors: [
        {
          messageId: 'missingTagFromGroup',
          data: {
            groups: 'otherTags (otherTag)',
          },
        },
      ],
    },
    {
      code: "test('should do something @otherTag', () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { projectTags: ['projectTag'], otherTags: ['otherTag'] },
        },
      ],
      errors: [
        {
          messageId: 'missingTagFromGroup',
          data: {
            groups: 'projectTags (projectTag)',
          },
        },
      ],
    },
    {
      code: "test('should do something @wrongProject @wrongOther', () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { projectTags: ['projectTag'], otherTags: ['otherTag'] },
        },
      ],
      errors: [
        {
          messageId: 'missingTagFromGroup',
          data: {
            groups: 'projectTags (projectTag) and otherTags (otherTag)',
          },
        },
      ],
    },
    {
      code: "test('should do something @smoke', () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { priority: ['smoke', 'fast'], type: ['regression'] },
        },
      ],
      errors: [
        {
          messageId: 'missingTagFromGroup',
          data: {
            groups: 'type (regression)',
          },
        },
      ],
    },
    {
      code: "test('should do something @smoke', () => {});",
      options: [
        {
          allow: { title: false, tagAnnotation: true },
          tagGroups: { priority: ['smoke'] },
        },
      ],
      errors: [{ messageId: 'disallowedTagInTitle' }],
    },
    {
      code: `
        test('should do something', () => {
          // no tags
        });
      `,
      options: [
        {
          allow: { title: false, tagAnnotation: true },
          tagGroups: { priority: ['smoke'] },
        },
      ],
      errors: [{ messageId: 'missingTagFromGroup' }],
    },
  ],
});




