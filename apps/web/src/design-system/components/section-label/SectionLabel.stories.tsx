/**
 * ## SectionLabel
 *
 * Three-zone folio row over a 1px ink baseline.
 * Layout: §NN · name (mono left) | Cormorant title (centre) | mono kicker (right)
 *
 * SUG-99
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SectionLabel from './SectionLabel';

const meta: Meta<typeof SectionLabel> = {
  title: 'Primitives/SectionLabel',
  component: SectionLabel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => <div style={{ maxWidth: '720px' }}><Story /></div>,
  ],
};

export default meta;
type Story = StoryObj<typeof SectionLabel>;

/** Full four-prop form: §NN + name + title + kicker. */
export const Default: Story = {
  args: {
    number: '§ 03',
    name:   'Outcomes',
    title:  'What changed for the client',
    kicker: 'Measured 90 days post-launch',
  },
};

/** Number and title only — kicker omitted. */
export const Minimal: Story = {
  args: {
    number: '§ 01',
    name:   'Challenge',
    title:  'The brief in one sentence',
  },
};

/** Title only — no section number or kicker. */
export const TitleOnly: Story = {
  args: {
    title: 'What changed for the client',
  },
};

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '720px' }}>
      <SectionLabel number="§ 03" name="Outcomes"  title="What changed for the client" kicker="90 days post-launch" />
      <SectionLabel number="§ 01" name="Challenge" title="The brief in one sentence" />
      <SectionLabel title="What changed for the client" />
    </div>
  ),
};
