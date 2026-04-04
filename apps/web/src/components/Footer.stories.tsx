/**
 * Footer stories — site footer with logo, tagline, nav columns,
 * social links, and copyright.
 *
 * Uses MemoryRouter (for Link/NavLink), urlFor (mocked via vite alias),
 * and fixture siteSettings data.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import {
  SITE_SETTINGS,
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
  MOCK_LOGO,
} from './__fixtures__/siteSettings';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof Footer> = {
  title: 'Web Components/Footer',
  component: Footer,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

/** Full footer — logo, tagline, nav columns, social links, copyright. */
export const Full: Story = {
  args: {
    siteSettings: SITE_SETTINGS,
  },
};

/** Without social links. */
export const NoSocial: Story = {
  name: 'No Social Links',
  args: {
    siteSettings: {
      ...SITE_SETTINGS,
      socialLinks: [],
    },
  },
};

/** Minimal — logo and copyright only, no columns or social. */
export const Minimal: Story = {
  name: 'Minimal',
  args: {
    siteSettings: {
      siteLogo: MOCK_LOGO,
      siteTitle: 'Sugartown Digital',
      copyrightText: 'All rights reserved.',
    },
  },
};
