/**
 * Header stories — site header with logo, desktop nav, CTA, theme toggle,
 * and mobile hamburger trigger.
 *
 * Uses MemoryRouter (for Link/NavLink), urlFor (mocked via vite alias),
 * and fixture siteSettings data.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { SITE_SETTINGS, NAV_ITEMS, HEADER_CTA, MOCK_LOGO } from './__fixtures__/siteSettings';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

/** Full header — logo, nav, CTA, preheader, theme toggle. */
export const Full: Story = {
  args: {
    siteSettings: SITE_SETTINGS,
  },
};

/** Without preheader banner. */
export const NoPreheader: Story = {
  name: 'No Preheader',
  args: {
    siteSettings: {
      ...SITE_SETTINGS,
      preheader: undefined,
    },
  },
};

/** Without CTA button. */
export const NoCta: Story = {
  name: 'No CTA',
  args: {
    siteSettings: {
      ...SITE_SETTINGS,
      headerCta: undefined,
    },
  },
};

/** Minimal — logo only, no nav items. */
export const Minimal: Story = {
  name: 'Minimal (logo only)',
  args: {
    siteSettings: {
      siteLogo: MOCK_LOGO,
      siteTitle: 'Sugartown Digital',
      primaryNav: { items: [] },
    },
  },
};
