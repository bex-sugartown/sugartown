import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SectionLabel from './SectionLabel';

const meta: Meta<typeof SectionLabel> = {
  title: 'Primitives/SectionLabel',
  component: SectionLabel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    as: { control: { type: 'select' }, options: ['p', 'h2', 'h3', 'h4', 'span'] },
    rule: { control: 'boolean' },
    children: { control: 'text' },
  },
  decorators: [
    (Story) => <div style={{ maxWidth: '680px' }}><Story /></div>,
  ],
};

export default meta;
type Story = StoryObj<typeof SectionLabel>;

/** Default — rule=true, as p. Use before data grids, stat strips, and card collections. */
export const WithRule: Story = {
  args: { children: 'Recently Shipped' },
};

/** As h2 — semantic heading with rule. */
export const AsH2: Story = {
  name: 'As h2',
  args: { as: 'h2', children: 'Outcomes' },
};

/** rule=false — plain mono-caps label. Use above prose blocks or single fields. */
export const WithoutRule: Story = {
  name: 'Without Rule',
  args: { rule: false, children: 'Challenge' },
};

/** Without rule, as p — inline field label above content. */
export const PlainFieldLabel: Story = {
  name: 'Plain Field Label',
  args: { rule: false, children: 'Published' },
};

/** Snapshot — both variants for Chromatic VRT. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <SectionLabel>Recently Shipped</SectionLabel>
        <div style={{ height: '40px', background: 'var(--st-color-bg-surface-strong)', borderRadius: '2px' }} />
      </div>
      <div>
        <SectionLabel as="h2">Outcomes</SectionLabel>
        <div style={{ height: '40px', background: 'var(--st-color-bg-surface-strong)', borderRadius: '2px' }} />
      </div>
      <div>
        <SectionLabel rule={false}>Challenge</SectionLabel>
        <div style={{ height: '40px', background: 'var(--st-color-bg-surface-strong)', borderRadius: '2px' }} />
      </div>
    </div>
  ),
};
