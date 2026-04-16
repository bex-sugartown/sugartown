/**
 * Footer stories — site footer with brand zone (logo + tagline + social),
 * nav columns, utility row, and colophon strip (version / toolchain / license / build date).
 *
 * SUG-65 — Footer Reset
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import {
  SITE_SETTINGS,
  FOOTER_COLUMNS,
  FOOTER_TOOLCHAIN,
  SOCIAL_LINKS,
  MOCK_LOGO,
} from './__fixtures__/siteSettings';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

/** Full footer — all zones populated: brand, 3-col nav, utility row, colophon. */
export const Full: Story = {
  args: {
    siteSettings: SITE_SETTINGS,
  },
};

/** With a license URL — license label becomes a link. */
export const WithLicenseLink: Story = {
  name: 'License Link',
  args: {
    siteSettings: {
      ...SITE_SETTINGS,
      licenseUrl: 'https://creativecommons.org/licenses/by-nc/4.0/',
    },
  },
};

/** Without toolchain chips — built date moves to first colophon row. */
export const NoToolchain: Story = {
  name: 'No Toolchain',
  args: {
    siteSettings: {
      ...SITE_SETTINGS,
      footerToolchain: [],
    },
  },
};

/** Without social links — social icon strip absent from brand zone. */
export const NoSocial: Story = {
  name: 'No Social Links',
  args: {
    siteSettings: {
      ...SITE_SETTINGS,
      socialLinks: [],
    },
  },
};

/** Minimal — logo and copyright only; no columns, social, or colophon data. */
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

/** Snapshot composite — all major states stacked for Chromatic VRT. */
export const Snapshot: Story = {
  name: 'Snapshot (VRT)',
  render: () => (
    <MemoryRouter>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#eee' }}>
        <Footer siteSettings={SITE_SETTINGS} />
        <Footer siteSettings={{ ...SITE_SETTINGS, footerToolchain: [] }} />
        <Footer siteSettings={{ siteLogo: MOCK_LOGO, siteTitle: 'Sugartown Digital', copyrightText: 'All rights reserved.' }} />
      </div>
    </MemoryRouter>
  ),
  decorators: [],
};
