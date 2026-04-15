import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Callout } from './Callout';
import { Zap } from 'lucide-react';

/**
 * ## Callout
 *
 * Coloured aside for tips, warnings, and featured notes.
 *
 * - **default** — pink background (brand callout)
 * - **info** — neutral surface
 * - **tip** — seafoam/green tint
 * - **warn** — yellow tint
 * - **danger** — red tint
 *
 * Each variant ships with a default Lucide icon. Pass `icon` to override
 * or `icon={null}` to suppress.
 *
 * Canonical CSS: `artifacts/style 260118.css` §.st-callout
 */
const meta: Meta<typeof Callout> = {
  title: 'Primitives/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    // Options synced with schemas/sections/calloutSection.ts → variant (SUG-47)
    variant: {
      control: { type: 'select' },
      options: ['default', 'info', 'tip', 'warn', 'danger'],
    },
    title: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Callout>;

// ── Default (pink) ───────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    children: (
      <p>
        This is the default Sugartown callout — pink background with a heart
        icon. Use it for general featured notes and brand-aligned highlights.
      </p>
    ),
  },
};

// ── Info ──────────────────────────────────────────────────────────────────────

export const InfoVariant: Story = {
  name: 'Info',
  args: {
    variant: 'info',
    title: 'Information',
    children: (
      <p>
        The design system uses a three-tier token architecture: primitives,
        semantic aliases, and component tokens.
      </p>
    ),
  },
};

// ── Tip ──────────────────────────────────────────────────────────────────────

export const TipVariant: Story = {
  name: 'Tip',
  args: {
    variant: 'tip',
    title: 'Pro tip',
    children: (
      <p>
        Use <code>variant=&quot;listing&quot;</code> on Card for archive-density layouts.
        It applies UI font, 3-line clamp, and reduced min-height.
      </p>
    ),
  },
};

// ── Warn ─────────────────────────────────────────────────────────────────────

export const WarnVariant: Story = {
  name: 'Warn',
  args: {
    variant: 'warn',
    title: 'Caution',
    children: (
      <p>
        Token drift between <code>packages/design-system</code> and{' '}
        <code>apps/web</code> causes guaranteed-invalid CSS values. Always update
        both files in the same commit.
      </p>
    ),
  },
};

// ── Danger ───────────────────────────────────────────────────────────────────

export const DangerVariant: Story = {
  name: 'Danger',
  args: {
    variant: 'danger',
    title: 'Breaking change',
    children: (
      <p>
        Removing a token from <code>tokens.css</code> without migrating all
        consumers will cause silent visual regressions. The browser falls back
        to UA defaults (e.g. Times New Roman for <code>font-family</code>).
      </p>
    ),
  },
};

// ── With Title ───────────────────────────────────────────────────────────────

export const WithTitle: Story = {
  args: {
    title: 'Design System Update',
    children: (
      <p>
        Five new components have been added in the v7c migration: Table,
        Blockquote, Callout, CodeBlock, and Media with duotone overlay.
      </p>
    ),
  },
};

// ── With Custom Icon ─────────────────────────────────────────────────────────

export const WithCustomIcon: Story = {
  name: 'With Custom Icon',
  args: {
    variant: 'tip',
    icon: <Zap size={18} />,
    title: 'Quick win',
    children: (
      <p>
        Custom Lucide icon overrides the default per-variant icon. Pass any
        React node as the <code>icon</code> prop.
      </p>
    ),
  },
};

// ── No Icon ──────────────────────────────────────────────────────────────────

export const NoIcon: Story = {
  name: 'No Icon',
  args: {
    icon: null,
    children: (
      <p>
        Pass <code>icon=&#123;null&#125;</code> to suppress the icon entirely.
        The callout still renders with its coloured background and border.
      </p>
    ),
  },
};

// ── Stress Test: Long Content ────────────────────────────────────────────────

export const StressTestLongContent: Story = {
  name: 'Stress Test / Long Content',
  args: {
    variant: 'info',
    title: 'Extended explanation',
    children: (
      <>
        <p>
          This callout contains multiple paragraphs to test vertical rhythm
          and spacing within the body. The content should flow naturally with
          consistent line-height and paragraph gaps.
        </p>
        <p>
          Token architecture follows a three-tier model: raw primitives at the
          base level provide the atomic values; semantic aliases map intent to
          primitives; component tokens bind specific components to the semantic
          layer. This ensures that changing a single primitive cascades through
          the entire system predictably.
        </p>
        <p>
          When drift occurs between the two token files — the canonical web
          file and the design system mirror — the browser silently falls back
          to user-agent defaults. This is invisible in development unless you
          run <code>pnpm validate:tokens</code> explicitly.
        </p>
      </>
    ),
  },
};

// ── Stress Test: Nested Elements ─────────────────────────────────────────────

export const StressTestNestedElements: Story = {
  name: 'Stress Test / Nested Elements',
  args: {
    variant: 'tip',
    title: 'Code and lists inside callouts',
    children: (
      <>
        <p>Callouts can contain rich content including lists and inline code:</p>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
          <li>
            <code>--st-color-brand-primary</code> — Sugartown Pink (#ff247d)
          </li>
          <li>
            <code>--st-color-seafoam-500</code> — Seafoam (#2BD4AA)
          </li>
          <li>
            <code>--st-color-lime-500</code> — Lime (#D1FF1D)
          </li>
        </ul>
        <p>
          All tokens follow the <code>--st-*</code> namespace convention.
        </p>
      </>
    ),
  },
};

// ── All Variants (overview) ──────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Callout variant="default" title="Default">
        <p>Pink brand callout with heart icon.</p>
      </Callout>
      <Callout variant="info" title="Info">
        <p>Neutral surface callout with info icon.</p>
      </Callout>
      <Callout variant="tip" title="Tip">
        <p>Seafoam tint callout with lightbulb icon.</p>
      </Callout>
      <Callout variant="warn" title="Warning">
        <p>Yellow tint callout with alert triangle icon.</p>
      </Callout>
      <Callout variant="danger" title="Danger">
        <p>Red tint callout with alert octagon icon.</p>
      </Callout>
    </div>
  ),
};

// ═══════════════════════════════════════════════════════════════════
// SNAPSHOT — Chromatic composite (all variants in one screenshot)
// ═══════════════════════════════════════════════════════════════════

/**
 * Chromatic snapshot — all five variants composed into a single
 * screenshot for VRT baseline.
 */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: {
    chromatic: { disableSnapshot: false },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' }}>
      <Callout variant="default" title="Default">
        <p>Pink brand callout with default heart icon.</p>
      </Callout>
      <Callout variant="info" title="Info">
        <p>Neutral surface callout with info icon.</p>
      </Callout>
      <Callout variant="tip" title="Tip">
        <p>Seafoam tint callout with lightbulb icon.</p>
      </Callout>
      <Callout variant="warn" title="Warning">
        <p>Yellow tint callout with alert triangle icon.</p>
      </Callout>
      <Callout variant="danger" title="Danger">
        <p>Red tint callout with alert octagon icon.</p>
      </Callout>
      <Callout variant="info" title="No icon variant" icon={null}>
        <p>Same surface, icon suppressed.</p>
      </Callout>
    </div>
  ),
};
