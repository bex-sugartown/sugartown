/**
 * ConsentBanner stories — analytics consent bar, fixed to the viewport bottom.
 *
 * The banner reads localStorage['st-consent'] on mount, so the decorator
 * clears it first: every story renders the first-visit state.
 *
 * SUG-202 (#65)
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import ConsentBanner from './ConsentBanner';

const firstVisit = (Story: React.ComponentType) => {
  try {
    localStorage.removeItem('st-consent');
  } catch {
    // storage blocked: the banner treats that as a first visit anyway
  }
  return (
    <MemoryRouter>
      <div style={{ minHeight: '320px' }}>
        <Story />
      </div>
    </MemoryRouter>
  );
};

const meta: Meta<typeof ConsentBanner> = {
  title: 'Regions/ConsentBanner',
  component: ConsentBanner,
  tags: ['autodocs'],
  decorators: [firstVisit],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ConsentBanner>;

export const FirstVisit: Story = {};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' }, chromatic: { viewports: [375] } },
};
