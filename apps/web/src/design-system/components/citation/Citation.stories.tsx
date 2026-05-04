import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CitationMarker, CitationNote, CitationZone } from './Citation';

const meta: Meta = {
  title: 'Web/Citation',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
};

export default meta;

export const Marker: StoryObj = {
  name: 'CitationMarker — inline',
  render: () => (
    <p style={{ maxWidth: '480px' }}>
      Design systems reduce decision fatigue<CitationMarker index={1} /> and
      create shared vocabulary<CitationMarker index={2} /> across teams.
    </p>
  ),
};

export const Zone: StoryObj = {
  name: 'CitationZone + CitationNotes',
  render: () => (
    <div style={{ maxWidth: '640px' }}>
      <CitationZone>
        <CitationNote index={1}>
          Nielsen Norman Group, <em>Design Systems 101</em> (2020).
        </CitationNote>
        <CitationNote index={2}>
          Brad Frost, <em>Atomic Design</em> (2016).{' '}
          <a href="https://atomicdesign.bradfrost.com" target="_blank" rel="noopener noreferrer">
            atomicdesign.bradfrost.com
          </a>
        </CitationNote>
      </CitationZone>
    </div>
  ),
};

export const Snapshot: StoryObj = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <p>
        Design systems reduce decision fatigue<CitationMarker index={1} /> and
        create shared vocabulary<CitationMarker index={2} /> across teams.
      </p>
      <CitationZone>
        <CitationNote index={1}>Nielsen Norman Group, <em>Design Systems 101</em> (2020).</CitationNote>
        <CitationNote index={2}>Brad Frost, <em>Atomic Design</em> (2016).</CitationNote>
      </CitationZone>
    </div>
  ),
};
