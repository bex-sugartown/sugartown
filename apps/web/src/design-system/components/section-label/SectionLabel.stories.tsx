/**
 * ## SectionLabel
 *
 * Mono-caps section opener in two variants:
 *
 * - **default** — mono-caps label with optional extending ink rule.
 *   Use before data grids, stat strips, card collections.
 * - **folio** — three-zone row over a 1px ink baseline:
 *   `§NN · name` (mono left) | Cormorant title (centre) | mono kicker (right).
 *   Use as a section header on case-study and detail pages.
 *
 * SUG-96 (default) · SUG-99 (folio variant)
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SectionLabel from './SectionLabel';

const meta: Meta<typeof SectionLabel> = {
  title: 'Primitives/SectionLabel',
  component: SectionLabel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: { type: 'radio' }, options: ['default', 'folio'] },
    as:      { control: { type: 'select' }, options: ['p', 'h2', 'h3', 'h4', 'span'] },
    rule:    { control: 'boolean' },
  },
  decorators: [
    (Story) => <div style={{ maxWidth: '720px' }}><Story /></div>,
  ],
};

export default meta;
type Story = StoryObj<typeof SectionLabel>;

// ─── Default variant ──────────────────────────────────────────────────────────

/** Default — rule=true, extends ink rule to full width. */
export const WithRule: Story = {
  args: { children: 'Recently Shipped' },
};

/** As h2 with rule. */
export const AsH2: Story = {
  name: 'As h2',
  args: { as: 'h2', children: 'Outcomes' },
};

/** rule=false — plain mono-caps label above prose blocks. */
export const WithoutRule: Story = {
  name: 'Without rule',
  args: { rule: false, children: 'Challenge' },
};

// ─── Folio variant ────────────────────────────────────────────────────────────

/** Folio — full four-prop form: §NN + name + title + kicker. */
export const Folio: Story = {
  name: 'Folio',
  args: {
    variant: 'folio',
    number:  '§ 03',
    name:    'Outcomes',
    title:   'What changed for the client',
    kicker:  'Measured 90 days post-launch',
  },
};

/** Folio — number and title only (kicker omitted). */
export const FolioMinimal: Story = {
  name: 'Folio / Minimal',
  args: {
    variant: 'folio',
    number:  '§ 01',
    name:    'Challenge',
    title:   'The brief in one sentence',
  },
};

// ─── Snapshot ────────────────────────────────────────────────────────────────

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '720px' }}>
      <div>
        <SectionLabel>Recently Shipped</SectionLabel>
        <div style={{ height: '32px', background: 'var(--st-color-bg-surface-strong)', borderRadius: '2px' }} />
      </div>
      <div>
        <SectionLabel rule={false}>Challenge</SectionLabel>
        <div style={{ height: '32px', background: 'var(--st-color-bg-surface-strong)', borderRadius: '2px' }} />
      </div>
      <SectionLabel
        variant="folio"
        number="§ 03"
        name="Outcomes"
        title="What changed for the client"
        kicker="Measured 90 days post-launch"
      />
      <SectionLabel
        variant="folio"
        number="§ 01"
        name="Challenge"
        title="The brief in one sentence"
      />
    </div>
  ),
};
