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
      const tags: string[] = [];
      if (!node) {
        return tags;
      }

      const visitor = (currentNode: TSESTree.Node) => {
        if (currentNode.type === 'CallExpression') {
          const callee = currentNode.callee;
          if (
            callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'push' &&
            callee.object.type === 'MemberExpression' &&
            callee.object.property.type === 'Identifier' &&
            callee.object.property.name === 'annotations' &&
            callee.object.object.type === 'CallExpression' &&
            callee.object.object.callee.type === 'MemberExpression' &&
            callee.object.object.callee.property.type === 'Identifier' &&
            callee.object.object.callee.property.name === 'info' &&
            callee.object.object.callee.object.type === 'Identifier' &&
            callee.object.object.callee.object.name === 'test'
          ) {
            const arg = currentNode.arguments[0];
            if (arg && arg.type === 'ObjectExpression') {
              const typeProperty = arg.properties.find(
                p =>
                  p.type === 'Property' &&
                  p.key.type === 'Identifier' &&
                  p.key.name === 'type' &&
                  p.value.type === 'Literal' &&
                  p.value.value === 'tag'
              ) as TSESTree.Property | undefined;

              const descriptionProperty = arg.properties.find(
                p =>
                  p.type === 'Property' &&
                  p.key.type === 'Identifier' &&
                  p.key.name === 'description' &&
                  p.value.type === 'Literal' &&
                  typeof p.value.value === 'string'
              ) as TSESTree.Property | undefined;

              if (typeProperty && descriptionProperty) {
                tags.push(
                  (descriptionProperty.value as TSESTree.Literal)
                    .value as string
                );
              }
            }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const key in currentNode) {
          if (key === 'parent') {
            continue;
          }
          const child = (currentNode as any)[key];
          if (child && typeof child === 'object' && child.type) {
            visitor(child);
          } else if (Array.isArray(child)) {
            child.forEach(item => {
              if (item && typeof item === 'object' && item.type) {
                visitor(item);
              }
            });
          }
        }
      };
      visitor(node);
      return tags;
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
          const allTags = [
            ...(allow.title ? titleTags : []),
            ...annotationTags,
          ];

          const configuredTagKeys = Object.keys(tagGroups);
          if (configuredTagKeys.length > 0) {
            const unsatisfiedGroups = [];
            for (const key of configuredTagKeys) {
              const approvedTags = tagGroups[key];
              const hasTagFromGroup = allTags.some(tag =>
                approvedTags.includes(tag)
              );
              if (!hasTagFromGroup) {
                unsatisfiedGroups.push(`${key} (${approvedTags.join(', ')})`);
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

