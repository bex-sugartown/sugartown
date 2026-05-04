import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CodeBlock, { InlineCode } from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Web/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: '680px' }}><Story /></div>],
  argTypes: {
    language: { control: { type: 'select' }, options: ['typescript', 'javascript', 'css', 'bash', 'json', 'python'] },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

const TS_SAMPLE = `export function getCanonicalPath({ docType, slug }: { docType: string; slug: string }) {
  const namespace = TYPE_NAMESPACES[docType] ?? docType;
  return \`/\${namespace}/\${slug}\`;
}`;

const CSS_SAMPLE = `/* Token-first: no raw hex allowed */
.card {
  background: var(--st-card-bg);
  border: 1px solid var(--st-color-rule);
  border-radius: var(--st-radius-card);
}`;

const BASH_SAMPLE = `pnpm --filter web validate:tokens
pnpm --filter web validate:tokens --strict-colors`;

export const TypeScript: Story = {
  args: { code: TS_SAMPLE, language: 'typescript' },
};

export const CSS: Story = {
  args: { code: CSS_SAMPLE, language: 'css' },
};

export const WithFilename: Story = {
  name: 'With filename',
  args: { code: BASH_SAMPLE, language: 'bash', filename: 'terminal' },
};

export const NoLanguage: Story = {
  name: 'No language label',
  args: { code: 'Hello, world!', language: undefined },
};

export const Inline: StoryObj = {
  name: 'InlineCode',
  render: () => (
    <p>
      Run <InlineCode>pnpm validate:tokens</InlineCode> before every commit that touches CSS.
    </p>
  ),
};

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CodeBlock code={TS_SAMPLE} language="typescript" />
      <CodeBlock code={CSS_SAMPLE} language="css" />
      <CodeBlock code={BASH_SAMPLE} language="bash" filename="terminal" />
      <p>Use <InlineCode>getCanonicalPath()</InlineCode> for all internal links.</p>
    </div>
  ),
};
