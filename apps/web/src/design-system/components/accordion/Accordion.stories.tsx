import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Accordion from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Web/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const ITEMS = [
  { id: 'what', trigger: 'What is the design system?', content: <p>The Sugartown DS is a token-first component library built for a headless CMS stack.</p> },
  { id: 'why', trigger: 'Why Courier Prime for labels?', content: <p>Monospace registers authority in data-dense surfaces. Courier Prime is the Ledger Tradition label font.</p> },
  { id: 'how', trigger: 'How do tokens propagate?', content: <p>All colour, spacing, and type values resolve through <code>--st-*</code> CSS custom properties defined in <code>tokens.css</code>.</p> },
];

export const SingleExpand: Story = {
  name: 'Single expand (default)',
  args: { items: ITEMS },
};

export const WithDefaultOpen: Story = {
  name: 'With default open',
  args: { items: ITEMS, defaultOpen: ['what'] },
};

export const MultiExpand: Story = {
  name: 'Multi-expand',
  args: { items: ITEMS, multi: true },
};

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '640px' }}>
      <Accordion items={ITEMS} />
      <Accordion items={ITEMS} defaultOpen={['what']} />
    </div>
  ),
};
