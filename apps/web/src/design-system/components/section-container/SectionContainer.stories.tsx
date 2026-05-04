/**
 * ## SectionContainer
 *
 * Semantic wrapper for shared-border Tile strips. Owns the 2px ink top rule
 * and 1px box border. Children share 1px hairline dividers via bg-through-gap
 * (no visual gaps between tiles).
 *
 * Pair with SectionLabel variant="folio" as a section header.
 *
 * SUG-99
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SectionContainer from './SectionContainer';
import Tile from '../tile/Tile';
import SectionLabel from '../section-label/SectionLabel';

const meta: Meta<typeof SectionContainer> = {
  title: 'Primitives/SectionContainer',
  component: SectionContainer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 6 } },
  },
  decorators: [
    (Story) => <div style={{ maxWidth: '720px' }}><Story /></div>,
  ],
};

export default meta;
type Story = StoryObj<typeof SectionContainer>;

/** Three-tile outcomes strip — auto-fit columns. */
export const ThreeTiles: Story = {
  name: '3-tile outcomes strip',
  render: () => (
    <SectionContainer>
      <Tile label="Time on site"     value="38"  unit="%" sub="up from baseline"   titleSize="display" labelColor="ink" />
      <Tile label="Editorial uplift" value="2.4" unit="×"                          titleSize="display" labelColor="ink" />
      <Tile label="Filter match"     value="91"  unit="%" sub="within 2 filters"   titleSize="display" labelColor="ink" />
    </SectionContainer>
  ),
};

/** With SectionLabel folio header above. */
export const WithFolioHeader: Story = {
  name: 'With folio header',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <SectionLabel
        variant="folio"
        number="§ 03"
        name="Outcomes"
        title="What changed for the client"
        kicker="Measured 90 days post-launch"
      />
      <SectionContainer>
        <Tile label="Time on site"     value="38"  unit="%" sub="up from baseline"   titleSize="display" labelColor="ink" />
        <Tile label="Editorial uplift" value="2.4" unit="×"                          titleSize="display" labelColor="ink" />
        <Tile label="Filter match"     value="91"  unit="%" sub="within 2 filters"   titleSize="display" labelColor="ink" />
      </SectionContainer>
    </div>
  ),
};

/** Four tiles — fixed columns={4}. */
export const FourTiles: Story = {
  name: '4-tile strip',
  render: () => (
    <SectionContainer columns={4}>
      <Tile label="Retention"      value="94"  unit="%" titleSize="2xl" labelColor="ink" />
      <Tile label="Time to insight" value="3"  unit="d" titleSize="2xl" labelColor="ink" />
      <Tile label="Adoption"       value="6"   unit="/8" titleSize="2xl" labelColor="ink" />
      <Tile label="Taxonomy docs"  value="2.4" unit="k" titleSize="2xl" labelColor="ink" />
    </SectionContainer>
  ),
};

/** Snapshot for Chromatic VRT. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '720px' }}>
      <SectionContainer>
        <Tile label="Time on site"     value="38"  unit="%" titleSize="display" labelColor="ink" />
        <Tile label="Editorial uplift" value="2.4" unit="×" titleSize="display" labelColor="ink" />
        <Tile label="Filter match"     value="91"  unit="%" titleSize="display" labelColor="ink" />
      </SectionContainer>
      <div>
        <SectionLabel variant="folio" number="§ 03" name="Outcomes" title="What changed for the client" kicker="90 days post-launch" />
        <SectionContainer>
          <Tile label="Time on site"     value="38"  unit="%" titleSize="display" labelColor="ink" />
          <Tile label="Editorial uplift" value="2.4" unit="×" titleSize="display" labelColor="ink" />
          <Tile label="Filter match"     value="91"  unit="%" titleSize="display" labelColor="ink" />
        </SectionContainer>
      </div>
    </div>
  ),
};
