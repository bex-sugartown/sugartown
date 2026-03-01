import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Chip } from '../Chip/Chip';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: { control: { type: 'select' }, options: ['default', 'compact', 'listing', 'dark', 'metadata'] },
    eyebrow: { control: 'text' },
    title: { control: 'text' },
    titleHref: { control: 'text' },
    subtitle: { control: 'text' },
    href: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

// ─── Core variants ────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    eyebrow: 'Case Study',
    title: 'Building a Token-Driven Design System',
    subtitle: 'Sugartown Pink · 2024',
    children: (
      <p>
        How we extracted a scalable three-tier token architecture from a live
        WordPress theme, migrated to CSS custom properties, and shipped Storybook
        alongside the production codebase.
      </p>
    ),
  },
};

export const WithFooterChips: Story = {
  args: {
    eyebrow: 'Article',
    title: 'Typography at Scale: Variable Fonts in Production',
    subtitle: 'Engineering · Jan 2024',
    children: (
      <p>
        An exploration of variable font axes, performance trade-offs, and how
        font subsetting enabled us to cut web font load time by 60%.
      </p>
    ),
    footer: (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <Chip label="Design Systems" colorHex="#D97706" />
        <Chip label="Performance"    colorHex="#9CA3AF" />
        <Chip label="typography"     colorHex="#9CA3AF" />
      </div>
    ),
  },
};

export const WithTitleLink: Story = {
  args: {
    eyebrow: 'Node',
    title: 'Atomic Design Methodology',
    titleHref: '/nodes/atomic-design',
    subtitle: 'Design Patterns',
    children: (
      <p>
        Brad Frost's hierarchical model for creating reusable design systems:
        atoms, molecules, organisms, templates, and pages.
      </p>
    ),
  },
};

export const FullCardLink: Story = {
  args: {
    eyebrow: 'Project',
    title: 'Sugartown Design System',
    href: '/case-studies/design-system',
    subtitle: '2023 — present',
    children: (
      <p>
        End-to-end design token architecture, component library, and Storybook
        instance for the Sugartown content platform.
      </p>
    ),
    footer: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Chip label="Design Systems" colorHex="#D97706" />
        <Chip label="Engineering"    colorHex="#059669" />
      </div>
    ),
  },
};

// ─── Size variants ────────────────────────────────────────────────────────────

export const Compact: Story = {
  args: {
    eyebrow: 'Tag',
    title: 'CSS Custom Properties',
    variant: 'compact',
    children: <p>A reference entry on custom property scope, inheritance, and fallback chains.</p>,
  },
};

// ─── Listing variant (archive density) ───────────────────────────────────────
// Matches the production archive grid cards on /articles, /case-studies,
// /knowledge-graph. Uses the real Card component with variant="listing".

/** Status badge helper — inline styles for stories (production uses CSS module) */
function StatusBadge({ status, label }: { status: string; label: string }) {
  const STATUS_COLORS: Record<string, string> = {
    active: '#059669', shipped: '#d97706', 'in-progress': '#2563eb',
    paused: '#9ca3af', archived: '#6b7280', draft: '#7c3aed', explored: '#0891B2',
  };
  const c = STATUS_COLORS[status] ?? '#9ca3af';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.15em 0.5em', borderRadius: '4px',
      fontFamily: 'var(--st-font-mono)', fontSize: '0.6rem',
      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      background: `color-mix(in srgb, ${c} 12%, transparent)`,
      border: `1px solid color-mix(in srgb, ${c} 35%, transparent)`,
      color: c,
    }}>
      {label}
    </span>
  );
}

/** Meta line helper — mono, muted, uppercase */
function MetaLine({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--st-font-mono)', fontSize: '0.7rem', fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: 'var(--st-color-text-muted, #94A3B8)', margin: 0,
    }}>
      {children}
    </p>
  );
}

export const Listing: Story = {
  args: {
    eyebrow: 'Article',
    title: 'The Great iCloud Divorce: A Tale of Two AIs',
    variant: 'listing',
    children: (
      <p>Or: How I Learned to Stop Worrying and Love sudo killall fileproviderd.</p>
    ),
    footer: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip label="AI Collaboration" size="sm" />
          <Chip label="agentic caucus" size="sm" />
          <Chip label="workflow" size="sm" />
        </div>
        <MetaLine>Feb 15, 2026</MetaLine>
      </div>
    ),
  },
};

export const ListingWithStatusBadge: Story = {
  args: {
    variant: 'listing',
    eyebrow: (
      <>
        <span>Case Study</span>
        <StatusBadge status="shipped" label="Shipped" />
      </>
    ),
    title: 'Sugartown Platform Roadmap',
    children: (
      <p>Aligned platform milestones across CMS and design system tracks.</p>
    ),
    footer: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip label="Product & Platform Strategy" colorHex="#D97706" size="sm" />
          <Chip label="design system" colorHex="#D97706" size="sm" />
        </div>
        <MetaLine>Platform · Jan 4, 2026</MetaLine>
      </div>
    ),
  },
};

// ─── Dark variant ─────────────────────────────────────────────────────────────

export const Dark: Story = {
  args: {
    eyebrow: 'Featured',
    title: 'Sugartown Pink: The Full Story',
    subtitle: 'Brand identity · 2023',
    variant: 'dark',
    children: (
      <p>
        The origin of our signature pink — from WCAG contrast research to the final
        #ff247d that became the cornerstone of the design system.
      </p>
    ),
    footer: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Chip label="Brand" colorHex="#7C3AED" />
        <Chip label="Strategy" colorHex="#9CA3AF" />
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px', background: '#0f1117', padding: '2rem', borderRadius: '12px' }}>
        <Story />
      </div>
    ),
  ],
};

// ─── Card grid ────────────────────────────────────────────────────────────────

export const CardGrid: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        maxWidth: '960px',
      }}
    >
      <Card
        eyebrow="Case Study"
        title="Token-Driven Design Systems"
        subtitle="Engineering · 2024"
        href="/case-studies/tokens"
        footer={
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Chip label="Design Systems" colorHex="#D97706" />
            <Chip label="Engineering"    colorHex="#059669" />
          </div>
        }
      >
        <p>How we shipped a scalable three-tier token system alongside Storybook and production code.</p>
      </Card>

      <Card
        eyebrow="Article"
        title="Variable Fonts in Production"
        subtitle="Performance · Jan 2024"
        href="/articles/variable-fonts"
        footer={
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Chip label="typography"  colorHex="#9CA3AF" />
            <Chip label="performance" colorHex="#9CA3AF" />
          </div>
        }
      >
        <p>Subsetting strategies and axis configuration that cut font load time by 60%.</p>
      </Card>

      <Card
        eyebrow="Node"
        title="Atomic Design Methodology"
        subtitle="Design Patterns"
        href="/nodes/atomic-design"
        variant="compact"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Chip label="Design Systems" colorHex="#D97706" />
          </div>
        }
      >
        <p>Brad Frost's hierarchical model for reusable design systems.</p>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
  decorators: [],
};

// ─── Title-only minimal card ──────────────────────────────────────────────────

export const TitleOnly: Story = {
  args: {
    title: 'Minimal Card — Title Only',
  },
};

// ─── Listing grid (archive page pattern) ─────────────────────────────────────
// Replaces the old ArchiveCardDemo — now uses the real Card component with
// variant="listing" and ReactNode eyebrow for status badge composition.

export const ListingGrid: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
      maxWidth: '700px',
    }}>
      {/* Article — no status */}
      <Card
        variant="listing"
        eyebrow="Article"
        title="The Great iCloud Divorce: A Tale of Two AIs"
        footer={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Chip label="AI Collaboration" size="sm" />
              <Chip label="agentic caucus" size="sm" />
              <Chip label="workflow" size="sm" />
            </div>
            <MetaLine>Feb 15, 2026</MetaLine>
          </div>
        }
      >
        <p>Or: How I Learned to Stop Worrying and Love sudo killall fileproviderd.</p>
      </Card>

      {/* Case Study — shipped */}
      <Card
        variant="listing"
        eyebrow={<><span>Case Study</span><StatusBadge status="shipped" label="Shipped" /></>}
        title="Sugartown Platform Roadmap"
        footer={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Chip label="Product & Platform Strategy" colorHex="#D97706" size="sm" />
              <Chip label="design system" colorHex="#D97706" size="sm" />
            </div>
            <MetaLine>Platform · Jan 4, 2026</MetaLine>
          </div>
        }
      >
        <p>Aligned platform milestones across CMS and design system tracks.</p>
      </Card>

      {/* Node — explored */}
      <Card
        variant="listing"
        eyebrow={<><span>Node</span><StatusBadge status="explored" label="Explored" /></>}
        title="Sugartown Platform Roadmap (updated)"
        footer={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Chip label="Product & Platform Strategy" colorHex="#D97706" size="sm" />
              <Chip label="content-as-code" size="sm" />
              <Chip label="design system" size="sm" />
            </div>
            <MetaLine>Mixed · Jan 4, 2026</MetaLine>
          </div>
        }
      >
        <p>A content-as-code platform that treats ideas, artifacts, and career data as structured systems.</p>
      </Card>
    </div>
  ),
  parameters: { layout: 'padded' },
  decorators: [],
};

// ─── Metadata variant (detail page sidebar) ───────────────────────────────────
// Non-interactive information surface for content detail pages.
// Suppresses hover lift, removes min-height. Used by MetadataCard on
// NodePage / ArticlePage / CaseStudyPage.

/** Label/value field row — mirrors MetadataCard.module.css .field */
function MetaField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <p style={{
        fontFamily: 'var(--st-font-mono)', fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--st-color-text-secondary, #525252)', margin: 0,
      }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--st-font-ui)', fontSize: '0.875rem', margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

/** Seafoam outlined tool chip — mirrors MetadataCard.module.css .toolChip */
function ToolChip({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '0.3em 0.6em',
      borderRadius: '4px', fontFamily: 'var(--st-font-mono)',
      fontSize: '0.7rem', fontWeight: 400, whiteSpace: 'nowrap',
      background: 'color-mix(in srgb, #2BD4AA 8%, transparent)',
      border: '1px solid color-mix(in srgb, #2BD4AA 35%, transparent)',
      color: '#2BD4AA',
    }}>
      {label}
    </span>
  );
}

export const MetadataNode: Story = {
  name: 'Metadata — Node (all fields)',
  render: () => (
    <Card variant="metadata" as="aside">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <MetaField label="Type"         value="Node" />
        <MetaField label="Status"       value="Explored" />
        <MetaField label="AI Tool"      value="Claude Sonnet 4.5" />
        <MetaField label="Conversation" value="Technical Deep-Dive" />
        <MetaField label="Published"    value="February 15, 2026" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{
            fontFamily: 'var(--st-font-mono)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--st-color-text-secondary, #525252)', margin: 0,
          }}>
            Tools
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <ToolChip label="Claude Sonnet" />
            <ToolChip label="Vite" />
            <ToolChip label="React" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{
            fontFamily: 'var(--st-font-mono)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--st-color-text-secondary, #525252)', margin: 0,
          }}>
            Classification
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <Chip label="AI Collaboration" size="sm" />
            <Chip label="Design Systems"   size="sm" />
          </div>
        </div>
      </div>
    </Card>
  ),
};

export const MetadataArticle: Story = {
  name: 'Metadata — Article (minimal)',
  render: () => (
    <Card variant="metadata" as="aside">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <MetaField label="Type"      value="Article" />
        <MetaField label="Status"    value="Active" />
        <MetaField label="Published" value="January 4, 2026" />
      </div>
    </Card>
  ),
};

export const MetadataCaseStudy: Story = {
  name: 'Metadata — Case Study (client + role)',
  render: () => (
    <Card variant="metadata" as="aside">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <MetaField label="Type"      value="Case Study" />
        <MetaField label="Status"    value="Shipped" />
        <MetaField label="Client"    value="Sugartown Creative" />
        <MetaField label="Role"      value="Lead Designer & Engineer" />
        <MetaField label="Published" value="March 1, 2026" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{
            fontFamily: 'var(--st-font-mono)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--st-color-text-secondary, #525252)', margin: 0,
          }}>
            Tools
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <ToolChip label="Figma" />
            <ToolChip label="Sanity" />
            <ToolChip label="React" />
          </div>
        </div>
      </div>
    </Card>
  ),
};

export const MetadataProject: Story = {
  name: 'Metadata — Project (projectId, priority, KPIs, taxonomy)',
  render: () => (
    <Card variant="metadata" as="aside">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <MetaField label="Project ID" value="PROJ-001" />
        <MetaField label="Status"     value="🚀 Active" />
        <MetaField label="Priority"   value="🟠 High" />
        {/* KPI list — mirrors MetadataCard.module.css .kpiList / .kpiItem */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{
            fontFamily: 'var(--st-font-mono)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--st-color-text-secondary, #525252)', margin: 0,
          }}>
            KPIs
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {[
              { metric: 'Monthly Active Users', current: '742', target: '1,000' },
              { metric: 'Content Nodes Published', current: '18', target: '30' },
              { metric: 'Case Studies Shipped', current: '2', target: '5' },
            ].map(({ metric, current, target }) => (
              <li key={metric} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {metric}
                </span>
                <span style={{ fontFamily: 'var(--st-font-mono)', fontSize: '0.7rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <strong>{current}</strong>
                  <span style={{ color: 'var(--st-color-text-secondary, #525252)' }}> / {target}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* Taxonomy chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{
            fontFamily: 'var(--st-font-mono)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--st-color-text-secondary, #525252)', margin: 0,
          }}>
            Category
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <Chip label="AI Collaboration" colorHex="#0099FF" size="sm" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{
            fontFamily: 'var(--st-font-mono)', fontSize: '0.6rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--st-color-text-secondary, #525252)', margin: 0,
          }}>
            Tags
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <Chip label="agile" size="sm" />
            <Chip label="sanity-cms" size="sm" />
          </div>
        </div>
      </div>
    </Card>
  ),
};
