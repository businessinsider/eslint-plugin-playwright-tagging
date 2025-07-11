import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(name => `https://github.com/your-repo/eslint-plugin-playwright-tagging/blob/main/docs/rules/${name}.md`);

export default createRule({
  name: 'validate-tags-playwright',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce tagging of Playwright tests',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'object',
            properties: {
              title: { type: 'boolean' },
              tagAnnotation: { type: 'boolean' },
            },
            additionalProperties: false,
          },
          tagGroups: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string',
              },
              minItems: 1,
              uniqueItems: true,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingTag: 'Test must contain a tag',
      missingTagFromGroup: 'Test must contain at least one tag from: {{groups}}',
      disallowedTagInTitle: 'Tags are not allowed in the test title',
    },
  },
  defaultOptions: [
    {
      tagGroups: {} as Record<string, string[]>,
      allow: { title: true, tagAnnotation: false },
    },
  ],
  create(context) {
    const {
      allow = { title: true, tagAnnotation: false },
      tagGroups = {} as Record<string, string[]>,
    } = context.options[0] || {
      allow: { title: true, tagAnnotation: false },
      tagGroups: {},
    };

    const getAnnotationTags = (node: TSESTree.Node): string[] => {
      if (!node || node.type !== 'ObjectExpression') {
        return [];
      }

      const tagProperty = node.properties.find(
        (p): p is TSESTree.Property =>
          p.type === 'Property' &&
          p.key.type === 'Identifier' &&
          p.key.name === 'tag'
      );

      if (!tagProperty) {
        return [];
      }

      if (tagProperty.value.type === 'Literal' && typeof tagProperty.value.value === 'string') {
        return [tagProperty.value.value];
      }

      if (tagProperty.value.type === 'ArrayExpression') {
        return tagProperty.value.elements.map(el => {
          if (el && el.type === 'Literal' && typeof el.value === 'string') {
            return el.value;
          }
          return '';
        }).filter(Boolean);
      }

      return [];
    };

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'test' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal'
        ) {
          const title = String(node.arguments[0].value);
          const titleTags = (title.match(/@([^\s]+)/g) || []).map(t =>
            t.substring(1)
          );

          if (!allow.title && titleTags.length > 0) {
            context.report({
              node: node.arguments[0],
              messageId: 'disallowedTagInTitle',
            });
            return;
          }

          const annotationTags = allow.tagAnnotation
            ? getAnnotationTags(node.arguments[1])
            : [];

          const normalize = (tag: string) => tag.trim().replace(/^@/, '');

          const allTags = [
            ...(allow.title ? titleTags : []),
            ...annotationTags,
          ].map(normalize);

          const configuredTagKeys = Object.keys(tagGroups);
          if (configuredTagKeys.length > 0) {
            const unsatisfiedGroups = [];
            for (const key of configuredTagKeys) {
              const approvedTags = tagGroups[key].map(normalize);
              const hasTagFromGroup = allTags.some(tag =>
                approvedTags.includes(tag)
              );
              if (!hasTagFromGroup) {
                unsatisfiedGroups.push(`${key} (${tagGroups[key].join(', ')})`);
              }
            }

            if (unsatisfiedGroups.length > 0) {
              context.report({
                node: node.arguments[0],
                messageId: 'missingTagFromGroup',
                data: {
                  groups: unsatisfiedGroups.join(' and '),
                },
              });
            }
          } else if (allTags.length === 0) {
            context.report({
              node: node.arguments[0],
              messageId: 'missingTag',
              fix: allow.title
                ? fixer => {
                    const currentTitle =
                      (node.arguments[0] as TSESTree.Literal).raw ?? '';
                    const newTitle = `${currentTitle.slice(
                      0,
                      -1
                    )} @tagme${currentTitle.slice(-1)}`;
                    return fixer.replaceText(node.arguments[0], newTitle);
                  }
                : undefined,
            });
          }
        }
      },
    };
  },
});

