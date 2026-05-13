/**
 * TwoColumnLayout stories — flex shell for left/right sidebar pages.
 *
 * Shows the full nesting: TwoColumnLayout → Sidebar → SidebarNav.
 * Use a wide viewport to see the two-column layout activate.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TwoColumnLayout from './TwoColumnLayout';
import Sidebar from '../sidebar/Sidebar';
import SidebarNav from '../sidebar-nav/SidebarNav';

const meta: Meta<typeof TwoColumnLayout> = {
  title: 'Layout/TwoColumnLayout',
  component: TwoColumnLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof TwoColumnLayout>;

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'architecture', label: 'Architecture', href: '#architecture' },
  { id: 'deployment', label: 'Deployment', href: '#deployment' },
  { id: 'artifacts', label: 'Artifacts', href: '#artifacts' },
];

const MockContent = () => (
  <div style={{ padding: '2rem', maxWidth: '760px' }}>
    <h1 style={{ marginBottom: '1rem' }}>Page heading</h1>
    {Array.from({ length: 6 }, (_, i) => (
      <p key={i} style={{ marginBottom: '1rem', color: 'var(--st-color-text-muted)', lineHeight: 1.6 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
      </p>
    ))}
  </div>
);

// ── Left sidebar (platform nav pattern) ─────────────────────

export const SidebarLeft: Story = {
  name: 'Sidebar left (nav rail)',
  render: () => (
    <TwoColumnLayout
      placement="left"
      sidebar={
        <Sidebar label="Platform" side="left" breakpoint="md" mobileStyle="strip" aria-label="Section navigation">
          <SidebarNav label="Sections" items={NAV_ITEMS} />
        </Sidebar>
      }
    >
      <main style={{ flex: 1, minWidth: 0 }}>
        <MockContent />
      </main>
    </TwoColumnLayout>
  ),
};

// ── Right sidebar (content rail pattern) ────────────────────

export const SidebarRight: Story = {
  name: 'Sidebar right (content rail)',
  render: () => (
    <TwoColumnLayout
      placement="right"
      breakpoint="lg"
      sidebar={
        <Sidebar label="On this page" side="right" breakpoint="lg" mobileStyle="appendix" aria-label="Page details">
          <SidebarNav label="On this page" items={NAV_ITEMS} activeId="architecture" />
        </Sidebar>
      }
    >
      <main style={{ flex: 1, minWidth: 0 }}>
        <MockContent />
      </main>
    </TwoColumnLayout>
  ),
};

// ── Mobile: sidebar left collapses to strip ──────────────────

export const MobileLeftSidebar: Story = {
  name: 'Mobile — left sidebar collapses',
  parameters: { viewport: { defaultViewport: 'mobile' } },
  render: () => (
    <TwoColumnLayout
      placement="left"
      sidebar={
        <Sidebar label="Platform" side="left" breakpoint="md" mobileStyle="strip" aria-label="Section navigation">
          <SidebarNav label="Sections" items={NAV_ITEMS} />
        </Sidebar>
      }
    >
      <main style={{ flex: 1, minWidth: 0 }}>
        <MockContent />
      </main>
    </TwoColumnLayout>
  ),
};
