import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock, InlineCode } from './CodeBlock';

/**
 * ## CodeBlock
 *
 * Preformatted code block with syntax highlighting via Prism.js.
 * Custom Sugartown theme: pink keywords, seafoam strings, lime comments.
 *
 * Also exports `InlineCode` for `<code>` within prose text.
 *
 * Use the Controls panel to try different `language`, `showLineNumbers`, and `filename` values.
 */
const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'padded',
  },
  argTypes: {
    language: {
      control: { type: 'select' },
      options: [
        'javascript',
        'typescript',
        'css',
        'html',
        'json',
        'bash',
        'python',
        'jsx',
        'tsx',
        'markdown',
        'yaml',
        'mermaid',
      ],
    },
    showLineNumbers: { control: 'boolean' },
    filename: { control: 'text', description: 'Filename shown in the meta bar above the code' },
    code: { control: 'text' },
    className: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '720px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

// ── Default — mermaid diagram syntax as plain text ───────────────────────────

export const Default: Story = {
  args: {
    code: `graph TD
  A[Sanity Studio] -->|GROQ| B[Web App]
  B --> C[DS Components]
  C --> D[Storybook]
  A -->|Schema| E[Portable Text]
  E --> C`,
    language: 'mermaid',
  },
};

// ── JavaScript ───────────────────────────────────────────────────────────────

export const JavaScript: Story = {
  args: {
    code: `import { Button } from '@sugartown/design-system';

function Hero({ title, ctas }) {
  const primary = ctas?.[0];
  const isExternal = primary?.url?.startsWith('http');

  return (
    <section className={styles.hero}>
      <h1>{title}</h1>
      {primary && (
        <Button
          variant="primary"
          href={primary.url}
          target={isExternal ? '_blank' : undefined}
        >
          {primary.label}
        </Button>
      )}
    </section>
  );
}`,
    language: 'javascript',
  },
};

// ── Inline Code ──────────────────────────────────────────────────────────────

export const InlineCodeStory: Story = {
  name: 'Inline Code',
  render: () => (
    <p style={{ fontSize: '1rem', lineHeight: 1.6, maxWidth: '600px' }}>
      Use <InlineCode>variant=&quot;listing&quot;</InlineCode> on the{' '}
      <InlineCode>Card</InlineCode> component for archive-density layouts.
      The token <InlineCode>--st-color-brand-primary</InlineCode> resolves
      to <InlineCode>#ff247d</InlineCode> (Sugartown Pink).
    </p>
  ),
};
