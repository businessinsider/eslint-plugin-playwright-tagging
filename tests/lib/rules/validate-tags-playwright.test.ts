
import rule from '../../../rules/validate-tags-playwright.js';
import { RuleTester } from '@typescript-eslint/rule-tester';
import tsParser from '@typescript-eslint/parser';
import { describe, it } from 'node:test';


RuleTester.afterAll = () => {};
RuleTester.describe = describe;
RuleTester.it = it;

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
          tagGroups: { projectTags: ['projectTag'], otherTags: ['otherTag', 'anotherTag'] },
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
        test('should do something', {
          tag: 'smoke',
        }, () => {});
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
        test('should do something', {
          tag: ['smoke', 'regression'],
        }, () => {});
      `,
      options: [
        {
          allow: { title: false, tagAnnotation: true },
          tagGroups: { priority: ['smoke'], type: ['regression'] },
        },
      ],
    },
    {
      // Mixed tags in title and annotation
      code: "test('should do something @smoke', { tag: 'regression' }, () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: true },
          tagGroups: { priority: ['smoke'], type: ['regression'] },
        },
      ],
    },
    {
      // Should gracefully handle non-string values in tag array
      code: `
        test('should do something', {
          tag: ['smoke', 123, null, 'regression'],
        }, () => {});
      `,
      options: [
        {
          allow: { title: false, tagAnnotation: true },
          tagGroups: { priority: ['smoke'], type: ['regression'] },
        },
      ],
    },
    {
      // Should ignore other function calls like describe()
      code: "describe('a suite with @tag', () => {});",
    },
    {
      // Should ignore other function calls like it()
      code: "it('a spec with @tag', () => {});",
    },
  ],
  invalid: [
    {
      code: "test('should do something', () => {});",
      errors: [{ messageId: 'missingTag' }],
      output: "test('should do something @tagme', () => {});",
    },
    {
      // No auto-fix should be suggested when tagGroups are configured
      code: "test('should do something', () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { priority: ['smoke'] },
        },
      ],
      errors: [{ messageId: 'missingTagFromGroup', data: { groups: 'priority (smoke)' } }],
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
          messageId: 'unknownTag',
          data: {
            tag: '@wrongProject',
            availableTags: '\n  - projectTags: projectTag\n  - otherTags: otherTag',
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
    {
      // Missing a required tag group when tags are in an array
      code: `
        test('should do something', {
          tag: ['smoke'],
        }, () => {});
      `,
      options: [
        {
          allow: { title: false, tagAnnotation: true },
          tagGroups: { priority: ['smoke'], type: ['regression'] },
        },
      ],
      errors: [{ messageId: 'missingTagFromGroup', data: { groups: 'type (regression)' } }],
    },
    {
      // Annotation tags are ignored when allow.tagAnnotation is false
      code: `
        test('should do something', {
          tag: 'smoke',
        }, () => {});
      `,
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { priority: ['smoke'] },
        },
      ],
      errors: [{ messageId: 'missingTagFromGroup', data: { groups: 'priority (smoke)' } }],
    },
    {
      code: "test('should do something @unknown', () => {});",
      options: [
        {
          allow: { title: true, tagAnnotation: false },
          tagGroups: { priority: ['smoke', 'fast'], type: ['regression'] },
        },
      ],
      errors: [
        {
          messageId: 'unknownTag',
          data: {
            tag: '@unknown',
            availableTags: '\n  - priority: smoke, fast\n  - type: regression',
          },
        },
      ],
    },
    {
      code: `
        test('should do something', {
          tag: ['smoke', 'unknown'],
        }, () => {});
      `,
      options: [
        {
          allow: { title: false, tagAnnotation: true },
          tagGroups: { priority: ['smoke'], type: ['regression'] },
        },
      ],
      errors: [
        {
          messageId: 'unknownTag',
          data: {
            tag: 'unknown',
            availableTags: '\n  - priority: smoke\n  - type: regression',
          },
        },
      ],
    },
  ],
});
