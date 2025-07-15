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
      unknownTag: 'Unknown tag "{{tag}}". It does not belong to any configured tag group. Available tags by group: {{availableTags}}',
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

    // Helper type guard for string literals
    function isStringLiteral(node: TSESTree.Node | null | undefined): node is TSESTree.Literal & { value: string } {
      return !!node && node.type === 'Literal' && typeof node.value === 'string';
    }

    const getAnnotationTags = (node: TSESTree.Node): { tag: string; node: TSESTree.Node }[] => {
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

      if (isStringLiteral(tagProperty.value)) {
        return [{ tag: tagProperty.value.value, node: tagProperty.value }];
      }

      if (tagProperty.value.type === 'ArrayExpression') {
        return tagProperty.value.elements
          .filter(isStringLiteral)
          .map(el => ({ tag: el.value, node: el }));
      }

      return [];
    };

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'test' ||
          node.arguments.length === 0 ||
          node.arguments[0].type !== 'Literal'
        ) {
          return;
        }

        const titleNode = node.arguments[0];
        const title = String(titleNode.value);
        const rawTitleTags = title.match(/@([^\s]+)/g) || [];

        // Explicitly handle disallowed title tags first and exit.
        if (!allow.title && rawTitleTags.length > 0) {
          context.report({
            node: titleNode,
            messageId: 'disallowedTagInTitle',
          });
          return; // Stop all other validation for this node.
        }

        const normalize = (tag: string) => tag.trim().replace(/^@/, '');

        // Collect all tags from the sources that are actually allowed.
        const titleTagInfo = allow.title
          ? rawTitleTags.map(tag => ({ tag, node: titleNode }))
          : [];

        const annotationTagInfo = allow.tagAnnotation
          ? getAnnotationTags(node.arguments[1])
          : [];

        const allTagInfo = [...titleTagInfo, ...annotationTagInfo];
        const configuredTagKeys = Object.keys(tagGroups);

        if (configuredTagKeys.length === 0) {
          if (allTagInfo.length === 0) {
            context.report({
              node: titleNode,
              messageId: 'missingTag',
              fix: allow.title
                ? fixer => {
                    const currentTitle = titleNode.raw ?? '';
                    const newTitle = `${currentTitle.slice(
                      0,
                      -1
                    )} @tagme${currentTitle.slice(-1)}`;
                    return fixer.replaceText(titleNode, newTitle);
                  }
                : undefined,
            });
          }
          return;
        }

        // --- Validations when tagGroups are configured ---
        const allAvailableTags = new Set(Object.values(tagGroups).flat().map(normalize));

        // First, check for any unknown tags. If found, report and exit immediately.
        for (const { tag, node: tagNode } of allTagInfo) {
          const normalizedTag = normalize(tag);
          if (!allAvailableTags.has(normalizedTag)) {
            const availableTagsFormatted = Object.entries(tagGroups)
              .map(([group, tags]) => `\n  - ${group}: ${tags.join(', ')}`)
              .join('');

            context.report({
              node: tagNode,
              messageId: 'unknownTag',
              data: {
                tag,
                availableTags: availableTagsFormatted,
              },
            });
            return; // Exit after finding the first unknown tag.
          }
        }

        // If all tags are valid, proceed to check for missing group tags.
        const allTags = allTagInfo.map(info => normalize(info.tag));
        const unsatisfiedGroups = [];
        for (const key of configuredTagKeys) {
          const approvedTags = tagGroups[key].map(normalize);
          const hasTagFromGroup = allTags.some(tag => approvedTags.includes(tag));
          if (!hasTagFromGroup) {
            unsatisfiedGroups.push(`${key} (${approvedTags.join(', ')})`);
          }
        }

        if (unsatisfiedGroups.length > 0) {
          context.report({
            node: titleNode,
            messageId: 'missingTagFromGroup',
            data: {
              groups: unsatisfiedGroups.join(' and '),
            },
          });
        }
      },
    };
  },
});

