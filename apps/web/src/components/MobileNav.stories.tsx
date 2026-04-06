/**
 * MobileNav stories — slide-out mobile navigation drawer.
 *
 * Uses MemoryRouter (for NavLink/Link).
 * Renders in open state by default for visual testing.
 * Includes accordion submenus, CTA, footer links, social icons.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';
import { Button } from '../design-system';
import {
  NAV_ITEMS,
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
} from './__fixtures__/siteSettings';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

// Constrain to mobile viewport width for realistic rendering
const withMobileWidth = (Story: React.ComponentType) => (
  <div style={{ maxWidth: '375px', height: '100vh', position: 'relative', overflow: 'hidden' }}>
    <Story />
  </div>
);

const meta: Meta<typeof MobileNav> = {
  title: 'Layout/MobileNav',
  component: MobileNav,
  tags: ['autodocs'],
  decorators: [withRouter, withMobileWidth],
  argTypes: {
    open: { control: 'boolean', description: 'Drawer visibility state' },
    items: { control: { type: 'object' }, description: 'Nav items array with optional children (accordion submenus)' },
    footerColumns: { control: { type: 'object' } },
    socialLinks: { control: { type: 'object' } },
    copyrightText: { control: 'text' },
    siteTitle: { control: 'text' },
    onClose: { action: 'closed' },
    cta: { table: { disable: true } },
    themeToggle: { table: { disable: true } },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MobileNav>;

const CTA_ELEMENT = (
  <Button variant="primary" href="/contact">Get in Touch</Button>
);

/** Open drawer — full nav with accordion submenu, CTA, footer, social. */
export const Open: Story = {
  args: {
    items: NAV_ITEMS,
    cta: CTA_ELEMENT,
    themeToggle: <ThemeToggle />,
    footerColumns: FOOTER_COLUMNS,
    socialLinks: SOCIAL_LINKS,
    copyrightText: 'All rights reserved.',
    siteTitle: 'Sugartown Digital',
    open: true,
    onClose: () => {},
  },
};

/** Closed state — drawer hidden (overlay invisible). */
export const Closed: Story = {
  args: {
    ...Open.args,
    open: false,
  },
};

/** Minimal — nav items only, no CTA or footer content. */
export const Minimal: Story = {
  name: 'Minimal (nav only)',
  args: {
    items: NAV_ITEMS.filter(item => !item.children),
    open: true,
    onClose: () => {},
  },
};
